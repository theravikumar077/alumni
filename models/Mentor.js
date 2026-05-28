const mongoose = require("mongoose");

const MentorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  alumniId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alumni",
    required: true
  },
  expertise: {
    type: [String],
    required: true
  },
  availability: {
    type: String,
    default: "Weekends, 6 PM - 8 PM"
  },
  bio: {
    type: String,
    default: ""
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 5.0
  },
  sessions: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: Date,
      time: String,
      topic: String,
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "completed"],
        default: "pending"
      }
    }
  ]
});

module.exports = mongoose.model("Mentor", MentorSchema);
