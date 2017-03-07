const mongoose = require('mongoose')

var UserInteractionSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  guestid: {type: mongoose.Schema.Types.String, ref: 'GuestInteraction'},
  userPageViewCount: Number,
  userSearchterm: [String],
  userCreated: {
    type: Date, default: Date.now()
  }
})

module.exports = mongoose.model('UserInteraction', UserInteractionSchema)
