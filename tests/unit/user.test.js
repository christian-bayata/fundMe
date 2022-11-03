require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");

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

  it("should format user data before response", async () => {
    const payload = {};
  });
});
