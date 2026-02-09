const express = require("express");
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getPublicCourses,
  getPublicCourseById,
} = require("../controllers/courseController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/public", getPublicCourses);
router.get("/public/:id", getPublicCourseById);
router.post("/", protect, adminOnly, createCourse);
router.get("/", protect, adminOnly, getCourses);
router.get("/:id", protect, adminOnly, getCourseById);
router.put("/:id", protect, adminOnly, updateCourse);
router.delete("/:id", protect, adminOnly, deleteCourse);

module.exports = router;
