require("dotenv").config();
const request = require("supertest");
const Account = require("../../models/account");
const User = require("../../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let server;
let baseURL = "/api/account";

describe("Account Controller", () => {
  beforeAll(() => {
    server = require("../../server");
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Account.deleteMany({});
  });

  afterAll(async () => {
    server.close();
    mongoose.disconnect();
  });

  describe("Creating a new user account", () => {
    it("should fail if user's token is not valid", async () => {
      const token = new User().generateJsonWebToken();
      const payload = {
        name: "user_name",
        type: "savings",
        email: "user1@gmail.com",
      };

      const response = await request(server).post(`${baseURL}/create-account`).set("authorization", "iuiyuydsdstrytuyiuoipoijkhjghg4565768796rd").send(payload);
      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/unauthenticated/i);
    });

    it("should fail if user does not provide any token", async () => {
      const payload = {
        name: "user_name",
        type: "savings",
        email: "user1@gmail.com",
      };

      const response = await request(server).post(`${baseURL}/create-account`).set("authorization", null).send(payload);
      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/unauthenticated/i);
    });

    it("should fail if user does not provide a name", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user@gmail.com", isAdmin: false }).generateJsonWebToken();

      const payload = {
        type: "savings",
        email: "user1@gmail.com",
      };

      const response = await request(server).post(`${baseURL}/create-account`).set("authorization", token).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/name/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should fail if user does not provide an account type", async () => {
      const token = new User().generateJsonWebToken();

      const payload = {
        name: "user_name",
        email: "user1@gmail.com",
      };

      const response = await request(server).post(`${baseURL}/create-account`).set("authorization", token).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/type/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should fail if user account already exists", async () => {
      const token = new User().generateJsonWebToken();
      const decode = jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => decoded);

      await Account.insertMany([
        {
          name: "user_name",
          type: "savings",
          email: "user1@gmail.com",
          accountNum: "1234567890",
          balance: {
            avail: 0,
            total: 0,
          },
          user: decode._id,
        },
      ]);

      const payload = {
        name: "user_name",
        type: "savings",
        email: "user1@gmail.com",
      };

      const response = await request(server).post(`${baseURL}/create-account`).set("authorization", token).send(payload);
      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists/i);
    });

    it("should successfully create account", async () => {
      const token = new User().generateJsonWebToken();
      const decode = jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => decoded);

      const payload = {
        name: "user_name",
        type: "savings",
        email: "user1@gmail.com",
      };

      const response = await request(server).post(`${baseURL}/create-account`).set("authorization", token).send(payload);
      expect(response.status).toBe(201);
      expect(response.body.message).toMatch(/Account successfully created/i);
    });
  });

  describe("Fetch users' account(s)", () => {
    it("should fail if user is not an admin", async () => {
      const payload = { _id: mongoose.Types.ObjectId(), email: "user@gmail.com", isAdmin: false };
      const user = new User(payload);
      const token = user.generateJsonWebToken();

      const response = await request(server).get(`${baseURL}/get-accounts`).set("authorization", token);
      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Unauthorized/i);
    });

    it("should fail if user does provide a flag", async () => {
      const payload = { _id: mongoose.Types.ObjectId(), email: "user@gmail.com", isAdmin: true };
      const user = new User(payload);
      const token = user.generateJsonWebToken();

      const response = await request(server).get(`${baseURL}/get-accounts?flag=`).set("authorization", token);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/provide a flag/i);
    });

    it("should fail if user provides flag but not account number", async () => {
      const payload = { _id: mongoose.Types.ObjectId(), email: "user@gmail.com", isAdmin: true };
      const user = new User(payload);
      const token = user.generateJsonWebToken();

      const response = await request(server).get(`${baseURL}/get-accounts?flag=single&acct_num=`).set("authorization", token);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Provide an account number/i);
    });

    it("should fail if user account cannot be found", async () => {
      const payload = { _id: mongoose.Types.ObjectId(), email: "user@gmail.com", isAdmin: true };
      const user = new User(payload);
      const token = user.generateJsonWebToken();

      const response = await request(server).get(`${baseURL}/get-accounts?flag=single&acct_num=0987654332`).set("authorization", token);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/account does not exist/i);
    });

    it("should successfully fetch user account", async () => {
      const payload = { _id: mongoose.Types.ObjectId(), email: "user@gmail.com", isAdmin: true };
      const user = new User(payload);
      const token = user.generateJsonWebToken();

      const account = await Account.create({
        name: "user1_name",
        type: "savings",
        email: "user1@gmail.com",
        accountNum: "1234567890",
      });

      const response = await request(server).get(`${baseURL}/get-accounts?flag=single&acct_num=${account.accountNum}`).set("authorization", token);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully retrieved/i);
      expect(response.body.message).toMatch(/user account/i);
    });

    it("should successfully fetch all user accounts", async () => {
      const payload = { _id: mongoose.Types.ObjectId(), email: "user@gmail.com", isAdmin: true };
      const user = new User(payload);
      const token = user.generateJsonWebToken();

      const response = await request(server).get(`${baseURL}/get-accounts?flag=all`).set("authorization", token);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully retrieved/i);
      expect(response.body.message).toMatch(/all user accounts/i);
    });
  });

  describe("Update user account", () => {
    it("should fail if user is not an admin", async () => {
      const payload = { _id: mongoose.Types.ObjectId(), email: "user@gmail.com", isAdmin: false };
      const user = new User(payload);
      const token = user.generateJsonWebToken();

      const response = await request(server).get(`${baseURL}/get-accounts`).set("authorization", token);
      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Unauthorized/i);
    });

    it("should fail if user does not provide name", async () => {
      const payload = { _id: mongoose.Types.ObjectId(), email: "user@gmail.com", isAdmin: false };
      const user = new User(payload);
      const token = user.generateJsonWebToken();

      const updatePayload = {};

      const response = await request(server).patch(`${baseURL}/update-account`).set("authorization", token).send(updatePayload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/provide the name/i);
    });
  });
});
