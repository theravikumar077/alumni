const Alumni = require("../models/Alumni");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Get all alumni with filtering, searching, and sorting
// @route   GET /api/alumni
// @access  Public
exports.getAlumniDirectory = async (req, res) => {
  try {
    const { search, batch, industry, location, degree, isMentor, sort } = req.query;
    
    // Build query for Alumni
    let query = {};

    if (batch) {
      query.batch = Number(batch);
    }
    if (industry) {
      query.industry = new RegExp(industry, "i");
    }
    if (location) {
      // Location is on User, we will populate and filter, or handle it via a joined pipeline.
      // For simplicity, we can get list of matching users first, or filter afterwards.
      // Let's filter on Alumni fields first:
    }
    if (degree) {
      query.degree = new RegExp(degree, "i");
    }
    if (isMentor !== undefined) {
      query.isMentor = isMentor === "true";
    }

    // Retrieve Alumni records and populate User data
    let alumniList = await Alumni.find(query).populate("userId");

    // Perform User-based filtering (search name, location, bio, tags)
    if (search || location) {
      alumniList = alumniList.filter(alumni => {
        if (!alumni.userId) return false;
        
        let matches = true;

        if (search) {
          const s = search.toLowerCase();
          const nameMatch = alumni.userId.name.toLowerCase().includes(s);
          const roleMatch = alumni.role.toLowerCase().includes(s);
          const compMatch = alumni.company.toLowerCase().includes(s);
          const degMatch = alumni.degree.toLowerCase().includes(s);
          const tagMatch = alumni.tags.some(t => t.toLowerCase().includes(s));
          matches = nameMatch || roleMatch || compMatch || degMatch || tagMatch;
        }

        if (location && matches) {
          matches = alumni.userId.location.toLowerCase().includes(location.toLowerCase());
        }

        return matches;
      });
    }

    // Sort options
    if (sort) {
      if (sort === "activity") {
        alumniList.sort((a, b) => b.activity - a.activity);
      } else if (sort === "connections") {
        alumniList.sort((a, b) => b.connections - a.connections);
      } else if (sort === "batch_desc") {
        alumniList.sort((a, b) => b.batch - a.batch);
      } else if (sort === "batch_asc") {
        alumniList.sort((a, b) => a.batch - b.batch);
      }
    } else {
      // Default sort by activity
      alumniList.sort((a, b) => b.activity - a.activity);
    }

    res.json({
      success: true,
      count: alumniList.length,
      data: alumniList
    });
  } catch (error) {
    console.error("Get alumni directory error:", error);
    res.status(500).json({ success: false, message: "Error retrieving alumni directory" });
  }
};

// @desc    Get single alumni profile by User ID
// @route   GET /api/alumni/:userId
// @access  Public
exports.getAlumniProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Alumni profile user not found" });
    }

    const alumni = await Alumni.findOne({ userId: req.params.userId });
    
    res.json({
      success: true,
      user,
      alumni
    });
  } catch (error) {
    console.error("Get alumni profile error:", error);
    res.status(500).json({ success: false, message: "Error retrieving alumni profile" });
  }
};

// @desc    Update alumni/user profile information
// @route   PUT /api/alumni/profile
// @access  Private (Alumni or Mentor only)
exports.updateAlumniProfile = async (req, res) => {
  const { name, bio, location, linkedin, skills, batch, degree, company, role, industry, tags, avatar, coverImage } = req.body;

  try {
    // 1. Update User Details
    const userUpdateFields = {};
    if (name) userUpdateFields.name = name;
    if (bio !== undefined) userUpdateFields.bio = bio;
    if (location !== undefined) userUpdateFields.location = location;
    if (linkedin !== undefined) userUpdateFields.linkedin = linkedin;
    if (skills) userUpdateFields.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim());
    if (avatar) userUpdateFields.avatar = avatar;
    if (coverImage) userUpdateFields.coverImage = coverImage;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userUpdateFields },
      { new: true }
    ).select("-password");

    // 2. Update Alumni Details
    const alumniUpdateFields = {};
    if (batch) alumniUpdateFields.batch = Number(batch);
    if (degree) alumniUpdateFields.degree = degree;
    if (company) alumniUpdateFields.company = company;
    if (role) alumniUpdateFields.role = role;
    if (industry) alumniUpdateFields.industry = industry;
    if (tags) alumniUpdateFields.tags = Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim());

    const updatedAlumni = await Alumni.findOneAndUpdate(
      { userId: req.user.id },
      { $set: alumniUpdateFields },
      { new: true }
    );

    res.json({
      success: true,
      user: updatedUser,
      alumni: updatedAlumni
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Error updating profile details" });
  }
};

// @desc    Connect with alumni / Send request notification
// @route   POST /api/alumni/connect/:userId
// @access  Private
exports.connectWithAlumni = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    
    if (targetUserId === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot connect with yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Increment connection count on the targets' Alumni profile
    await Alumni.findOneAndUpdate(
      { userId: targetUserId },
      { $inc: { connections: 1 } }
    );

    // Also increment connection count on sender's Alumni profile if they are alumni
    await Alumni.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { connections: 1 } }
    );

    // Create a connection notification
    const notification = new Notification({
      userId: targetUserId,
      title: "New Connection Request",
      content: `${req.user.name} has requested to connect with you.`,
      type: "general",
      link: `/profile.html?id=${req.user.id}`
    });
    await notification.save();

    res.json({
      success: true,
      message: `Connection request sent to ${targetUser.name}`
    });
  } catch (error) {
    console.error("Connect with alumni error:", error);
    res.status(500).json({ success: false, message: "Error sending connection request" });
  }
};
