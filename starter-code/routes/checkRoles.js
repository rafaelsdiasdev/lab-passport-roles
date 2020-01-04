const checkRoles = (role) => {
  return function (req, res, next) {
    // console.log(req.user.role, role)
    if (req.isAuthenticated()) {
      if (req.user.role === role) {
        return next();
      } else {
        res.redirect('/login')
      }
    } else {
      res.redirect('/login')
    }
  }
}

module.exports = checkRoles