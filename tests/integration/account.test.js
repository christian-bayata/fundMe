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
    it("should fail if user does not provide any token", async () => {
      const badPayload = {
        name: "user_name",
        type: "savings",
      };

      const response = await request(server).post(`${baseURL}/create-account`).set("authorization", null).send(badPayload);
      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/unauthenticated/i);
    });

    it("should fail if user's token is not valid", async () => {
      const token = new User().generateJsonWebToken();
      const badPayload = {
        name: "user_name",
        type: "savings",
      };

      const response = await request(server).post(`${baseURL}/create-account`).set("authorization", "iuiyuydsdstrytuyiuoipoijkhjghg4565768796rd").send(badPayload);
      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/unauthenticated/i);
    });

    it("should fail if user does not provide a name", async () => {
      const token = new User().generateJsonWebToken();

      const badPayload = {
        type: "savings",
      };

      const response = await request(server).post(`${baseURL}/create-account`).set("authorization", token).send(badPayload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/name/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should fail if user does not provide an account type", async () => {
      const token = new User().generateJsonWebToken();

      const badPayload = {
        name: "user_name",
      };

      const response = await request(server).post(`${baseURL}/create-account`).set("authorization", token).send(badPayload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/type/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should fail if user account already exists", async () => {
      const token = new User().generateJsonWebToken();
      const decode = jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => decoded);

      console.log("************decode token: ", decode);
      console.log("************decode Id: ", decode._id);

      await Account.insertMany([
        {
          name: "user_name",
          type: "savings",
          number: "1234567890",
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
        user: decode._id,
      };

      console.log("*************Payload: ", payload);

      const response = await request(server).post(`${baseURL}/create-account`).set("authorization", token).send(payload);
      // expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists/i);
    });
  });
});
