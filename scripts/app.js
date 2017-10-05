$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        // Login
        this.get('index.html', displayLogin);
        this.get('#/login', displayLogin);
        this.post('#/login', function (ctx) {
            let username = ctx.params.username;
            let password = ctx.params.password;
            auth.login(username, password)
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    auth.showInfo('Login was successful!');
                    ctx.redirect('#/mainFeed');
                }).catch(auth.handleError);
        });

        // Register
        this.get('#/register', function (ctx) {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                registerForm: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/registerPage.hbs');
            });
        });
        this.post('#/register', function (ctx) {
            let username = ctx.params.username;
            let password = ctx.params.password;
            let repeatPassword = ctx.params.repeatPass;

            if (username.length < 5) {
                auth.showError('Username must be at least 5 length!');
                return;
            }

            if (password.length === 0) {
                auth.showError(`Password can't be empty!`);
                return;
            }

            if (password !== repeatPassword) {
                auth.showError("Passwords don't match!");
                return;
            }

            auth.register(username, password, repeatPassword).then(function (userInfo) {
                auth.saveSession(userInfo);
                auth.showInfo('Registration was successful!');
                ctx.redirect('#/mainFeed');
            }).catch(auth.handleError);
        });

        // Main Feed
        this.get('#/mainFeed', function (ctx) {
            let username = sessionStorage.getItem('username');
            ctx.username = username;
            teamsService.loadFollowing(username).then(function (following) {
                let subs = following[0].subscriptions;
                if (subs === undefined) {
                    subs = [];
                }
                teamsService.loadCountChirps(username)
                    .then(function (chirps) {
                        teamsService.loadFollowers(username)
                            .then(function (followers) {
                                ctx.chirps = chirps.length;
                                ctx.following = subs.length;
                                ctx.followers = followers.length;
                                teamsService.listAllChirps(JSON.stringify(subs))
                                    .then(function (articles) {
                                        for (let index = 0; index < articles.length; index++) {
                                            articles[index].time = calcTime(articles[index]._kmd.ect);
                                        }
                                        ctx.articles = articles;
                                        ctx.loadPartials({
                                            header: './templates/common/header.hbs',
                                            footer: './templates/common/footer.hbs',
                                            navigation: './templates/common/navigation.hbs',
                                            viewFeedForm: './templates/viewFeed/viewFeedForm.hbs',
                                            viewFeedArticle: './templates/viewFeed/viewFeedArticle.hbs'
                                        }).then(function () {
                                            this.partial('./templates/viewFeed/viewFeedPage.hbs');
                                        });
                                    });
                            });

                    });
            });
        });

        this.post('#/mainFeed', function (ctx) {
            let text = ctx.params.text;
            let username = sessionStorage.getItem('username');
            let data = {
                'text': text,
                'author': username
            };
            if(text.length > 150){
                auth.showError('Chirp length must be below 150 simvols!');
                return;
            }
            teamsService.createChirp(data)
                .then(function (data) {
                    auth.showInfo('Chirp published');
                    ctx.redirect('#/mainFeed');
                });
        });

        // Discover
        this.get('#/discover', function (ctx) {
            let username = sessionStorage.getItem('username');
            teamsService.loadAllUsers()
                .then(function (allUsers) {
                    for (let index = 0; index < allUsers.length; index++) {
                        if (allUsers[index].subscriptions === undefined) {
                            allUsers[index].subscriptions = [];
                        }
                        allUsers[index].followers = allUsers[index].subscriptions.length;
                        if (allUsers[index].username === username) {
                            delete allUsers[index];
                        }
                    }
                    ctx.users = allUsers;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        navigation: './templates/common/navigation.hbs',
                        user: './templates/viewDiscover/user.hbs'
                    }).then(function () {
                        this.partial('./templates/viewDiscover/viewDiscoverPage.hbs');
                    });
                });
        });

        // Me
        this.get('#/me', function (ctx) {
            ctx.username = sessionStorage.getItem('username');
            teamsService.loadFollowing(ctx.username)
                .then(function (following) {
                    let subs = following[0].subscriptions;
                    if (subs === undefined) {
                        subs = [];
                    }
                    teamsService.loadCountChirps(ctx.username)
                        .then(function (chirps) {
                            teamsService.loadFollowers(ctx.username)
                                .then(function (followers) {
                                    ctx.chirps = chirps.length;
                                    ctx.following = subs.length;
                                    ctx.followers = followers.length;
                                    teamsService.userChirps(ctx.username)
                                        .then(function (allChirps) {
                                            for (let index = 0; index < allChirps.length; index++) {
                                                allChirps[index].time = calcTime(allChirps[index]._kmd.ect);
                                            }
                                            ctx.allChirps = allChirps;
                                            ctx.loadPartials({
                                                header: './templates/common/header.hbs',
                                                footer: './templates/common/footer.hbs',
                                                navigation: './templates/common/navigation.hbs',
                                                viewMeForm: './templates/viewMe/viewMeForm.hbs',
                                                viewMeArticle: './templates/viewMe/viewMeArticle.hbs'
                                            }).then(function () {
                                                this.partial('./templates/viewMe/viewMePage.hbs');
                                            });
                                        });
                                });
                        });
                });

        });
        this.post('#/me', function (ctx) {
            let text = ctx.params.text;
            let username = sessionStorage.getItem('username');
            let data = {
                'text': text,
                'author': username
            };
            if(text.length > 150){
                auth.showError('Chirp length must be below 150 simvols!');
                return;
            }
            teamsService.createChirp(data)
                .then(function (data) {
                    auth.showInfo('Chirp published');
                    ctx.redirect('#/me');
                });
        });

        // Logout
        this.get('#/logout', function (ctx) {
            auth.logout();
            sessionStorage.clear();
            ctx.redirect('#');
            auth.showInfo('Logout was successful!');
        });


        function displayLogin(ctx) {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/loginPage.hbs');
            });
        }

        function calcTime(dateIsoFormat) {
            let diff = new Date - (new Date(dateIsoFormat));
            diff = Math.floor(diff / 60000);
            if (diff < 1) return 'less than a minute';
            if (diff < 60) return diff + ' minute' + pluralize(diff);
            diff = Math.floor(diff / 60);
            if (diff < 24) return diff + ' hour' + pluralize(diff);
            diff = Math.floor(diff / 24);
            if (diff < 30) return diff + ' day' + pluralize(diff);
            diff = Math.floor(diff / 30);
            if (diff < 12) return diff + ' month' + pluralize(diff);
            diff = Math.floor(diff / 12);
            return diff + ' year' + pluralize(diff);
            function pluralize(value) {
                if (value !== 1) return 's';
                else return '';
            }
        }
    });
    app.run();
});