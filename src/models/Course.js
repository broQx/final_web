const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    durationWeeks: {
      type: Number,
      default: 4,
      min: 1,
      max: 52,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    instructorName: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    outcomes: [{ type: String, trim: true, maxlength: 120 }],
    syllabus: [{ type: String, trim: true, maxlength: 200 }],
    reviews: [reviewSchema],
    videoQuery: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
