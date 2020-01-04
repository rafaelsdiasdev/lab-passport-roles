const express = require("express");
const anyRoutes = express.Router();
// Require user model
const User = require('../models/user')
// Add passport 
const passport = require('passport')
const ensureAuthenticated = require('./auth')

const checkId = () => {
  return function (req, res, next) {
    // console.log(req.user.id, req.params.id)
    if (req.user.id === req.params.id) {
      return next();
    } else {
      res.redirect(`/show/${req.params.id}`)
    }
  }
}

anyRoutes.get('/show/', ensureAuthenticated, (req, res, next) => {
  const { username } = req.body
  User.find(username)
    .then(user => {
      res.render("any/show", { user });
    })
    .catch(err => err)
});

anyRoutes.get('/show/:id', (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      res.render('any/profile', req.params.id === req.user.id ? { user, message: "Edit", checkPainelBoss: "Painel Control", checkPainelTA: "Painel Control" } : { user })
    })
    .catch(error => {
      console.log('Error while retrieving profiles details: ', error);
    })
})

anyRoutes.get("/login", (req, res, next) => {
  res.render("any/login", { "message": req.flash("error") });
});

anyRoutes.post("/login", passport.authenticate("local", {
  successRedirect: "/show",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

anyRoutes.get('/show', (req, res) => {
  const { username, role } = req.body
  User.find(username, role)
    .then(user => {
      // console.log(user)
      res.render('any/show', { user })
    })
    .catch(err => err)
})

anyRoutes.get("/show/:id/edit", checkId(), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("any/edit", user);

  } catch (err) {
    next(err);
  }
});

anyRoutes.post("/passport/:id/edit", async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/show/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

anyRoutes.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

// const ensureLogin = require("connect-ensure-login");
// anyRoutes.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
//   res.render("passport/private", { user: req.user });
// });

module.exports = anyRoutes;