const request = require("supertest");
const User = require("../../models/user");
const mongoose = require("mongoose");
const { Client } = require("@elastic/elasticsearch");

let server;
let baseURL = "/api";

describe("Search Controller", () => {
  beforeAll(() => {
    server = require("../../server");
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    server.close();
    mongoose.disconnect();
  });

  describe("Search for user", () => {
    it("should fail if flag is not provided", async () => {
      const response = await request(server).get(`${baseURL}/users/_search?query=someQuery`);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/provide a flag/i);
    });

    it("should fail if invalid flag is provided", async () => {
      const response = await request(server).get(`${baseURL}/users/_search?query=someQuery&flag=somethingElse`);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/invalid flag/i);
    });

    it("should succeed given all requirements are met", async () => {
      const account = await User.create({
        firstName: "user_first",
        lastName: "user_last",
        email: "user@gmail.com",
        password: "user_password",
      });

      const response = await request(server).get(`${baseURL}/users/_search?query=${account.firstName}&flag=user`);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successful/i);
    });
  });
});
