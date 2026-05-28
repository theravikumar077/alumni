const Event = require("../models/Event");
const Notification = require("../models/Notification");

// @desc    Get all approved events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" })
      .populate("organizer", "name avatar role")
      .sort({ date: 1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ success: false, message: "Error retrieving events list" });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Alumni, Mentor, Admin only)
exports.createEvent = async (req, res) => {
  const { title, description, date, time, location, image } = req.body;

  try {
    if (req.user.role === "user") {
      return res.status(403).json({ success: false, message: "Only alumni, mentors, or admins can create events" });
    }

    // Auto-approve if posted by Admin, otherwise pending
    const status = req.user.role === "admin" ? "approved" : "pending";

    const event = new Event({
      title,
      description,
      date: new Date(date),
      time,
      location,
      image: image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600",
      organizer: req.user.id,
      status
    });

    const savedEvent = await event.save();

    // Create system notification for admins if pending
    if (status === "pending") {
      // Find admin and notify (or general notifications list)
      const notification = new Notification({
        userId: "507f1f77bcf86cd799439011", // Seeded Admin userId or mock
        title: "New Event Approval Pending",
        content: `Event "${title}" created by ${req.user.name} requires approval.`,
        type: "general",
        link: "/dashboard/admin"
      });
      // Just save it
      try {
        await notification.save();
      } catch (err) {
        // Safe to ignore if mock ID schema fails
      }
    }

    res.status(201).json({
      success: true,
      message: status === "approved" ? "Event created successfully!" : "Event submitted. Pending admin approval.",
      data: savedEvent
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ success: false, message: "Error creating event" });
  }
};

// @desc    RSVP or cancel RSVP for an event
// @route   POST /api/events/rsvp/:eventId
// @access  Private
exports.rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const userId = req.user.id;
    const hasRsvped = event.rsvps.includes(userId);

    if (hasRsvped) {
      // Remove RSVP
      event.rsvps = event.rsvps.filter(id => id.toString() !== userId.toString());
      await event.save();

      res.json({
        success: true,
        message: "Cancelled RSVP successfully",
        rsvped: false,
        count: event.rsvps.length
      });
    } else {
      // Add RSVP
      event.rsvps.push(userId);
      await event.save();

      // Notify organizer
      const notification = new Notification({
        userId: event.organizer,
        title: "Event RSVP",
        content: `${req.user.name} RSVP'd for your event: "${event.title}".`,
        type: "rsvp",
        link: `/events.html`
      });
      await notification.save();

      res.json({
        success: true,
        message: "RSVP registered successfully!",
        rsvped: true,
        count: event.rsvps.length
      });
    }
  } catch (error) {
    console.error("RSVP event error:", error);
    res.status(500).json({ success: false, message: "Error toggling RSVP" });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:eventId
// @access  Private
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Check ownership or admin role
    if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this event" });
    }

    await Event.findByIdAndDelete(req.params.eventId);

    res.json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ success: false, message: "Error deleting event" });
  }
};
