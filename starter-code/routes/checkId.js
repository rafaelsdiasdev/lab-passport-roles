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

module.exports = checkId