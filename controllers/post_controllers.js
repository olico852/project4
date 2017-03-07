const GuestInteraction = require('../models/guestinteraction_model')
const UserInteraction = require('../models/userinteraction_model')
const Post = require('../models/post_model')
const User = require('../models/user_model')
const express = require('express')
const router = express.Router()
const flash = require('connect-flash')
const http = require('http')
const requestify = require('requestify')

var newsData = {}

// router.get('/', function (req, res) { // express gets triggered when someone types in '/' which is a request
//   res.redirect('/' + req.user._id) // server to respond with 'homepage'
// })

/* express gets triggered when URL is /:id.... posts by all users listed
his has to be further down as this address is more generic catch-all */

function userVerification (reqID, userID) {
  if (reqID == userID) return true
}

/* search through post title, article text and tags with keywords */
router.get('/post/search', (req, res) => {
  Post.find({'$text': { '$search': req.query.words } }, { score: { $meta: 'textScore' } })
  .sort({ score: { $meta: 'textScore' } })
  .populate('user')
  .exec(function (err, results) {
    if (err) {
      req.flash('error', 'error loading homepage...')
      res.redirect('back')
    } else {
      GuestInteraction.findById({_id: req.cookies.guestid}, function (err, results) {
        if (err) console.log('trouble accessing GuestInteraction model')
        if (results === null) {
          GuestInteraction.create({
            _id: req.cookies.guestid,
            guestuserPageViewCount: 1
          }, function (err, newGuest) {
            if (err) console.log('error creating newGuest entry')
            else { console.log('guest entry created') }
          })
        } else {
          if (results.guestuserRegistered === false) {
            results.guestuserPageViewCount += 1
            results.guestuserSearchterm.push(req.query.words)
            results.save(function (err, results) {
              if (err) console.log('error updating guest user data')
              else console.log('guest data update successful')
            })
          } else {
            UserInteraction.findOneAndUpdate({guestid: req.cookies.guestid},
              { $inc: {userPageViewCount: +1},
                $push: {userSearchterm: req.query.words}
              }, function (err, results) {
                if (err) console.log('error updating user interaction data')
                else console.log('user interaction data update successful')
              }
            )
          }
        }
      })
      res.render('post/searchresult', {articles: results, searchQuery: req.query})
    }
  })
})

/* get post create page */
router.get('/:userid/create', function (req, res) {
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    User.findById(req.user._id, function (err) {
      if (err) {
        req.flash('error', 'something may have gone wrong')
        req.redirect('/')
      }
      res.render('post/createpost', {fields: null})
    })
  }
})

/* create new post entry */
router.post('/:userid/create', function (req, res) {
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    if (req.body.title === '' || req.body.article === '') {
      req.flash('error', 'Required fields must be filled')
      res.render('post/createpost', {
        fields: {
          title: req.body.title,
          article: req.body.article,
          tags: req.body.tags
        }
      })
    } else {
      Post.create({
        user: req.user._id,
        title: req.body.title,
        article: req.body.article,
        tags: req.body.tags
      }, function (err, newPost) {
        if (err) res.status(500).render({errMsg: err})
        User.findById(req.user._id, function (err, user) {
          if (err) res.status(500).render({errMsg: err})
          user.posts.push(newPost._id)
          user.save()
          req.flash('success', 'Post created')
          res.redirect('/user/' + req.user._id)
        })
      }
    )
    }
  }
})

router.get('/:userid/editprofile', (req, res) => {
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    User.findById(req.user._id, function (err, profile) {
      if (err) res.status(500).render({errMsg: err})
      res.render('auth/editprofile', {userdetails: profile})
    })
  }
})

router.put('/:userid/editprofile', (req, res) => {
  console.log('Cookies: ', req.cookies)
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    User.findById(req.user._id, (err, updatedInfo) => {
      if (err) {
        req.flash('error', 'Profile update unsuccesful')
        res.redirect('/user/' + req.user.id + '/editprofile')
      } else {
        updatedInfo.name.firstname = req.body.firstname // in the form, the name of that field is meant for referencing
        updatedInfo.name.lastname = req.body.lastname
        updatedInfo.website = req.body.website
        updatedInfo.skillsintro = req.body.skillsintro
        updatedInfo.role = req.body.role
        updatedInfo.save(function (err) {
          (err) ? req.flash('error', 'Profile update unsuccessful') : req.flash('success', 'Profile updated')
          res.redirect('/user/' + req.user.id + '/editprofile')
        })
      }
    })
  }
})

router.get('/:userid/edit', function (req, res) {
  console.log('Cookies: ', req.cookies)
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    User
    .findById(req.user._id)
    .populate('posts')
    .exec(function (err, userArticles) {
      if (err) {
        req.flash('error', 'Something has gone wrong')
        res.redirect('/user/' + req.user.id)
      } else {
        res.render('post/postpage', {articles: userArticles})
      }
    })
  }
})

