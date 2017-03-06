module.exports = function (req, res, next) {
  if (!req.user._id) {
    req.flash('error', 'You must be logged in to access that page')
    res.redirect('/auth/login')
  } else {
    next()
  }
}
