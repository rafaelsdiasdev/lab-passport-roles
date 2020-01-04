const express = require("express");
const taRoutes = express.Router();
// Require user model
const Course = require('../models/course')
const User = require('../models/user')
// Add bcrypt to encrypt passwords
const bcrypt = require('bcrypt')
const bcryptSalt = 10;
// Add passport 
const passport = require('passport')
const ensureAuthenticated = require('./auth')
const checkRoles = require('./checkRoles')

taRoutes.get("/painel/ta/create-course", checkRoles('TA'), (req, res, next) => {
  res.render("ta/create-course");
});


taRoutes.get("/painel/ta", checkRoles('TA'), (req, res, next)=>{
  const {name} = req.body
  Course.find(name)
  .then(course =>{
    res.render("ta/index", {course})
  })
  .catch(err => err)
})

taRoutes.post("/painel/ta/create-course", (req, res, next) => {
  const { name } = req.body;
  const { description } = req.body;
  const { teacher } = req.body

  if (name === "" || description === "") {
    res.render("ta/create-course", { message: "Indicate name and description" });
    return;
  }

  Course.findOne({ name })
    .then(course => {
      if (course !== null) {
        res.render("ta/create-course", { message: `The course: ${course.name}, already exists` });
        return;
      }

      // const salt = bcrypt.genSaltSync(bcryptSalt);
      // const hashPass = bcrypt.hashSync(password, salt);

      const newCourse = new Course({
        name,
        description,
        teacher
      });

      newCourse.save((err) => {
        if (err) {
          res.render("ta/create-course", { message: "Something went wrong" });
        } else {
          res.redirect("/");
        }
      });
    })
    .catch(error => {
      next(error)
    })
});

taRoutes.get('/painel/ta/:id', (req, res, next) => {
  Course.findById(req.params.id)
    .then(course => {
      res.render('ta/course-detail', {course})
    })
    .catch(error => {
      console.log('Error while retrieving courses details: ', error);
    })
})

module.exports = taRoutes