router.get('/:userid/edit/:postid', (req, res) => {
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    Post.find({user: req.user._id, _id: req.params.postid}, function (err, currentPost) {
      if (err) {
        req.flash('err', 'error occurred')
        res.redirect('/user/' + req.user.id)
      } else {
        res.render('post/editpost', {article: currentPost})
      }
    })
  }
})

/* update the post */
router.put('/:userid/edit/:postid', (req, res) => {
  Post.findOneAndUpdate({user: req.user._id, _id: req.params.postid}
  , {
    title: req.body.title,
    article: req.body.article,
    tags: req.body.tags
  }, {
    new: true,
    runValidators: true
  }, function (err, updatedPost) {
    (err) ? req.flash('error', 'Error updating post') : req.flash('success', 'Post updated')
    res.redirect('/user/' + req.user.id)
  }
  )
})

router.get('/:userid/comments', function (req, res) {
  User
    .findOne({_id: req.params.userid})
    .populate(
    { path: 'comments',
      populate: { path: 'postId' }
    })
    .exec(function (err, myComments) {
      if (err) return res.status(500).render({errMsg: err})
      // console.log('returned object ', myComments)
      areYouANewVisitor(req.cookies.guestid)
      res.render('post/commentview', {comments: myComments})
    })
})

router.delete('/:userid/delete/:postid', (req, res) => {
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    Post.findByIdAndRemove(req.params.postid, function (err, post) {
      if (err) return res.status(500).render({ errorMsg: err })
      User.findByIdAndUpdate(
        req.user._id,
        {'$pull': { posts: post._id }}, {
          new: true,
          runValidators: true
        }, function (err, remainingPosts) {
          (err) ? req.flashreq.flash('error', 'Delete unsuccesful') : req.flash('success', 'Post deleted')
          res.redirect('/user/' + req.user.id)
        }
      )
    })
  }
})

/* returns specific user's posts */
router.get('/:userid', function (req, res) {
console.log('Cookies: ', req.cookies)
User
  .findOne({_id: req.params.userid})
  .populate('posts')
  .exec(function (err, myarticles) {
    if (err) return res.status(500).render({errMsg: err})
    areYouANewVisitor(req.cookies.guestid)
    console.log('user data contains ', myarticles)
    res.render('post/singleuserarticleview', {myarticles: myarticles, news: newsData.response.results})
  })
})

/* returns all posts */
router.get('/', function (req, res) {
  // retrieveNews()
  // console.log(data);
  Post.find({}).populate('user').exec(function (err, posts) {
    if (err) {
      req.flash('error', 'error loading homepage...')
      res.status(500)
    } else {
      console.log('articles contains...', posts);
      areYouANewVisitor(req.cookies.guestid)
      requestify.get('https://content.guardianapis.com/search?api-key=88411b5f-1d1f-4d12-a9be-be1dae164e01&format=json&section=technology&lang=en&page-size=5&order-by=newest')
        .then(function (response) {
          newsData = response.getBody()
          res.render('post/articleview', { articles: posts, news: newsData.response.results })
        }).fail(function (response) {
          response.getCode()
          res.render('post/articleview', {articles: posts})
        })
    }
  })
})

// creates docs of guest interaction
function areYouANewVisitor (test) {
  GuestInteraction.findById({_id: test}, function (err, results) {
    if (err) {
      console.log('trouble accessing GuestInteraction model ', err)
      } else if (results === null) {
      GuestInteraction.create({
        _id: test,
        guestuserPageViewCount: 1
      }, function (err, newGuest) {
        if (err) {
        console.log('cookie exists')
        res.redirect('')}
        else { console.log('guest entry created') }
      })
    } else {
      if (results.guestuserRegistered === false) {
        results.guestuserPageViewCount += 1
        results.save(function (err, results) {
          if (err) console.log('error updating guest user data')
          else console.log('guest data update successful')
        })
      } else {
        userPageViewLog(test)
      }
    }
  })
}

function userPageViewLog(test) {
  UserInteraction.findOneAndUpdate({guestid: test},
    {$inc: {userPageViewCount: +1}
    }, function (err, results) {
      if (err) console.log('error updating user interaction data')
      else console.log('user interaction data update successful')
  })
}

// function retrieveNews(callback) {
//   http.get({
//     host: 'content.guardianapis.com',
//     path: '/search?api-key=88411b5f-1d1f-4d12-a9be-be1dae164e01&format=json&section=technology&lang=en&page-size=5&order-by=newest'
//   }, function (response) {
//     response.setEncoding('utf8')
//
//     var str = ''
//
//     response.on('data', function (chunk) {
//       str += chunk
//     })
//
//     response.on('end', function () {
//       try {
//         var parsed = JSON.parse(str)
//       } catch (err) {
//         console.error('unable to parse esponse as JSON', err)
//         return callback(err)
//       }
//       // if (callback) {
//       //   return callback(null, {parsed})
//       // }
//       console.log('news items ', parsed)
//       return callback && callback(null, {parsed})
//     })
//   }).on('error', function (err) {
//     console.error('Error with the request', err.message)
//     callback(err)
//   })
// }

module.exports = router
