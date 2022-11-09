require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    refNo: {
      type: String,
      required: true,
      es_indexed: true,
    },
    branch: {
      type: String,
      required: true,
    },
    transDate: {
      type: Date,
      required: true,
    },
    transType: {
      type: String,
      required: true,
      enum: ["credit", "debit"],
      default: "credit",
    },
    amount: {
      type: Number,
      default: 0.0,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "success"],
      default: "pending",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      es_indexed: true,
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      es_indexed: true,
    },
  },
  { timestamps: true }
);

/* Creates the transaction model */
const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;
