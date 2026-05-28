const User = require("../models/User");
const Alumni = require("../models/Alumni");
const Mentor = require("../models/Mentor");
const Event = require("../models/Event");
const Job = require("../models/Job");
const Message = require("../models/Message");

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAlumni = await Alumni.countDocuments();
    const totalMentors = await Mentor.countDocuments({ isApproved: true });
    const pendingMentors = await Mentor.countDocuments({ isApproved: false });
    const totalEvents = await Event.countDocuments({ status: "approved" });
    const pendingEvents = await Event.countDocuments({ status: "pending" });
    const totalJobs = await Job.countDocuments({ status: "approved" });
    const pendingJobs = await Job.countDocuments({ status: "pending" });
    const totalMessages = await Message.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAlumni,
        totalMentors,
        pendingMentors,
        totalEvents,
        pendingEvents,
        totalJobs,
        pendingJobs,
        totalMessages
      }
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ success: false, message: "Error loading statistics" });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Get users list error:", error);
    res.status(500).json({ success: false, message: "Error retrieving users list" });
  }
};

// @desc    Delete a user profile and clean up associated records
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot delete your own admin account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Clean up dependencies
    await Alumni.deleteMany({ userId });
    await Mentor.deleteMany({ userId });
    await Event.deleteMany({ organizer: userId });
    await Job.deleteMany({ postedBy: userId });
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "User and all associated records deleted successfully"
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Error deleting user account" });
  }
};

// @desc    Approve or reject a mentor request
// @route   POST /api/admin/mentors/:id/approve
// @access  Private (Admin only)
exports.approveMentor = async (req, res) => {
  const { status } = req.body; // true or false
  const mentorId = req.params.id;

  try {
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ success: false, message: "Mentor record not found" });
    }

    mentor.isApproved = status === true;
    await mentor.save();

    // Update corresponding user role to mentor if approved, or revert if rejected
    const newRole = status === true ? "mentor" : "alumni";
    await User.findByIdAndUpdate(mentor.userId, { role: newRole });

    res.json({
      success: true,
      message: `Mentor request ${status === true ? "approved" : "rejected"} successfully`
    });
  } catch (error) {
    console.error("Approve mentor error:", error);
    res.status(500).json({ success: false, message: "Error updating mentor approval status" });
  }
};

// @desc    Verify or unverify user/alumni
// @route   POST /api/admin/users/:id/verify
// @access  Private (Admin only)
exports.verifyUser = async (req, res) => {
  const { verified } = req.body; // true or false
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isVerified = verified === true;
    await user.save();

    res.json({
      success: true,
      message: `User verification ${verified === true ? "enabled" : "disabled"} successfully`
    });
  } catch (error) {
    console.error("Verify user error:", error);
    res.status(500).json({ success: false, message: "Error updating verification status" });
  }
};

// @desc    Get pending requests (mentors, events, jobs)
// @route   GET /api/admin/pending
// @access  Private (Admin only)
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingMentors = await Mentor.find({ isApproved: false })
      .populate("userId", "name email avatar");
    const pendingEvents = await Event.find({ status: "pending" })
      .populate("organizer", "name avatar");
    const pendingJobs = await Job.find({ status: "pending" })
      .populate("postedBy", "name avatar");

    res.json({
      success: true,
      data: {
        mentors: pendingMentors,
        events: pendingEvents,
        jobs: pendingJobs
      }
    });
  } catch (error) {
    console.error("Get pending approvals error:", error);
    res.status(500).json({ success: false, message: "Error loading pending requests" });
  }
};

// @desc    Approve event post
// @route   POST /api/admin/events/:id/approve
// @access  Private (Admin only)
exports.approveEvent = async (req, res) => {
  const { approved } = req.body; // true or false

  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (approved) {
      event.status = "approved";
      await event.save();
    } else {
      await Event.findByIdAndDelete(req.params.id);
    }

    res.json({
      success: true,
      message: `Event submission ${approved ? "approved" : "rejected and removed"} successfully`
    });
  } catch (error) {
    console.error("Approve event error:", error);
    res.status(500).json({ success: false, message: "Error processing event approval" });
  }
};

// @desc    Approve job post
// @route   POST /api/admin/jobs/:id/approve
// @access  Private (Admin only)
exports.approveJob = async (req, res) => {
  const { approved } = req.body; // true or false

  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (approved) {
      job.status = "approved";
      await job.save();
    } else {
      await Job.findByIdAndDelete(req.params.id);
    }

    res.json({
      success: true,
      message: `Job submission ${approved ? "approved" : "rejected and removed"} successfully`
    });
  } catch (error) {
    console.error("Approve job error:", error);
    res.status(500).json({ success: false, message: "Error processing job approval" });
  }
};
