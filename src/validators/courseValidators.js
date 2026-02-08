const Joi = require("joi");

const createCourseSchema = Joi.object({
  title: Joi.string().min(3).max(120).required(),
  description: Joi.string().min(10).max(1000).required(),
  category: Joi.string().max(60),
  price: Joi.number().min(0),
  level: Joi.string().valid("beginner", "intermediate", "advanced"),
  durationWeeks: Joi.number().integer().min(1).max(52),
  imageUrl: Joi.string().uri(),
});

const updateCourseSchema = Joi.object({
  title: Joi.string().min(3).max(120),
  description: Joi.string().min(10).max(1000),
  category: Joi.string().max(60),
  price: Joi.number().min(0),
  level: Joi.string().valid("beginner", "intermediate", "advanced"),
  durationWeeks: Joi.number().integer().min(1).max(52),
  imageUrl: Joi.string().uri(),
}).min(1);

module.exports = { createCourseSchema, updateCourseSchema };
