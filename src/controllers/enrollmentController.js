const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

const enrollCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user.id,
        course: courseId,
        status: "enrolled",
        progress: 0,
      });
    }

    res.status(201).json(enrollment);
  } catch (err) {
    next(err);
  }
};

const startCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    enrollment.status = "started";
    enrollment.startedAt = enrollment.startedAt || new Date();
    enrollment.progress = Math.max(enrollment.progress || 0, 10);
    await enrollment.save();

    res.json(enrollment);
  } catch (err) {
    next(err);
  }
};

const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate("course")
      .sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (err) {
    next(err);
  }
};

const updateProgress = async (req, res, next) => {
  try {
    const { courseId, progress } = req.body;
    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }
    const nextProgress = Number(progress);
    if (Number.isNaN(nextProgress)) {
      return res.status(400).json({ message: "progress must be a number" });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    enrollment.progress = Math.min(Math.max(nextProgress, 0), 100);
    if (enrollment.progress >= 100) {
      enrollment.status = "completed";
    } else if (enrollment.progress > 0) {
      enrollment.status = "started";
    }
    await enrollment.save();

    res.json(enrollment);
  } catch (err) {
    next(err);
  }
};

module.exports = { enrollCourse, startCourse, getMyEnrollments, updateProgress };
