const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Get active chats (users the logged-in user has exchanged messages with)
// @route   GET /api/messages/chats
// @access  Private
exports.getChatsList = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find all messages sent or received by user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }]
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name avatar role")
      .populate("receiver", "name avatar role");

    // Extract unique users
    const chatUsersMap = new Map();

    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === currentUserId.toString() ? msg.receiver : msg.sender;
      const otherUserId = otherUser._id.toString();

      if (!chatUsersMap.has(otherUserId)) {
        chatUsersMap.set(otherUserId, {
          user: otherUser,
          lastMessage: msg.content,
          time: msg.createdAt,
          isRead: msg.isRead || msg.sender._id.toString() === currentUserId.toString()
        });
      }
    });

    const chats = Array.from(chatUsersMap.values());

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error("Get chats list error:", error);
    res.status(500).json({ success: false, message: "Error retrieving inbox chat list" });
  }
};

// @desc    Get message history with a specific user
// @route   GET /api/messages/history/:userId
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const partnerId = req.params.userId;

    // Mark messages from partner to current user as read
    await Message.updateMany(
      { sender: partnerId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    const history = await Message.find({
      $or: [
        { sender: currentUserId, receiver: partnerId },
        { sender: partnerId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar");

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({ success: false, message: "Error retrieving message logs" });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;

  try {
    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: "Please provide receiverId and content" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Recipient user not found" });
    }

    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content
    });

    const savedMessage = await message.save();

    // Send a real-time notification
    const notification = new Notification({
      userId: receiverId,
      title: "New Message",
      content: `You received a message from ${req.user.name}: "${content.substring(0, 30)}..."`,
      type: "message",
      link: `/messages.html?chat=${req.user.id}`
    });
    await notification.save();

    res.status(201).json({
      success: true,
      data: savedMessage
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, message: "Error sending message" });
  }
};
