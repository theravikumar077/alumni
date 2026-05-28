const express = require("express");
const router = express.Router();
const { getPosts, createPost, likePost, commentPost } = require("../controllers/communityController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getPosts);
router.post("/", protect, createPost);
router.post("/:postId/like", protect, likePost);
router.post("/:postId/comment", protect, commentPost);

module.exports = router;
