const mongoose = require('mongoose')

var GuestInteractionSchema = new mongoose.Schema({
  _id: {type: String, unique: true},
  guestuserCreated: {
    type: Date, default: Date.now()
  },
  guestuserPageViewCount: Number,
  guestuserSearchterm: [String],
  guestuserRegistered: {type: Boolean, default: false}
})

module.exports = mongoose.model('GuestInteraction', GuestInteractionSchema)
