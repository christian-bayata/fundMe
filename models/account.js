require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      es_indexed: true,
    },
    accountNum: {
      type: String,
      required: true,
      unique: true,
      es_indexed: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      es_indexed: true,
    },
    type: {
      type: String,
      required: true,
      es_indexed: true,
    },
    available: {
      type: Number,
      default: 0.0,
    },
    total: {
      type: Number,
      default: 0.0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      es_indexed: true,
    },
    dateOfLastAction: Date,
  },
  { timestamps: true }
);

/* Creates the account model */
const Account = mongoose.model("Account", AccountSchema);
module.exports = Account;
