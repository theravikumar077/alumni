const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600"
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rsvps: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "cancelled"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Event", EventSchema);
