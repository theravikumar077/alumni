const express = require("express");
const router = express.Router();
const { getEvents, createEvent, rsvpEvent, deleteEvent } = require("../controllers/eventController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getEvents);
router.post("/", protect, createEvent);
router.post("/rsvp/:eventId", protect, rsvpEvent);
router.delete("/:eventId", protect, deleteEvent);

module.exports = router;
