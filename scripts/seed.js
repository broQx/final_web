require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Course = require("../src/models/Course");
const Enrollment = require("../src/models/Enrollment");
const bcrypt = require("bcryptjs");

const seed = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(process.env.MONGO_URI);

    await Enrollment.deleteMany({});
    await User.deleteMany({});
    await Course.deleteMany({});

    const adminPasswordHash = await bcrypt.hash("admin1234", 10);
    const userPasswordHash = await bcrypt.hash("Password123", 10);

    const adminUser = await User.create({
      username: "admin",
      email: "admin@gmail.com",
      password: adminPasswordHash,
    });

    const user = await User.create({
      username: "student1",
      email: "student1@example.com",
      password: userPasswordHash,
    });

    await Course.create([
      {
        title: "Go Developer Roadmap",
        description:
          "Build APIs, CLI tools, and cloud services with Go. Practice concurrency, database integration, and production deployment.",
        category: "Engineering",
        level: "beginner",
        durationWeeks: 8,
        price: 89,
        imageUrl:
          "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        instructorName: "Rina Takahashi",
        rating: 4.8,
        reviewCount: 240,
        outcomes: [
          "Build a production-grade Go API",
          "Ship concurrency-safe services",
          "Deploy a Go service to the cloud",
        ],
        syllabus: [
          "Go syntax, types, and tooling",
          "Concurrency patterns with goroutines",
          "Building REST APIs with Gin",
          "Databases with MongoDB",
          "Testing and deployment",
        ],
        reviews: [
          { name: "Selena Grant", rating: 5, comment: "Clear roadmap and great labs." },
          { name: "Hassan Nur", rating: 4, comment: "Helped me ship my first Go service." },
        ],
        videoQuery: "golang backend tutorial",
        createdBy: adminUser._id,
      },
      {
        title: "Node API Basics",
        description:
          "Build a REST API with Express and MongoDB. Learn routing, data modeling, and authentication fundamentals.",
        category: "Engineering",
        level: "beginner",
        durationWeeks: 4,
        price: 59,
        imageUrl:
          "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        instructorName: "Devon Brooks",
        rating: 4.7,
        reviewCount: 180,
        outcomes: [
          "Design RESTful endpoints",
          "Secure routes with JWT",
          "Model data with Mongoose",
        ],
        syllabus: [
          "REST fundamentals",
          "Express routing",
          "MongoDB modeling",
          "JWT auth",
        ],
        reviews: [
          { name: "Maya Patel", rating: 5, comment: "Perfect for API fundamentals." },
        ],
        videoQuery: "nodejs express mongodb api",
        createdBy: adminUser._id,
      },
      {
        title: "JWT Auth Mastery",
        description:
          "Secure APIs with JWT, roles, and refresh tokens. Harden endpoints with middleware and token rotation.",
        category: "Engineering",
        level: "intermediate",
        durationWeeks: 6,
        price: 79,
        imageUrl:
          "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        instructorName: "Amara Okafor",
        rating: 4.9,
        reviewCount: 210,
        outcomes: [
          "Implement access + refresh tokens",
          "Harden API security",
          "Design role-based permissions",
        ],
        syllabus: [
          "JWT basics",
          "Refresh tokens",
          "Role-based access",
          "Security hardening",
        ],
        reviews: [
          { name: "Jordan Lee", rating: 5, comment: "Security explained clearly." },
        ],
        videoQuery: "jwt authentication tutorial",
        createdBy: adminUser._id,
      },
      {
        title: "Product Strategy Lab",
        description:
          "Validate ideas, map GTM, and launch confidently. Run experiments, interview users, and plan growth.",
        category: "Product",
        level: "beginner",
        durationWeeks: 5,
        price: 69,
        imageUrl:
          "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        instructorName: "Amara Okafor",
        rating: 4.9,
        reviewCount: 320,
        outcomes: [
          "Validate product demand",
          "Build a go-to-market plan",
          "Ship a launch-ready roadmap",
        ],
        syllabus: [
          "Market research",
          "Positioning",
          "GTM planning",
          "Launch experiments",
        ],
        reviews: [
          { name: "Selena Grant", rating: 5, comment: "Best product class I have taken." },
        ],
        videoQuery: "product strategy course",
        createdBy: adminUser._id,
      },
      {
        title: "Design Systems Sprint",
        description:
          "Ship a scalable UI kit and align teams fast. Build tokens, components, and documentation that scale.",
        category: "Design",
        level: "intermediate",
        durationWeeks: 6,
        price: 72,
        imageUrl:
          "https://images.pexels.com/photos/4143795/pexels-photo-4143795.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        instructorName: "Devon Brooks",
        rating: 4.8,
        reviewCount: 190,
        outcomes: [
          "Create a scalable UI system",
          "Document components effectively",
          "Align teams with design tokens",
        ],
        syllabus: [
          "Foundation tokens",
          "Component architecture",
          "Documentation",
        ],
        reviews: [
          { name: "Priya Sharma", rating: 5, comment: "Great system thinking." },
        ],
        videoQuery: "design systems course",
        createdBy: adminUser._id,
      },
      {
        title: "Analytics for Growth",
        description:
          "Own metrics dashboards and data storytelling. Build KPI frameworks and communicate insights clearly.",
        category: "Data",
        level: "beginner",
        durationWeeks: 4,
        price: 55,
        imageUrl:
          "https://images.pexels.com/photos/5473950/pexels-photo-5473950.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        instructorName: "Rina Takahashi",
        rating: 4.7,
        reviewCount: 155,
        outcomes: [
          "Build KPI dashboards",
          "Tell stories with data",
          "Improve metric adoption",
        ],
        syllabus: [
          "Metrics frameworks",
          "Dashboard design",
          "Storytelling with data",
        ],
        reviews: [
          { name: "Hassan Nur", rating: 4, comment: "Good fundamentals." },
        ],
        videoQuery: "data analytics dashboard tutorial",
        createdBy: adminUser._id,
      },
      {
        title: "Cloud Deployments with Docker",
        description:
          "Ship containers and deploy services with confidence. Build deployment pipelines and production-ready stacks.",
        category: "Engineering",
        level: "intermediate",
        durationWeeks: 5,
        price: 64,
        imageUrl:
          "https://images.pexels.com/photos/1181325/pexels-photo-1181325.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        instructorName: "Devon Brooks",
        rating: 4.6,
        reviewCount: 120,
        outcomes: [
          "Containerize production apps",
          "Build a deployment pipeline",
          "Ship safely to production",
        ],
        syllabus: [
          "Docker fundamentals",
          "Container orchestration basics",
          "Deployment pipelines",
        ],
        reviews: [
          { name: "Jordan Lee", rating: 4, comment: "Practical and clear." },
        ],
        videoQuery: "docker deployment tutorial",
        createdBy: adminUser._id,
      },
      {
        title: "Data Visualization Studio",
        description:
          "Turn messy data into compelling dashboards. Learn chart selection, storytelling, and stakeholder reporting.",
        category: "Data",
        level: "intermediate",
        durationWeeks: 5,
        price: 60,
        imageUrl:
          "https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        instructorName: "Rina Takahashi",
        rating: 4.8,
        reviewCount: 180,
        outcomes: [
          "Turn data into insights",
          "Design executive-ready dashboards",
          "Deliver a stakeholder narrative",
        ],
        syllabus: [
          "Visualization principles",
          "Dashboard storytelling",
          "Stakeholder-ready reports",
        ],
        reviews: [
          { name: "Priya Sharma", rating: 5, comment: "Loved the dashboards." },
        ],
        videoQuery: "data visualization course",
        createdBy: adminUser._id,
      },
      {
        title: "Marketing Analytics Lab",
        description:
          "Measure funnel performance and optimize spend. Track attribution, build reports, and improve ROI.",
        category: "Marketing",
        level: "beginner",
        durationWeeks: 4,
        price: 49,
        imageUrl:
          "https://images.pexels.com/photos/6476580/pexels-photo-6476580.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        instructorName: "Hassan Nur",
        rating: 4.5,
        reviewCount: 110,
        outcomes: [
          "Map the funnel end-to-end",
          "Improve CAC and ROAS",
          "Make campaign decisions with data",
        ],
        syllabus: [
          "Marketing KPIs",
          "Attribution basics",
          "Campaign optimization",
        ],
        reviews: [
          { name: "Selena Grant", rating: 4, comment: "Clear and easy." },
        ],
        videoQuery: "marketing analytics tutorial",
        createdBy: adminUser._id,
      },
      {
        title: "Product Leadership",
        description:
          "Lead cross-functional teams with confidence. Improve roadmapping, stakeholder alignment, and execution.",
        category: "Product",
        level: "advanced",
        durationWeeks: 6,
        price: 99,
        imageUrl:
          "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        instructorName: "Amara Okafor",
        rating: 4.9,
        reviewCount: 260,
        outcomes: [
          "Lead cross-functional execution",
          "Prioritize strategic initiatives",
          "Drive stakeholder alignment",
        ],
        syllabus: [
          "Roadmapping",
          "Stakeholder alignment",
          "Leadership strategy",
        ],
        reviews: [
          { name: "Maya Patel", rating: 5, comment: "Great leadership lens." },
        ],
        videoQuery: "product leadership course",
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
