require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      es_indexed: true,
    },
    lastName: {
      type: String,
      required: true,
      es_indexed: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      es_indexed: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordDate: Date,
  },
  { timestamps: true }
);

/* Generate JSON web token for user */
UserSchema.methods.generateJsonWebToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      email: this.email,
      isAdmin: this.isAdmin,
    },
    process.env.JWT_SECRET_KEY
  );
};

/* Hash the password before storing it in the database */
UserSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
  } catch (err) {
    return next(err);
  }
});

/* Compare password using bcrypt.compare */
UserSchema.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

/* Creates the user model */
const User = mongoose.model("User", UserSchema);
module.exports = User;
