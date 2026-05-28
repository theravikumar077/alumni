const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["Full-time", "Part-time", "Internship", "Contract"],
    default: "Full-time"
  },
  salary: {
    type: String,
    default: "Not Specified"
  },
  tags: {
    type: [String],
    default: []
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  applicants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Job", JobSchema);
