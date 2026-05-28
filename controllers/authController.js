const User = require("../models/User");
const Alumni = require("../models/Alumni");
const Mentor = require("../models/Mentor");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/authMiddleware");

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user (student or alumni)
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  const { name, email, password, role, batch, degree, company, roleTitle, industry, tags } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    // Set avatar based on name initials or placeholder
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=120`;

    // Create User
    const user = new User({
      name,
      email,
      password,
      role: role || "user",
      avatar
    });

    const savedUser = await user.save();

    // If role is alumni or mentor, create Alumni details
    if (role === "alumni" || role === "mentor") {
      const alumni = new Alumni({
        userId: savedUser._id,
        batch: batch || new Date().getFullYear(),
        degree: degree || "BSc Computer Science",
        company: company || "Self-Employed",
        role: roleTitle || "Professional",
        industry: industry || "Technology",
        tags: tags ? tags.split(",").map(t => t.trim()) : ["tech"],
        isMentor: role === "mentor"
      });
      const savedAlumni = await alumni.save();

      // If mentor, also create Mentor request/profile
      if (role === "mentor") {
        const mentor = new Mentor({
          userId: savedUser._id,
          alumniId: savedAlumni._id,
          expertise: tags ? tags.split(",").map(t => t.trim()) : ["tech"],
          availability: "Saturdays, 10 AM - 4 PM",
          bio: "I am happy to guide students in their careers.",
          isApproved: false // Admin approval required
        });
        await mentor.save();
      }
    }

    const token = generateToken(savedUser._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        avatar: savedUser.avatar
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  let { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide an email and password" });
    }

    // Support admin credential alias 'admin'
    if (email.trim() === "admin") {
      email = "admin@alumnihub.com";
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// @desc    Log out user / Clear cookie
// @route   GET /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
  res.cookie("token", "none", {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000)
  });
  res.json({ success: true, message: "Logged out successfully" });
};

// @desc    Get currently logged-in user profile context
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    let profileDetails = null;

    if (user.role === "alumni" || user.role === "mentor") {
      profileDetails = await Alumni.findOne({ userId: user._id });
    }
    
    let mentorDetails = null;
    if (user.role === "mentor") {
      mentorDetails = await Mentor.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user,
      profileDetails,
      mentorDetails
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ success: false, message: "Server error retrieving session user" });
  }
};
