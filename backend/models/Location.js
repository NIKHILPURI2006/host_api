const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['landmark', 'restaurant', 'hotel', 'other'],
    default: 'other'
  },
  description: String
});

module.exports = mongoose.model('Location', locationSchema);