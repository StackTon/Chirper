$(() => {
    const app = Sammy("#main", function () {
        this.use("Handlebars", "hbs");

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
                }).catch(auth.handleError)
        });

        // Register
        this.get('#/register', function (ctx) {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                registerForm: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/registerPage.hbs')
            })
        });
        this.post('#/register', function (ctx) {
            let username = ctx.params.username;
            let password = ctx.params.password;
            let repeatPassword = ctx.params.repeatPass;

            //TODO

            auth.register(username, password, repeatPassword).then(function (userInfo) {
                auth.saveSession(userInfo);
                auth.showInfo('Registration was successful!');
                ctx.redirect('#/mainFeed');
            }).catch(auth.handleError);
        });

        // Main Feed
        this.get('#/mainFeed', function (ctx) {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                navigation: './templates/common/navigation.hbs',
                viewFeedForm: './templates/viewFeed/viewFeedForm.hbs'
            }).then(function () {
                this.partial('./templates/viewFeed/viewFeedPage.hbs');
            })
        })

        // Discover
        this.get('#/discover', function (ctx) {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                navigation: './templates/common/navigation.hbs'
            }).then(function () {
                this.partial('./templates/viewDiscover/viewDiscoverPage.hbs')
            })
        });

        // Me
        this.get('#/me', function (ctx) {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                navigation: './templates/common/navigation.hbs',
                viewMeForm: './templates/viewMe/viewMeForm.hbs'
            }).then(function(){
                this.partial('./templates/viewMe/viewMePage.hbs');
            })
        });

        // Logout
        this.get('#/logout', function (ctx) {
            auth.logout()
            sessionStorage.clear();
            ctx.redirect('#');
            auth.showInfo('Logout was successful!')
        })


        function displayLogin(ctx) {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/loginPage.hbs')
            })
        }
    })
    app.run();
})