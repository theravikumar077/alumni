const mongoose = require("mongoose");

const AlumniSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  batch: {
    type: Number,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  activity: {
    type: Number,
    default: 50
  },
  connections: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    default: []
  },
  isMentor: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Alumni", AlumniSchema);
