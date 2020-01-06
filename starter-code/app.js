require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const passport = require('passport')
const flash = require("connect-flash");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user")
const bcrypt = require("bcrypt")
const FacebookStrategy = require('passport-facebook').Strategy;


mongoose
  .connect('mongodb://localhost/lab-passport-roles', { useNewUrlParser: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

passport.use(new FacebookStrategy({
  clientID: "480324299342191",
  clientSecret: "1df175c40c37173d5e08e34850881329",
  callbackURL: "http://localhost:3002/auth/facebook/callback"
},
  (accessToken, refreshToken, profile, done) => {
    // to see the structure of the data in received response:
    console.log("Facebook account details:", profile);

    User.findOne({ facebookID: profile.id, role: "Student", name: profile.displayName, username: "none" })
      .then(user => {
        console.log(profile)
        if (user) {
          done(null, user);
          return;
        }

        User.create({ facebookID: profile.id, role: "Student", name: profile.displayName, username: "none" })
          .then(newUser => {
            done(null, newUser);
          })
          .catch(err => done(err)); // closes User.create()
      })
      .catch(err => done(err)); // closes User.findOne()
  }
)
);

app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true
}));

passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


app.use(flash());

passport.use(new LocalStrategy({
  passReqToCallback: true
}, (req, username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));

app.use(passport.initialize());
app.use(passport.session());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

hbs.registerHelper('equal', function (lvalue, rvalue, options) {
  if (arguments.length < 3)
    throw new Error("Handlebars Helper equal needs 2 parameters");
  if (lvalue != rvalue) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

// default value for title local
app.locals.title = 'Ironhack - Lab';


// Routes middleware goes here
const index = require('./routes/index');
app.use('/', index);
const anyRoutes = require("./routes/anyRoutes");
app.use('/', anyRoutes);
const bossRoutes = require('./routes/bossRoutes')
app.use('/', bossRoutes)
const taRoutes = require('./routes/taRoutes')
app.use('/', taRoutes)


module.exports = app;
