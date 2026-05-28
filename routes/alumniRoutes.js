const express = require("express");
const router = express.Router();
const { getAlumniDirectory, getAlumniProfile, updateAlumniProfile, connectWithAlumni } = require("../controllers/alumniController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getAlumniDirectory);
router.put("/profile", protect, updateAlumniProfile);
router.post("/connect/:userId", protect, connectWithAlumni);
router.get("/:userId", getAlumniProfile);

module.exports = router;
