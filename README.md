# Online Courses Backend API

![Status](https://img.shields.io/badge/status-local--dev-yellow)

## Project Overview
This is a Node.js + Express backend API for the Online Courses website. It uses MongoDB with Mongoose, JWT authentication, and validation middleware to support a complete Web 2 backend project.

Live API: (add your deployed URL here)

## Requirements Checklist
- [x] Node.js + Express server
- [x] Modular structure (routes, controllers, models, middleware, config)
- [x] MongoDB + Mongoose models
- [x] Two collections: `User`, `Course`
- [x] Auth with JWT + bcrypt hashing
- [x] Protected private endpoints (JWT middleware)
- [x] Validation + error handling
- [x] README with setup + API docs
- [x] Deployment instructions + env vars

## Setup & Installation
1. Install dependencies:
   - `npm install`
2. Create environment variables:
   - Copy `.env.example` to `.env`
   - Update `MONGO_URI` and `JWT_SECRET`
3. Run the server:
   - `npm run dev`

## API Documentation

### Auth Routes (Public)
- `POST /api/auth/register` - Register a new user (hashed password)
- `POST /api/auth/login` - Authenticate user

### User Routes (Private)
- `GET /api/users/profile` - Get logged-in user profile
- `PUT /api/users/profile` - Update user profile

### Courses Routes (Private, second resource)
- `POST /api/courses` - Create a new course
- `GET /api/courses` - Get all user courses
- `GET /api/courses/:id` - Get a specific course
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course

### Public Catalog (Optional)
- `GET /api/courses/public` - Public catalog with optional `q`, `level`, `category`

### OpenAPI Spec
- `GET /api/docs/openapi` returns the OpenAPI JSON spec.

## API Examples

### Register
Request:
```
POST /api/auth/register
{
  "username": "student1",
  "email": "student1@example.com",
  "password": "Password123"
}
```
Response:
```
{
  "id": "...",
  "username": "student1",
  "email": "student1@example.com",
  "token": "<jwt>"
}
```

### Login
Request:
```
POST /api/auth/login
{
  "email": "student1@example.com",
  "password": "Password123"
}
```
Response:
```
{
  "id": "...",
  "username": "student1",
  "email": "student1@example.com",
  "token": "<jwt>"
}
```

### Create Course
Request (Private):
```
POST /api/courses
Authorization: Bearer <token>
{
  "title": "Node API Basics",
  "description": "Build a REST API with Express and MongoDB.",
  "category": "Engineering",
  "price": 59,
  "level": "beginner",
  "durationWeeks": 4,
  "imageUrl": "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
}
```
Response:
```
{
  "_id": "...",
  "title": "Node API Basics",
  "description": "Build a REST API with Express and MongoDB.",
  "category": "Engineering",
  "price": 59,
  "level": "beginner",
  "durationWeeks": 4,
  "imageUrl": "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "createdBy": "..."
}
```

## Frontend Connection
The demo forms live in `courses.html` and call the API directly.
If your backend runs on a different host or port, update `API_BASE` in `script.js`.

## Postman
Import `postman_collection.json` into Postman and set:
- `baseUrl` (default `http://localhost:3000`)
- `token` after login
- `courseId` after creating a course

## Seed Data (Optional)
- `npm run seed`
Creates a demo user + demo courses.
Login with:
- `student1@example.com`
- `Password123`

## Tests
- `npm test`
Runs a basic health-check test with Jest + Supertest.

## Deployment (Render or Railway)
1. Push this repo to GitHub.
2. Create a new Web Service.
3. Set environment variables (use `.env.production.example` as reference):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES`
   - `PORT` (Render usually sets this automatically)
4. Build Command: `npm install`
5. Start Command: `npm start`
6. After deploy, verify:
   - `GET /` returns `Online Courses API is running`

## Demo Steps (For Defense)
1. `npm run dev`
2. Open `courses.html` using Live Server.
3. Register a user, log in, and create a course.
4. Confirm courses list updates.
5. Show OpenAPI file at `/api/docs/openapi`.

## Defense Notes (What to Explain)
- Modular structure: controllers, routes, models, middleware, config, validators.
- Auth flow: register/login + bcrypt hashing + JWT token.
- Protected endpoints with `Authorization: Bearer <token>`.
- MongoDB + Mongoose models (`User`, `Course`).
- Validation with Joi and global error handling middleware.
- Deployment steps and environment variables.
- Basic test suite with Jest + Supertest.

## Notes
- All private routes require an `Authorization: Bearer <token>` header.
- Replace the course resource with another resource if your topic changes.

