const Reply = require('../models/comment_model')
const GuestInteraction = require('../models/guestinteraction_model')
const UserInteraction = require('../models/userinteraction_model')
const Post = require('../models/post_model')
const User = require('../models/user_model')
const express = require('express')
const router = express.Router()
const flash = require('connect-flash')

router.get('/:postid', function (req, res) {
  Post
  .findById(req.params.postid)
  .populate('user')
  .populate({
    path: 'comments',
    populate: { path: 'authorId' }
  })
  .exec(function (err, solopost) {
    if (err) {
      req.flash('error', 'error loading homepage...')
      res.status(500).render({errMsg: err})
    } else {
      areYouANewVisitor(req.cookies.guestid)
      res.render('comment/soloPostAndComment', {post: solopost})
    }
  })
})

/* post comment */
router.post('/:postid/create', function (req, res) {
  if (req.body.text === '') {
    req.flash('error', 'Comment field must not be empty')
    res.redirect('')  // solo post view
  } else if (!req.user) {
    req.flash('error', 'You must be logged in to comment')
    res.redirect('/auth/login')
  } else {
    Reply.create({
      authorId: req.user._id,
      postId: req.params.postid,
      text: req.body.text
    }, function (err, newComment) {
      if (err) {
        req.flash('error', 'Comment could not be created')
        res.redirect('/post/' + req.params.postid)
      } else {
        userPageViewLog(req.cookies.guestid)
        Post.findByIdAndUpdate(req.params.postid, {
          '$push': { comments: newComment._id }
        }, function (err) {
          if (err) res.status(500).render({errMsg: err})
        })
        User.findByIdAndUpdate(req.user._id, {
          '$push': { comments: newComment._id }
        }, function (err, user) {
          (err) ? req.flash('error', 'Commment not posted') : req.flash('success', 'Commment posted')
          res.redirect('/post/' + req.params.postid)
        }
        )
      }
    })
  }
})

/* do i need this if all i need is the ability to update?  */
router.put('/:postid/:commentid/edit', (req, res) => {
  Reply.findById(req.params.commentid, req.body, function (err, comment) {
    if (err) {
      req.flash('error', 'unsuccessful update...')
      res.redirect('/post/' + req.params.postid)
    } else {
      comment.text = req.body.text
      comment.save(function (err) {
        (err) ? req.flash('error', 'Comment update unsuccessful') : req.flash('success', 'Comment updated')
      })
      res.redirect('/post/' + req.params.postid) // replace with solopostview
    }
  })
})

router.delete('/:postid/delete/:commentid', (req, res) => {
  Reply.findByIdAndRemove(req.params.commentid, function (err, post) {
    if (err) return res.status(500).render({ errorMsg: err })
    User.findByIdAndUpdate(
      req.user._id,
      { '$pull': { comments: post._id } }, {
        new: true,
        runValidators: true
      }, function (err, remainingPosts) {
        (err) ? req.flashreq.flash('error', 'Delete unsuccesful') : req.flash('success', 'Post deleted')
      }
    )
    Post.findByIdAndUpdate(
      req.params.postid,
      { '$pull': { comments: post._id } }, {
        new: true,
        runValidators: true
      }, function (err, remainingPosts) {
        (err) ? req.flash('error', 'Delete unsuccesful') : req.flash('success', 'Post deleted')
        res.redirect('/post/' + req.params.postid)
      }
    )
  })
})

function areYouANewVisitor (test) {
  GuestInteraction.findById({_id: test}, function (err, results) {
    if (err) console.log('trouble accessing GuestInteraction model')
    if (results === null) {
      GuestInteraction.create({
        _id: test,
        guestuserPageViewCount: 1
      }, function (err, newGuest) {
        if (err) console.log('error creating newGuest entry')
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

function userPageViewLog (test) {
  UserInteraction.findOneAndUpdate({guestid: test},
    {$inc: {userPageViewCount: +1}
    }, function (err, results) {
      if (err) console.log('error updating user interaction data')
      else console.log('user interaction data update successful')
    })
}

module.exports = router
