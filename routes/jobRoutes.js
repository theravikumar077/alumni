const express = require("express");
const router = express.Router();
const { getJobs, postJob, applyJob, deleteJob, getMyPostedJobs } = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getJobs);
router.get("/my-jobs", protect, getMyPostedJobs);
router.post("/", protect, postJob);
router.post("/apply/:jobId", protect, applyJob);
router.delete("/:jobId", protect, deleteJob);

module.exports = router;
