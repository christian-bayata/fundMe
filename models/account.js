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
    number: {
      type: Number,
      required: true,
      unique: true,
      es_indexed: true,
    },
    type: {
      type: String,
      required: true,
      es_indexed: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      es_indexed: true,
    },
  },
  { timestamps: true }
);

/* Creates the account model */
const Account = mongoose.model("Account", AccountSchema);
module.exports = Account;
