const request = require("supertest");
const User = require("../../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let server;
let baseURL = "/api/user";

describe("User Controller", () => {
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

  describe("Creating a new user", () => {
    it("should fail if the first name is missing from payload", async () => {
      const badPayload = {
        lastName: "user_lastname",
        email: "user@gmail.com",
        password: "user_password",
      };

      const response = await request(server).post(`${baseURL}/signup`).send(badPayload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/required/i);
      expect(response.body.message).toMatch(/firstName/i);
    });

    it("should fail if the last name is missing from payload", async () => {
      const badPayload = {
        firstName: "user_firstname",
        email: "user@gmail.com",
        password: "user_password",
      };

      const response = await request(server).post(`${baseURL}/signup`).send(badPayload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/required/i);
      expect(response.body.message).toMatch(/lastName/);
    });

    it("should fail if the email is missing from payload", async () => {
      const badPayload = {
        firstName: "user_firstname",
        lastName: "user_lastname",
        password: "user_password",
      };

      const response = await request(server).post(`${baseURL}/signup`).send(badPayload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/required/i);
      expect(response.body.message).toMatch(/email/i);
    });

    it("should fail if the password is missing from payload", async () => {
      const badPayload = {
        firstName: "user_firstname",
        lastName: "user_lastname",
        email: "user@gmail.com",
      };

      const response = await request(server).post(`${baseURL}/signup`).send(badPayload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/required/i);
      expect(response.body.message).toMatch(/Password/i);
    });

    it("should fail if the user already exists", async () => {
      await User.insertMany([
        {
          firstName: "user_firstname",
          lastName: "user_lastname",
          email: "user@gmail.com",
          password: await bcrypt.hash("user_password", 10),
        },
      ]);

      const badPayload = {
        firstName: "user_firstname1",
        lastName: "user_lastname2",
        email: "user@gmail.com",
        password: "user_password",
      };

      const response = await request(server).post(`${baseURL}/signup`).send(badPayload);
      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists/i);
    });

    it("should pass if the payload requirements are all met", async () => {
      const acceptedPayload = {
        firstName: "user_firstname",
        lastName: "user_lastname",
        email: "user@gmail.com",
        password: "user_password",
      };

      const response = await request(server).post(`${baseURL}/signup`).send(acceptedPayload);
      expect(response.status).toBe(201);
      expect(response.body.message).toMatch(/successfully signed/i);
    });
  });
});
