const express = require("express");
const router = express.Router();
const {
  getStats,
  getUsers,
  deleteUser,
  approveMentor,
  verifyUser,
  getPendingApprovals,
  approveEvent,
  approveJob
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes here require admin privileges
router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.post("/mentors/:id/approve", approveMentor);
router.post("/users/:id/verify", verifyUser);
router.get("/pending", getPendingApprovals);
router.post("/events/:id/approve", approveEvent);
router.post("/jobs/:id/approve", approveJob);

module.exports = router;
