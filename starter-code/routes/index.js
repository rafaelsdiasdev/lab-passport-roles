const express = require('express');
const router = express.Router();
const User = require('../models/user')

/* GET home page */
router.get('/', (req, res, next) => {
  const { username } = req.body
  User.find(username)
    .then(user => {
      if (req.isAuthenticated()) {
        let loggedUser = user.filter(elem => elem.id === req.session.passport.user)
        if(loggedUser[0].role === "Student"){
          res.render('index', { logout: "Logout", user: loggedUser[0], listStudents: "List Students" });
        }else{
          res.render('index', { logout: "Logout", user: loggedUser[0], listUsers: "List Users" });
        }
      } else {
        res.render('index', { login: "Login" });
      }
    })
    .catch(err => err)
});

module.exports = router;
