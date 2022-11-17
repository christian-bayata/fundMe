const Response = require("../../../utils/response");
const userRepository = require("../../../repositories/user");
const accountRepository = require("../../../repositories/account");
const transRepository = require("../../../repositories/transaction");
const status = require("../../../status-code");
const helper = require("../../../utils/helper");
const mongoose = require("mongoose");

const fundAccount = async (req, res) => {
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

    if (flag == "my_account") {
      const getAccount = await accountRepository.findAccount({ user: user._id });
      if (!getAccount) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Account does not exist" });

      /* Calculate the charge */
      const charge = helper.calcCharges({ accountId: getAccount._id, userId: user._id, flag: "my_account", amount });

      /* Create the transaction */
      const createdTransaction = await transRepository.fundAccount([charge], { session });

      /* Update the account schema */
      await accountRepository.updateAccount({ $inc: { available: charge.totalAmount, total: charge.totalAmount }, dateOfLastAction: Date.now() }, getAccount._id, { session });

      return Response.sendSuccess({ res, statusCode: status.OK, message: "Successfully funded your account", body: createdTransaction });
    }

    if (flag == "other_account") {
      if (!accountNum) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Provide the account number" });

      const getMyAccount = await accountRepository.findAccount({ user: user._id });
      if (!getMyAccount) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Your account does not exist" });

      const getOtherAccount = await accountRepository.findAccount({ accountNum });
      if (!getOtherAccount) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Other account does not exist" });

      /* Calculate the charge */
      const charge = helper.calcCharges({ accountId: getMyAccount._id, userId: user._id, flag: "other_account", amount });

      /* Create the transaction */
      const createdTransaction = await transRepository.fundAccount([charge], { session });

      /* Update the account schema */
      /* Increase the receiver's money in the account */
      await accountRepository.updateAccount({ $inc: { available: charge.totalAmount, total: charge.totalAmount }, dateOfLastAction: Date.now() }, getOtherAccount._id, { session });
      /* Decrease the sender's money in the account */
      await accountRepository.updateAccount({ $inc: { available: -charge.totalAmount, total: -charge.totalAmount }, dateOfLastAction: Date.now() }, getMyAccount._id, { session });

      return Response.sendSuccess({ res, statusCode: status.OK, message: "Successfully funded other account", body: createdTransaction });
    }
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  fundAccount,
};
