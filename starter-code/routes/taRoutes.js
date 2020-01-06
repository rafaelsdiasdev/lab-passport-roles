const express = require("express");
const taRoutes = express.Router();
// Require user model
const Course = require('../models/course')
const checkRoles = require('./checkRoles')

taRoutes.get("/painel/ta/create-course", checkRoles('TA'), (req, res, next) => {
  res.render("ta/create-course");
});

taRoutes.get("/painel/ta", checkRoles('TA'), (req, res, next) => {
  const { name } = req.body
  Course.find(name)
    .then(course => {
      res.render("ta/index", { course })
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
      res.render('ta/course-detail', { course })
    })
    .catch(error => {
      console.log('Error while retrieving courses details: ', error);
    })
})

taRoutes.get("/courses", (req, res, next) => {
  const { name } = req.body
  Course.find(name)
    .then(course => {
      res.render("any/courses", { course })
    })
    .catch(err => err)
})

taRoutes.get("/painel/ta/:id/edit", checkRoles("TA"), async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    res.render("ta/edit", course);
  } catch (err) {
    next(err);
  }
});

taRoutes.post("/course/:id/edit", async (req, res, next) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/painel/ta`);
  } catch (err) {
    next(err);
  }
});

taRoutes.post('/course/delete/:id/', (req, res, next) => {
  const { id } = req.params;
  Course.findByIdAndDelete(id)
    .then((course) => {
      res.redirect('/painel/ta');
    })
    .catch((err) => console.log(err))
});


module.exports = taRoutes