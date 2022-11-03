require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");

describe("Generate Auth Token", () => {
  it("should successfully generate a valid JWT token", async () => {
    const payload = { userId: mongoose.Types.ObjectId(), email: "user@gmail.com", isAdmin: true };
    // Create a new user
    const user = new User(payload);
    // Generate token
    const getToken = user.generateJsonWebToken();
    const decoded = await jwt.verify(getToken, process.env.JWT_SECRET_KEY);

    expect(decoded).toMatchObject(payload);
  });
});

describe("Format User Data with Crypto", () => {
  it("should format user data before response", async () => {
    const payload = {
      email: "user@gmail.com",
      password: "user_password",
    };

    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(payload), "ojkhgftuuiyut798098978675645edfg").toString();
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, "ojkhgftuuiyut798098978675645edfg").toString(CryptoJS.enc.Utf8);

    expect(decryptedData).toContain(payload.email);
    expect(decryptedData).toContain(payload.password);
  });
});
