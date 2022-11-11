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
    email: {
      type: String,
      required: true,
      unique: true,
      es_indexed: true,
    },
    amount: {
      type: Number,
      default: 0.0,
    },
    charge: {
      type: Number,
      default: 0.0,
    },
    totalAmount: {
      type: Number,
      default: 0.0,
    },
    // paySelf: {
    //   type: Boolean,
    //   default: false,
    // },
    // payOthers: {
    //   type: Boolean,
    //   default: false,
    // },
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
