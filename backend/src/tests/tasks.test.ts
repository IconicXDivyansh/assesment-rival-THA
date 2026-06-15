import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import app from "../app.ts";

let token: string;

beforeAll(async () => {
  // Create a test user and get token
  const res = await request(app)
    .post("/auth/signup")
    .send({ email: `tasktest-${Date.now()}@example.com`, password: "testpass123" });

  token = res.body.data.token;
});

describe("Tasks API", () => {
  it("POST /tasks — creates a task when authenticated", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test task from vitest" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Test task from vitest");
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe("pending");
  });
});
