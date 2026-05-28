const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["message", "mentor_request", "rsvp", "job_apply", "general"],
    default: "general"
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Notification", NotificationSchema);
