var session = require('express-session');

exports.init = function (app) {
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 3600000
        }
    }));
}