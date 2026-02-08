const request = require("supertest");
const app = require("../src/app");

describe("Health check", () => {
  it("GET / should return API status", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});
