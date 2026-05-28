const Post = require("../models/Post");

// @desc    Get all community posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name avatar role")
      .populate("comments.author", "name avatar role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ success: false, message: "Error retrieving posts list" });
  }
};

// @desc    Create a new post or alumni story
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  const { title, content, type } = req.body;

  try {
    if (!content) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    const post = new Post({
      title: title || "",
      content,
      type: type || "discussion",
      author: req.user.id
    });

    const savedPost = await post.save();
    
    // Populate author details to send back to client
    const populatedPost = await Post.findById(savedPost._id).populate("author", "name avatar role");

    res.status(201).json({
      success: true,
      message: "Post created successfully!",
      data: populatedPost
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ success: false, message: "Error creating post" });
  }
};

// @desc    Like or unlike a post
// @route   POST /api/posts/:postId/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userId = req.user.id;
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      likesCount: post.likes.length,
      liked: !hasLiked
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ success: false, message: "Error toggling like status" });
  }
};

// @desc    Comment on a post
// @route   POST /api/posts/:postId/comment
// @access  Private
exports.commentPost = async (req, res) => {
  const { content } = req.body;

  try {
    if (!content) {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = {
      author: req.user.id,
      content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    // Get the newly added comment populated
    const updatedPost = await Post.findById(req.params.postId)
      .populate("comments.author", "name avatar role");
    
    const savedComment = updatedPost.comments[updatedPost.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: savedComment
    });
  } catch (error) {
    console.error("Comment post error:", error);
    res.status(500).json({ success: false, message: "Error adding comment" });
  }
};
