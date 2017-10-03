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
            //TODO chirp lent 150 max
            teamsService.createChirp(data)
                .then(function(data){
                    auth.showInfo('Chirp published');
                    ctx.redirect('#/mainFeed');
                });
        });

        // Discover
        this.get('#/discover', function (ctx) {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                navigation: './templates/common/navigation.hbs'
            }).then(function () {
                this.partial('./templates/viewDiscover/viewDiscoverPage.hbs');
            });
        });

        // Me
        this.get('#/me', function (ctx) {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                navigation: './templates/common/navigation.hbs',
                viewMeForm: './templates/viewMe/viewMeForm.hbs'
            }).then(function () {
                this.partial('./templates/viewMe/viewMePage.hbs');
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