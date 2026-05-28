const Job = require("../models/Job");
const Notification = require("../models/Notification");

// @desc    Get all approved jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const { search, type, location } = req.query;

    let query = { status: "approved" };

    if (type) {
      query.type = type;
    }

    if (location) {
      query.location = new RegExp(location, "i");
    }

    let jobs = await Job.find(query)
      .populate("postedBy", "name avatar company")
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(s) ||
        j.company.toLowerCase().includes(s) ||
        j.description.toLowerCase().includes(s) ||
        j.tags.some(t => t.toLowerCase().includes(s))
      );
    }

    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ success: false, message: "Error retrieving jobs list" });
  }
};

// @desc    Post a job opening
// @route   POST /api/jobs
// @access  Private (Alumni, Mentor, Admin only)
exports.postJob = async (req, res) => {
  const { title, company, description, location, type, salary, tags } = req.body;

  try {
    if (req.user.role === "user") {
      return res.status(403).json({ success: false, message: "Only alumni, mentors, or admins can post jobs" });
    }

    // Auto-approve postings
    const status = "approved";

    const job = new Job({
      title,
      company,
      description,
      location,
      type: type || "Full-time",
      salary: salary || "Not Specified",
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim())) : [],
      postedBy: req.user.id,
      status
    });

    const savedJob = await job.save();

    res.status(201).json({
      success: true,
      message: "Job posted successfully!",
      data: savedJob
    });
  } catch (error) {
    console.error("Post job error:", error);
    res.status(500).json({ success: false, message: "Error posting job opening" });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/apply/:jobId
// @access  Private
exports.applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job listing not found" });
    }

    const userId = req.user.id;

    // Check if already applied
    if (job.applicants.includes(userId)) {
      return res.status(400).json({ success: false, message: "You have already applied for this job" });
    }

    job.applicants.push(userId);
    await job.save();

    // Notify the job poster
    const notification = new Notification({
      userId: job.postedBy,
      title: "New Job Application",
      content: `${req.user.name} applied for "${job.title}" at ${job.company}.`,
      type: "job_apply",
      link: "/dashboard/alumni"
    });
    await notification.save();

    res.json({
      success: true,
      message: "Application submitted successfully!"
    });
  } catch (error) {
    console.error("Apply job error:", error);
    res.status(500).json({ success: false, message: "Error submitting application" });
  }
};

// @desc    Delete a job listing
// @route   DELETE /api/jobs/:jobId
// @access  Private
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job listing not found" });
    }

    if (job.postedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this job listing" });
    }

    await Job.findByIdAndDelete(req.params.jobId);

    res.json({
      success: true,
      message: "Job listing removed successfully"
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ success: false, message: "Error deleting job listing" });
  }
};

// @desc    Get jobs posted by the logged-in alumni with populated applicants
// @route   GET /api/jobs/my-jobs
// @access  Private (Alumni, Mentor, Admin only)
exports.getMyPostedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .populate("applicants", "name email avatar role bio")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error("Get my posted jobs error:", error);
    res.status(500).json({ success: false, message: "Error retrieving posted jobs" });
  }
};
