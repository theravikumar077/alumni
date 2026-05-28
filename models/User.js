const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "alumni", "mentor", "admin"],
    default: "user"
  },
  avatar: {
    type: String,
    default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
  },
  coverImage: {
    type: String,
    default: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800"
  },
  bio: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  linkedin: {
    type: String,
    default: ""
  },
  skills: {
    type: [String],
    default: []
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre("save", async function() {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
