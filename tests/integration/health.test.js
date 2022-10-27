let server = require("../../server");
const request = require("supertest");

describe("Health Check", () => {
  it("should ping the API with a success response", async () => {
    const response = await request(server).get("/health-check");
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/passed/i);
    server.close();
  });
});
