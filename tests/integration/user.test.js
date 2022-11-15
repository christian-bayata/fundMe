const request = require("supertest");
const User = require("../../models/user");
const mongoose = require("mongoose");

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

  describe("Retrieving User(s)", () => {
    it("should fail if user is not an admin", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: false }).generateJsonWebToken();

      const response = await request(server).get(`${baseURL}/get-users?flag=all`).set("authorization", token);
      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/unauthorized/i);
    });

    it("should fail if user does not provide a flag", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: true }).generateJsonWebToken();

      const response = await request(server).get(`${baseURL}/get-users?flag=`).set("authorization", token);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/provide a flag/i);
    });

    it("should fail if user provides an invalid flag", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: true }).generateJsonWebToken();

      const response = await request(server).get(`${baseURL}/get-users?flag=some_value`).set("authorization", token);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/invalid flag/i);
    });

    it("should fail if user does not provide an ID", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: true }).generateJsonWebToken();

      const response = await request(server).get(`${baseURL}/get-users?flag=single&id=`).set("authorization", token);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/provide the user id/i);
    });

    it("should fail if user provides an ID that does not exist", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: true }).generateJsonWebToken();

      const response = await request(server).get(`${baseURL}/get-users?flag=single&id=${mongoose.Types.ObjectId()}`).set("authorization", token);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/user does not exist/i);
    });

    it("should successfully retrieve a single user", async () => {
      const user = await User.create({
        firstName: "user_firstname",
        lastName: "user_lastname",
        email: "user@gmail.com",
        password: "winnie11",
      });
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: true }).generateJsonWebToken();

      const response = await request(server).get(`${baseURL}/get-users?flag=single&id=${user._id}`).set("authorization", token);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully retrieved user/i);
    });

    it("should successfully retrieve a single user", async () => {
      const user = await User.create({
        firstName: "user_firstname",
        lastName: "user_lastname",
        email: "user@gmail.com",
        password: "user_password",
      });
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: true }).generateJsonWebToken();

      const response = await request(server).get(`${baseURL}/get-users?flag=all&id=${user._id}`).set("authorization", token);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully retrieved all users/i);
    });
  });

  describe("Update A User", () => {
    it("should fail if user provides an invalid token", async () => {
      const user = await User.create({
        firstName: "user_firstname",
        lastName: "user_lastname",
        email: "user@gmail.com",
        password: "user_password",
      });

      const payload = {
        firstName: "user_firstName",
        lastName: "user_lastName",
      };

      const response = await request(server).patch(`${baseURL}/update-user/${user._id}`).set("authorization", "vhjhiu80uigfytuytugvjoiugejvbmgjyiuhewk").send(payload);
      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/unauthenticated/i);
    });

    it("should fail if user does not exist", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: true }).generateJsonWebToken();

      const payload = {
        firstName: "user_firstName",
        lastName: "user_lastName",
      };

      const response = await request(server).patch(`${baseURL}/update-user/${mongoose.Types.ObjectId()}`).set("authorization", token).send(payload);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/user does not exist/i);
    });

    it("should succeed if all requirements are met", async () => {
      const user = await User.create({
        firstName: "user_firstname",
        lastName: "user_lastname",
        email: "user@gmail.com",
        password: "user_password",
      });

      const token = user.generateJsonWebToken();

      const payload = {
        firstName: "user_firstName",
        lastName: "user_lastName",
      };

      const response = await request(server).patch(`${baseURL}/update-user/${user._id}`).set("authorization", token).send(payload);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully updated user/i);
    });
  });

  describe("Delete A User", () => {
    it("should fail if user is not an admin", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: false }).generateJsonWebToken();

      const user = await User.create({
        firstName: "user_firstname",
        lastName: "user_lastname",
        email: "user@gmail.com",
        password: "user_password",
      });

      const response = await request(server).delete(`${baseURL}/delete-user/${user._id}`).set("authorization", token);
      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/unauthorized/i);
    });

    it("should fail if user ID does not exist", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: true }).generateJsonWebToken();

      const response = await request(server).delete(`${baseURL}/delete-user/${mongoose.Types.ObjectId()}`).set("authorization", token);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not exist/i);
    });

    it("should succeed if all requirements are met", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: true }).generateJsonWebToken();

      const user = await User.create({
        firstName: "user_firstname",
        lastName: "user_lastname",
        email: "user@gmail.com",
        password: "user_password",
      });

      const response = await request(server).delete(`${baseURL}/delete-user/${user._id}`).set("authorization", token);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully deleted/i);
    });
  });
});
