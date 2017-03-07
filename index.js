require('dotenv').config({ silent: true })
const express = require('express') // receiving the requests and handling them accordingly
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('./config/ppConfig')
const mongoose = require('mongoose') // key to access MongoDB
const bodyParser = require('body-parser') // parsing relevant data
// const Comment = require('./models/comment_model')
// const Post = require('./models/post_model') // MongoDB schema...
// const User = require('./models/user_model')
// const GuestInteraction = require('./models/guestinteraction_model')
// const requestify = require('requestify')
// const http = require('http')
const cors = require('cors')
const ejsLayouts = require('express-ejs-layouts') // ejs layout for organisation
const methodOverride = require('method-override') // browsers only recognise GET and POST. Not delete and put.
const flash = require('connect-flash')
const doYouHaveACookie = require('./middleware/doYouHaveACookie')
const isLoggedIn = require('./middleware/isLoggedIn')

const path = require('path') // --????

const app = express()
const router = express.Router()

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/project2') // the database folder
mongoose.Promise = global.Promise // promise are callbacks which can utiilse .get, .then method for neater, more elegant and more maintanable code.

// app.set / .use here are executed in order so order matters!!!
app.use(session({  // session must be before passport
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: null
  }
}))
app.use(cors())

app.use(passport.initialize())  // checks cookies for userID ... req.user
app.use(passport.session())
app.use(flash())

app.use(function (req, res, next) {
  // before every route, attach the flash messages and current user to res.locals
  res.locals.alerts = req.flash() // res.locals is an object created by express. Alerts are then created as a variable and made accessible in views
  res.locals.currentUser = req.user // req.user established by passport
  // res.locals.cookie = req.cookies
  next()
})

app.set('view engine', 'ejs') // renderer to html
app.use(ejsLayouts) // res.render (index,)
app.use(methodOverride('_method'))
app.use(cookieParser())
app.use(doYouHaveACookie)
app.use(express.static(path.join(__dirname, 'public'))) // 'views' folder is for backend edits of pages... static html file will be automatically created by ejs
app.use(bodyParser.json()) //
app.use(bodyParser.urlencoded({extended: true})) // if using CURL, should be app.use(bodyParser.json()) OR need to change the content-type ecause we're getting data objects rather URLencoded
app.use(require('morgan')('dev'))

app.get('/about', (req, res) => {
  res.render('aboutwddit')
})

app.use('/auth', require('./controllers/user_controllers'))

app.get('/post/search', require('./controllers/post_controllers'))
app.use('/post', require('./controllers/comment_controllers'))

/* see if it's possible to access per user posts for anon users*/
// app.get('/user/:userid', require('./controllers/post_controllers'))

app.use('/user', require('./controllers/post_controllers'))

app.get('/', require('./controllers/post_controllers'))

app.use(isLoggedIn) // anything after this will need to be logged in.

app.get('/user/:userid/edit', require('./controllers/post_controllers'))
app.get('/user/:userid/create', require('./controllers/post_controllers'))
app.get('/user/:userid/delete', require('./controllers/post_controllers'))
app.get('/user/:userid/editprofile', require('./controllers/post_controllers'))

app.get('/post/:postid/create', require('./controllers/comment_controllers')) // this gives direct access to comments by commenter
app.get('/post/:postid/edit', require('./controllers/comment_controllers'))
app.get('/post/:postid/delete', require('./controllers/comment_controllers'))

var server = app.listen(process.env.PORT || 3000) // this allows us to configure the environment variables
console.log('Hallelujah, server connected!')

// we export the running server so we can use it in testing otherwise nothing runs!!
module.exports = server
