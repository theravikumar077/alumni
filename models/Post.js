const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ""
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["discussion", "story"],
    default: "discussion"
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  comments: [CommentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Post", PostSchema);
