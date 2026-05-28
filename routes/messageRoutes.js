const express = require("express");
const router = express.Router();
const { getChatsList, getChatHistory, sendMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.get("/chats", protect, getChatsList);
router.get("/history/:userId", protect, getChatHistory);
router.post("/", protect, sendMessage);

module.exports = router;
