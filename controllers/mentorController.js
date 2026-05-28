const Mentor = require("../models/Mentor");
const Alumni = require("../models/Alumni");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Get all approved mentors
// @route   GET /api/mentors
// @access  Public
exports.getMentors = async (req, res) => {
  try {
    const { expertise, search } = req.query;
    
    let query = { isApproved: true };

    let mentorsList = await Mentor.find(query)
      .populate("userId", "-password")
      .populate("alumniId");

    // Filter by expertise or search
    if (expertise) {
      mentorsList = mentorsList.filter(m => 
        m.expertise.some(e => e.toLowerCase().includes(expertise.toLowerCase()))
      );
    }

    if (search) {
      const s = search.toLowerCase();
      mentorsList = mentorsList.filter(m => 
        m.userId.name.toLowerCase().includes(s) ||
        m.expertise.some(e => e.toLowerCase().includes(s)) ||
        (m.alumniId && m.alumniId.company.toLowerCase().includes(s))
      );
    }

    res.json({
      success: true,
      count: mentorsList.length,
      data: mentorsList
    });
  } catch (error) {
    console.error("Get mentors error:", error);
    res.status(500).json({ success: false, message: "Error retrieving mentors list" });
  }
};

// @desc    Request a mentorship session
// @route   POST /api/mentors/request/:mentorId
// @access  Private
exports.requestSession = async (req, res) => {
  const { date, time, topic } = req.body;
  const mentorId = req.params.mentorId; // Mentor object _id

  try {
    const mentor = await Mentor.findById(mentorId).populate("userId");
    if (!mentor) {
      return res.status(404).json({ success: false, message: "Mentor not found" });
    }

    if (mentor.userId._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot request mentorship from yourself" });
    }

    // Add session to mentor's profile
    const newSession = {
      studentId: req.user.id,
      date: new Date(date),
      time,
      topic: topic || "Career guidance",
      status: "pending"
    };

    mentor.sessions.push(newSession);
    await mentor.save();

    // Notify the mentor
    const notification = new Notification({
      userId: mentor.userId._id,
      title: "New Mentorship Request",
      content: `${req.user.name} has requested a session on "${topic || "Career guidance"}".`,
      type: "mentor_request",
      link: "/dashboard/mentor"
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: "Mentorship session requested successfully!"
    });
  } catch (error) {
    console.error("Request mentorship session error:", error);
    res.status(500).json({ success: false, message: "Error requesting session" });
  }
};

// @desc    Get sessions for current logged-in user (student or mentor)
// @route   GET /api/mentors/sessions
// @access  Private
exports.getMySessions = async (req, res) => {
  try {
    if (req.user.role === "mentor") {
      const mentor = await Mentor.findOne({ userId: req.user.id })
        .populate("sessions.studentId", "name email avatar");
      
      return res.json({
        success: true,
        role: "mentor",
        sessions: mentor ? mentor.sessions : []
      });
    } else {
      // Find all mentors who have a session where studentId matches req.user.id
      const mentors = await Mentor.find({ "sessions.studentId": req.user.id })
        .populate("userId", "name email avatar");
      
      let studentSessions = [];
      mentors.forEach(m => {
        m.sessions.forEach(s => {
          if (s.studentId.toString() === req.user.id.toString()) {
            studentSessions.push({
              _id: s._id,
              mentorId: m._id,
              mentorName: m.userId.name,
              mentorAvatar: m.userId.avatar,
              date: s.date,
              time: s.time,
              topic: s.topic,
              status: s.status
            });
          }
        });
      });

      return res.json({
        success: true,
        role: "user",
        sessions: studentSessions
      });
    }
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ success: false, message: "Error retrieving sessions" });
  }
};

// @desc    Accept or reject mentorship session request
// @route   POST /api/mentors/sessions/:sessionId/status
// @access  Private (Mentor only)
exports.updateSessionStatus = async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  const { sessionId } = req.params;

  try {
    const mentor = await Mentor.findOne({ userId: req.user.id });
    if (!mentor) {
      return res.status(403).json({ success: false, message: "Not authorized as mentor" });
    }

    const session = mentor.sessions.id(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session request not found" });
    }

    session.status = status;
    await mentor.save();

    // Notify student
    const notification = new Notification({
      userId: session.studentId,
      title: `Mentorship Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      content: `Your mentorship request with ${req.user.name} has been ${status}.`,
      type: "mentor_request",
      link: "/dashboard/user"
    });
    await notification.save();

    res.json({
      success: true,
      message: `Mentorship session request ${status} successfully`
    });
  } catch (error) {
    console.error("Update session status error:", error);
    res.status(500).json({ success: false, message: "Error updating session status" });
  }
};
