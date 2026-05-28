const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  accessLevel: {
    type: String,
    enum: ["full", "read-only"],
    default: "full"
  }
});

module.exports = mongoose.model("Admin", AdminSchema);
