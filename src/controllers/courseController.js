const Course = require("../models/Course");
const {
  createCourseSchema,
  updateCourseSchema,
} = require("../validators/courseValidators");

const createCourse = async (req, res, next) => {
  try {
    const { error, value } = createCourseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const course = await Course.create({
      ...value,
      createdBy: req.user.id,
    });

    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { error, value } = updateCourseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const course = await Course.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    Object.assign(course, value);
    const updatedCourse = await course.save();

    res.json(updatedCourse);
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await course.deleteOne();
    res.json({ message: "Course deleted" });
  } catch (err) {
    next(err);
  }
};

const getPublicCourses = async (req, res, next) => {
  try {
    const {
      q,
      level,
      category,
      minPrice,
      maxPrice,
      minRating,
      page = 1,
      limit = 9,
      sort = "recent",
    } = req.query;
    const filter = {};

    if (level) {
      const levels = level.split(",").map((item) => item.trim()).filter(Boolean);
      if (levels.length) {
        filter.level = { $in: levels };
      }
    }

    if (category) {
      const categories = category.split(",").map((item) => item.trim()).filter(Boolean);
      if (categories.length) {
        filter.category = { $in: categories };
      }
    }

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    const sortMap = {
      recent: { createdAt: -1 },
      duration: { durationWeeks: 1 },
      price: { price: 1 },
    };

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 9, 1), 50);
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Course.countDocuments(filter);
    const courses = await Course.find(filter)
      .sort(sortMap[sort] || sortMap.recent)
      .skip(skip)
      .limit(limitNumber);

    res.json({
      data: courses,
      page: pageNumber,
      totalPages: Math.max(Math.ceil(total / limitNumber), 1),
      total,
    });
  } catch (err) {
    next(err);
  }
};

const getPublicCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getPublicCourses,
  getPublicCourseById,
};
