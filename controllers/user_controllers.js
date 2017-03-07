const express = require('express')
const router = express.Router()
const User = require('../models/user_model')
const passport = require('../config/ppConfig')
const flash = require('connect-flash')
const Post = require('../models/post_model')
const GuestInteraction = require('../models/guestinteraction_model')
const UserInteraction = require('../models/userinteraction_model')

router.get('/signup', function (req, res) {
  res.render('auth/signup')
})

router.post('/signup', function (req, res) {
  console.log('cookies is present ', req.cookies.guestid)
  User.findOne({ email: req.body.email }, function (err, results) {
    if (err) {
      req.flash('error', 'sign up address exist')
      console.log('the error is ', err)
      res.redirect('/auth/login')
    } else if (results === null) {
      console.log('before user is created')
      User.create({
        guestid: req.cookies.guestid,
        name: {
          firstname: req.body.firstname,
          lastname: req.body.lastname
        },
        email: req.body.email,
        password: req.body.password,
        website: req.body.website,
        skillsintro: req.body.skillsintro,
        role: req.body.role
      }, function (err, createdUser) {
        if (err) {
          console.log('user doc creation error ', err)
          req.flash('error', 'Sign-up email addresses must be unique. Please try again.')
          res.redirect('back')
        } else {
          console.log('user is now created...proceeding to save change interaction status')
          GuestInteraction.findOneAndUpdate({_id: req.cookies.guestid},
            { guestuserRegistered: true
            }, function (err, results) {
              if (err) console.log('error updating guestuser conversion status')
              else console.log('guest conversion status update successful', results)
            })
          UserInteraction.create({
            _id: createdUser._id,
            guestid: createdUser.guestid,
            userPageViewCount: 1
          })
          req.flash('success', 'Account has been created. Please log in')
          res.redirect('/auth/login')
        }
      })
    } else {
      req.flash('existing email found')
      res.redirect('/auth/login')
    }
  })
})

router.get('/login', function (req, res) {
  res.render('auth/login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/user',
  failureRedirect: '/auth/login',
  failureFlash: 'Invalid username and/or password',
  successFlash: 'You have logged in'
}))

router.get('/logout', function (req, res) {
  req.logout()
  req.flash('success', 'logged out')
  console.log('logout works')
  res.redirect('/')
})

module.exports = router
