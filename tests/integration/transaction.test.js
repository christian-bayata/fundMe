require("dotenv").config();
const request = require("supertest");
const Account = require("../../models/account");
const User = require("../../models/user");
const Transaction = require("../../models/transaction");
const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

let server;
let baseURL = "/api/transaction";

describe("Transaction Controller", () => {
  beforeAll(() => {
    server = require("../../server");
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});
  });

  afterAll(async () => {
    server.close();
    mongoose.disconnect();
  });

  describe("Fund my account with `my_account` flag", () => {
    it("should fail if user's token is not valid", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: false }).generateJsonWebToken();

      const payload = {
        amount: "1000",
        flag: "my_account",
      };

      const response = await request(server).post(`${baseURL}/fund-user-account`).set("authorization", "vhjhiu80uigfytuytugvjoiugejvbmgjyiuhewk").send(payload);
      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/unauthenticated/i);
    });

    it("should fail if user does not provide amount", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: false }).generateJsonWebToken();
      const payload = {
        amount: "",
        flag: "my_account",
      };

      const response = await request(server).post(`${baseURL}/fund-user-account`).set("authorization", token).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/provide the amount/i);
    });

    it("should fail if user does not provide a flag", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: false }).generateJsonWebToken();
      const payload = {
        amount: "1000",
      };

      const response = await request(server).post(`${baseURL}/fund-user-account`).set("authorization", token).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/provide a flag/i);
    });

    it("should fail if user provides an invalid flag", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: false }).generateJsonWebToken();
      const payload = {
        amount: "1000",
        flag: "some_value",
      };

      const response = await request(server).post(`${baseURL}/fund-user-account`).set("authorization", token).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/invalid flag/i);
    });

    /*************************************************************************************************************
     *
     ******************************************* MY_ACCOUNT FLAG ***************************************
     *
     **************************************************************************************************************/

    it("should fail if the user account does not exist", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: false }).generateJsonWebToken();

      const payload = {
        amount: "10500",
        flag: "my_account",
      };

      const response = await request(server).post(`${baseURL}/fund-user-account`).set("authorization", token).send(payload);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/account does not exist/i);
    });

    it("should succeed but not include any charges", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: false }).generateJsonWebToken();
      const decode = jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => decoded);

      const account = await Account.create({
        name: "user_name",
        type: "savings",
        email: "user@gmail.com",
        user: decode._id,
        accountNum: Math.random().toString().slice(2, 12),
      });

      const transaction = await Transaction.create({
        refNo: crypto.randomBytes(5).toString("hex").toUpperCase(),
        transType: "credit",
        transDate: Date.now(),
        amount: 0,
        user: account.user,
        account: account._id,
        status: "success",
      });

      const payload = {
        amount: "1000",
        flag: "my_account",
      };

      const response = await request(server).post(`${baseURL}/fund-user-account`).set("authorization", token).send(payload);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully funded your account/i);
    });

    it("should succeed include charges", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: false }).generateJsonWebToken();
      const decode = jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => decoded);

      const account = await Account.create({
        name: "user_name",
        type: "savings",
        email: "user@gmail.com",
        user: decode._id,
        accountNum: Math.random().toString().slice(2, 12),
      });

      const transaction = await Transaction.create({
        refNo: crypto.randomBytes(5).toString("hex").toUpperCase(),
        transType: "credit",
        transDate: Date.now(),
        amount: 0,
        user: account.user,
        account: account._id,
        status: "success",
      });

      const payload = {
        amount: "10500",
        flag: "my_account",
      };

      const response = await request(server).post(`${baseURL}/fund-user-account`).set("authorization", token).send(payload);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully funded your account/i);
    });

    /*************************************************************************************************************
     *
     ******************************************* OTHER_ACCOUNT FLAG ***************************************
     *
     **************************************************************************************************************/

    it("should fail if the user does not provide an account number", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: false }).generateJsonWebToken();

      const payload = {
        amount: "10500",
        flag: "other_account",
      };

      const response = await request(server).post(`${baseURL}/fund-user-account`).set("authorization", token).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/provide the account number/i);
    });

    it("should fail if the sender provides a wrong account number", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: false }).generateJsonWebToken();

      const payload = {
        amount: "10500",
        flag: "other_account",
        accountNum: "0987654321",
      };

      const response = await request(server).post(`${baseURL}/fund-user-account`).set("authorization", token).send(payload);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/your account does not exist/i);
    });

    it("should fail if the sender provides a wrong recipient account number", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: false }).generateJsonWebToken();
      const decode = jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => decoded);

      await Account.create({
        name: "user_name",
        type: "savings",
        email: "user@gmail.com",
        user: decode._id,
        accountNum: Math.random().toString().slice(2, 12),
      });

      const payload = {
        amount: "10500",
        flag: "other_account",
        accountNum: "0987654321",
      };

      const response = await request(server).post(`${baseURL}/fund-user-account`).set("authorization", token).send(payload);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/other account does not exist/i);
    });

    it("should succeed but not include any charges", async () => {
      const token = new User({ _id: mongoose.Types.ObjectId(), email: "user1@gmail.com", isAdmin: false }).generateJsonWebToken();
      const decode = jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => decoded);

      const accounts = await Account.insertMany([
        {
          name: "user1_name",
          type: "savings",
          email: "user1@gmail.com",
          user: decode._id,
          accountNum: Math.random().toString().slice(2, 12),
        },
        {
          name: "user2_name",
          type: "savings",
          email: "user2@gmail.com",
          user: mongoose.Types.ObjectId(),
          accountNum: Math.random().toString().slice(2, 12),
        },
      ]);

      await Transaction.create({
        refNo: crypto.randomBytes(5).toString("hex").toUpperCase(),
        transType: "debit",
        transDate: Date.now(),
        amount: 0,
        user: accounts[0]._id,
        account: accounts[0]._id,
        status: "success",
      });

      const payload = {
        amount: "1000",
        flag: "other_account",
        accountNum: accounts[1].accountNum,
      };

      const response = await request(server).post(`${baseURL}/fund-user-account`).set("authorization", token).send(payload);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully funded other account/i);
    });
  });
});
