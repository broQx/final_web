const Joi = require("joi");

const createCourseSchema = Joi.object({
  title: Joi.string().min(3).max(120).required(),
  description: Joi.string().min(10).max(1000).required(),
  category: Joi.string().max(60),
  price: Joi.number().min(0),
  level: Joi.string().valid("beginner", "intermediate", "advanced"),
  durationWeeks: Joi.number().integer().min(1).max(52),
  imageUrl: Joi.string().uri(),
  instructorName: Joi.string().max(80),
  rating: Joi.number().min(0).max(5),
  reviewCount: Joi.number().min(0),
  outcomes: Joi.array().items(Joi.string().max(120)),
  syllabus: Joi.array().items(Joi.string().max(200)),
  reviews: Joi.array().items(
    Joi.object({
      name: Joi.string().max(60),
      rating: Joi.number().min(1).max(5),
      comment: Joi.string().max(500),
    })
  ),
  videoQuery: Joi.string().max(120),
});

const updateCourseSchema = Joi.object({
  title: Joi.string().min(3).max(120),
  description: Joi.string().min(10).max(1000),
  category: Joi.string().max(60),
  price: Joi.number().min(0),
  level: Joi.string().valid("beginner", "intermediate", "advanced"),
  durationWeeks: Joi.number().integer().min(1).max(52),
  imageUrl: Joi.string().uri(),
  instructorName: Joi.string().max(80),
  rating: Joi.number().min(0).max(5),
  reviewCount: Joi.number().min(0),
  outcomes: Joi.array().items(Joi.string().max(120)),
  syllabus: Joi.array().items(Joi.string().max(200)),
  reviews: Joi.array().items(
    Joi.object({
      name: Joi.string().max(60),
      rating: Joi.number().min(1).max(5),
      comment: Joi.string().max(500),
    })
  ),
  videoQuery: Joi.string().max(120),
}).min(1);

module.exports = { createCourseSchema, updateCourseSchema };
