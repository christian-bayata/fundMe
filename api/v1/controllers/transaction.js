const Response = require("../../../utils/response");
const userRepository = require("../../../repositories/user");
const accountRepository = require("../../../repositories/account");
const transRepository = require("../../../repositories/transaction");
const status = require("../../../status-code");
const crypto = require("crypto");
const mongoose = require("mongoose");

const fundMyAccount = async (req, res) => {
  const { user } = res;
  const { amount, flag, accountNum } = req.body;

  if (!user) return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Unauthenticated user" });
  if (!amount) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Provide the amount" });

  if (!flag) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Provide a flag" });
  const validFlags = ["my_account", "other_account"];
  if (!validFlags.includes(flag)) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Invalid flag" });

  try {
    /*  Start mongoose transaction */
    const session = await mongoose.startSession();
    session.startTransaction();

    const getAccount = flag == "my_account" ? await accountRepository.findAccount({ user: user._id }) : await accountRepository.findAccount({ accountNum });
    if (!getAccount) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Account does not exist" });

    const data = {
      refNo: crypto.randomBytes(5).toString("hex").toUpperCase(),
      transType: "credit",
      transDate: Date.now(),
      amount,
      user: user._id,
      account: getAccount._id,
      status: "success",
    };

    let overallData;

    /* For every credit amount greater than 10000, subtract charges of 50 */
    if (data.amount > 10000) {
      data.charge = 50;
      overallData = { ...data, totalAmount: +(data.amount - data.charge) };
    } else {
      overallData = { ...data, totalAmount: data.amount };
    }

    /* Create the transaction */
    const createdTransaction = await transRepository.fundAccount([overallData], { session });

    /* Update the account schema */
    await accountRepository.updateAccount({ $inc: { available: overallData.totalAmount, total: overallData.totalAmount }, dateOfLastAction: Date.now() }, getAccount._id, { session });

    return Response.sendSuccess({ res, statusCode: status.OK, message: flag == "my_account" ? "Successfully funded your account" : "Successfully funded your account", body: createdTransaction });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  fundMyAccount,
};
