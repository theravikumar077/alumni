const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Load Environment variables if any
require("dotenv").config();

// Create Express App
const app = express();

// Connect to Local MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/alumni", require("./routes/alumniRoutes"));
app.use("/api/mentors", require("./routes/mentorRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/posts", require("./routes/communityRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, "public")));

// Route Clean URLs (avoid .html extension in URL bar for premium look)
const serveView = (viewName) => (req, res) => {
  res.sendFile(path.join(__dirname, "public", `${viewName}.html`));
};

app.get("/", serveView("index"));
app.get("/about", serveView("about"));
app.get("/alumni", serveView("alumni"));
app.get("/mentors", serveView("mentors"));
app.get("/events", serveView("events"));
app.get("/jobs", serveView("jobs"));
app.get("/community", serveView("community"));
app.get("/contact", serveView("contact"));
app.get("/login", serveView("login"));
app.get("/signup", serveView("signup"));
app.get("/dashboard/user", serveView("dashboard-user"));
app.get("/dashboard/alumni", serveView("dashboard-alumni"));
app.get("/dashboard/mentor", serveView("dashboard-mentor"));
app.get("/dashboard/admin", serveView("dashboard-admin"));
app.get("/profile", serveView("profile"));
app.get("/messages", serveView("messages"));
app.get("/notifications", serveView("notifications"));
app.get("/settings", serveView("settings"));

// Handle 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "index.html")); // fallback to home
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
