import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.ts";

const testEmail = `test-${Date.now()}@example.com`;
const testPassword = "testpass123";

describe("Auth API", () => {
  it("POST /auth/signup — creates a user and returns a token", async () => {
    const res = await request(app)
      .post("/auth/signup")
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
  });

  it("POST /auth/login — returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: testEmail, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
