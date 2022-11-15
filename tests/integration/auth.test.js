const request = require("supertest");
const User = require("../../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

let server;
let baseURL = "/api/auth";

describe("Auth Controller", () => {
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
      const payload = {
        lastName: "user_lastname",
        email: "user@gmail.com",
        password: "user_password",
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/required/i);
      expect(response.body.message).toMatch(/firstName/i);
    });

    it("should fail if the last name is missing from payload", async () => {
      const payload = {
        firstName: "user_firstname",
        email: "user@gmail.com",
        password: "user_password",
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/required/i);
      expect(response.body.message).toMatch(/lastName/);
    });

    it("should fail if the email is missing from payload", async () => {
      const payload = {
        firstName: "user_firstname",
        lastName: "user_lastname",
        password: "user_password",
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/required/i);
      expect(response.body.message).toMatch(/email/i);
    });

    it("should fail if the password is missing from payload", async () => {
      const payload = {
        firstName: "user_firstname",
        lastName: "user_lastname",
        email: "user@gmail.com",
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
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

      const payload = {
        firstName: "user_firstname1",
        lastName: "user_lastname2",
        email: "user@gmail.com",
        password: "user_password",
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
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

  describe("Login an already signed up user", () => {
    it("should fail if email is mising", async () => {
      const payload = { password: "user_password" };

      const response = await request(server).post(`${baseURL}/login`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/email/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should fail if password is mising", async () => {
      const payload = { email: "user@gmail.com" };

      const response = await request(server).post(`${baseURL}/login`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/password/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should fail if user is not already signed up", async () => {
      await User.insertMany([
        {
          firstName: "user_firstname",
          lastName: "user_lastname",
          email: "user@gmail.com",
          password: await bcrypt.hash("user_password", 10),
        },
      ]);

      const payload = { email: "user11@gmail.com", password: "user_password" };

      const response = await request(server).post(`${baseURL}/login`).send(payload);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/Sorry you do not have an account with us/i);
    });

    it("should fail if password does not match", async () => {
      await User.insertMany([
        {
          firstName: "user_firstname",
          lastName: "user_lastname",
          email: "user@gmail.com",
          password: await bcrypt.hash("user_password", 10),
        },
      ]);

      const payload = { email: "user@gmail.com", password: "user123_password" };

      const response = await request(server).post(`${baseURL}/login`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Incorrect password/i);
    });

    it("should succeed if user logs in successfully", async () => {
      await User.insertMany([
        {
          firstName: "user_firstname",
          lastName: "user_lastname",
          email: "user@gmail.com",
          password: await bcrypt.hash("user_password", 10),
        },
      ]);

      const payload = { email: "user@gmail.com", password: "user_password" };

      const response = await request(server).post(`${baseURL}/login`).send(payload);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Successfully logged in/i);
    });
  });

  describe("Forgot password", () => {
    it("should fail if email is mising", async () => {
      const payload = { email: "" };

      const response = await request(server).post(`${baseURL}/forgot-password`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/provide a valid email/i);
    });

    it("should fail if the email is wrong", async () => {
      await User.insertMany([
        {
          firstName: "user_firstname",
          lastName: "user_lastname",
          email: "user@gmail.com",
          password: await bcrypt.hash("user_password", 10),
        },
      ]);

      const payload = { email: "user11@gmail.com" };

      const response = await request(server).post(`${baseURL}/forgot-password`).send(payload);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/sorry/i);
      expect(response.body.message).toMatch(/please sign up/i);
    });

    it("should succeed if the email is right", async () => {
      await User.create({
        firstName: "user_firstname",
        lastName: "user_lastname",
        email: "user@gmail.com",
        password: await bcrypt.hash("user_password", 10),
      });

      const goodPayload = { email: "user@gmail.com" };

      const response = await request(server).post(`${baseURL}/forgot-password`).send(goodPayload);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/token successfully sent/i);
    });
  });

  describe("Reset User Password", () => {
    it("should fail reset token cannot be found", async () => {
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      await User.create({
        firstName: "user1_firstname",
        lastName: "user1_lastname",
        email: "user111@gmail.com",
        password: await bcrypt.hash("user_password11111", 10),
      });

      const payload = {
        password: "user_password",
        confirmPassword: "user_password",
      };

      const response = await request(server).patch(`${baseURL}/reset-password/${resetPasswordToken}`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Password reset token is invalid/i);
    });

    it("should fail if the token has expired", async () => {
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      await User.create({
        firstName: "user1_firstname",
        lastName: "user1_lastname",
        email: "user111@gmail.com",
        password: await bcrypt.hash("user_password11111", 10),
        resetPasswordToken,
        resetPasswordDate: new Date("2022-11-09T10:08:06.050+00:00"),
      });

      const payload = {
        password: "user_password",
        confirmPassword: "user_password",
      };

      const response = await request(server).patch(`${baseURL}/reset-password/${resetPasswordToken}`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Password reset token has expired/i);
    });

    it("should fail if the token has expired", async () => {
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      await User.create({
        firstName: "user1_firstname",
        lastName: "user1_lastname",
        email: "user111@gmail.com",
        password: await bcrypt.hash("user_password11111", 10),
        resetPasswordToken,
        resetPasswordDate: Date.now(),
      });

      const payload = {
        password: "user_password1",
        confirmPassword: "user_password12",
      };

      const response = await request(server).patch(`${baseURL}/reset-password/${resetPasswordToken}`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Password does not match/i);
    });

    it("should succeed if password matches", async () => {
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      await User.create({
        firstName: "user1_firstname",
        lastName: "user1_lastname",
        email: "user111@gmail.com",
        password: await bcrypt.hash("user_password11111", 10),
        resetPasswordToken,
        resetPasswordDate: Date.now(),
      });

      const payload = {
        password: "user_password12",
        confirmPassword: "user_password12",
      };

      const response = await request(server).patch(`${baseURL}/reset-password/${resetPasswordToken}`).send(payload);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Password reset is successful/i);
    });
  });
});
