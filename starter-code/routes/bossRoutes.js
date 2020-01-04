const express = require("express");
const bossRoutes = express.Router();
// Require user model
const User = require('../models/user')
// Add bcrypt to encrypt passwords
const bcrypt = require('bcrypt')
const bcryptSalt = 10;
// Add passport 
const passport = require('passport')
const ensureAuthenticated = require('./auth')
const checkRoles = require('./checkRoles')

bossRoutes.get("/painel/boss/create-user", checkRoles('Boss'), (req, res, next) => {
  res.render("boss/create-user");
});

bossRoutes.get("/painel/boss/", checkRoles('Boss'), (req, res, next)=>{
  const {username} = req.body
  User.find(username)
  .then(user =>{
    res.render("boss/create-user", {user})
  })
  .catch(err => err)
})

bossRoutes.post("/painel/boss/create-user", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role

  if (username === "" || password === "") {
    res.rendersignup("boss/create-user", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username })
    .then(user => {
      if (user !== null) {
        res.render("boss/create-user", { message: `The username: ${user.username}, already exists` });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass,
        role
      });

      newUser.save((err) => {
        if (err) {
          res.render("boss/create-user", { message: "Something went wrong" });
        } else {
          res.redirect("/show");
        }
      });
    })
    .catch(error => {
      next(error)
    })
});

bossRoutes.post('/delete/:id/', (req, res, next) => {
  const {id} = req.params;
  User.findByIdAndDelete(id)
  .then((user) => {
    res.redirect('/paineç/boss');
  })  
  .catch((err) => console.log(err))
});


module.exports = bossRoutes