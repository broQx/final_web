require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Course = require("../src/models/Course");
const bcrypt = require("bcryptjs");

const seed = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany({});
    await Course.deleteMany({});

    const passwordHash = await bcrypt.hash("Password123", 10);

    const user = await User.create({
      username: "student1",
      email: "student1@example.com",
      password: passwordHash,
    });

    await Course.create([
      {
        title: "Node API Basics",
        description: "Build a REST API with Express and MongoDB.",
        category: "Engineering",
        level: "beginner",
        durationWeeks: 4,
        price: 59,
        imageUrl:
          "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        createdBy: user._id,
      },
      {
        title: "JWT Auth Mastery",
        description: "Secure APIs with JWT, roles, and refresh tokens.",
        category: "Engineering",
        level: "intermediate",
        durationWeeks: 6,
        price: 79,
        imageUrl:
          "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        createdBy: user._id,
      },
      {
        title: "Product Strategy Lab",
        description: "Validate ideas, map GTM, and launch confidently.",
        category: "Product",
        level: "beginner",
        durationWeeks: 5,
        price: 69,
        imageUrl:
          "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        createdBy: user._id,
      },
      {
        title: "Design Systems Sprint",
        description: "Ship a scalable UI kit and align teams fast.",
        category: "Design",
        level: "intermediate",
        durationWeeks: 6,
        price: 72,
        imageUrl:
          "https://images.pexels.com/photos/4143795/pexels-photo-4143795.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        createdBy: user._id,
      },
      {
        title: "Analytics for Growth",
        description: "Own metrics dashboards and data storytelling.",
        category: "Data",
        level: "beginner",
        durationWeeks: 4,
        price: 55,
        imageUrl:
          "https://images.pexels.com/photos/5473950/pexels-photo-5473950.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        createdBy: user._id,
      },
      {
        title: "Go Developer Roadmap",
        description: "Build APIs, CLI tools, and cloud services with Go.",
        category: "Engineering",
        level: "beginner",
        durationWeeks: 8,
        price: 89,
        imageUrl:
          "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        createdBy: user._id,
      },
      {
        title: "Cloud Deployments with Docker",
        description: "Ship containers and deployments to production.",
        category: "Engineering",
        level: "intermediate",
        durationWeeks: 5,
        price: 64,
        imageUrl:
          "https://images.pexels.com/photos/1181325/pexels-photo-1181325.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        createdBy: user._id,
      },
      {
        title: "Data Visualization Studio",
        description: "Turn messy data into compelling dashboards.",
        category: "Data",
        level: "intermediate",
        durationWeeks: 5,
        price: 60,
        imageUrl:
          "https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        createdBy: user._id,
      },
      {
        title: "Marketing Analytics Lab",
        description: "Measure funnel performance and optimize spend.",
        category: "Marketing",
        level: "beginner",
        durationWeeks: 4,
        price: 49,
        imageUrl:
          "https://images.pexels.com/photos/6476580/pexels-photo-6476580.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        createdBy: user._id,
      },
    ]);

    console.log("Seed data created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
