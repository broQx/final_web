const express = require("express");
const { enrollCourse, startCourse, getMyEnrollments, updateProgress } = require("../controllers/enrollmentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/enroll", protect, enrollCourse);
router.post("/start", protect, startCourse);
router.post("/progress", protect, updateProgress);
router.get("/me", protect, getMyEnrollments);

module.exports = router;
