const Joi = require("joi");

const updateProfileSchema = Joi.object({
  username: Joi.string().min(2).max(60),
  email: Joi.string().email(),
}).min(1);

module.exports = { updateProfileSchema };
