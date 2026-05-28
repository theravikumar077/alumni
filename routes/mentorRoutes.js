const express = require("express");
const router = express.Router();
const { getMentors, requestSession, getMySessions, updateSessionStatus } = require("../controllers/mentorController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getMentors);
router.get("/sessions", protect, getMySessions);
router.post("/request/:mentorId", protect, requestSession);
router.post("/sessions/:sessionId/status", protect, updateSessionStatus);

module.exports = router;
