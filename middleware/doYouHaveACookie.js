module.exports = function (req, res, next) {
  var cookie = req.cookies.guestid
  // console.log('req cookies contains: ', req.cookies.guestid)
  if (cookie === undefined) {
    var newId = randomstring(6)
    // console.log('guest Id is ', newId)
    res.cookie('guestid', newId, {maxAge: 900000, httpOnly: true})
    // console.log('cookie created successfully')
  } else {
    // console.log('cookie exists...', cookie)
  }
  next()
}

function randomstring (L) {
  var s = ''
  var randomchar = function () {
    var n = Math.floor(Math.random() * 62)
    if (n < 10) return n // 1-10
    if (n < 36) return String.fromCharCode(n + 55) // A-Z
    return String.fromCharCode(n + 61) // a-z
  }
  while (s.length < L) s += randomchar()
  return s
}
