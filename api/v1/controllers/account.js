const accountRepository = require("../../../repositories/account");
const status = require("../../../status-code");
const Response = require("../../../utils/response");
const request = require("request");
const { initializePayment, verifyPayment } = require("../../../config/paystack")(request);

const createUserAccount = async (req, res) => {
  const { user, data } = res;

  if (!user) return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Unautheniticated user" });

  try {
    const accountExists = await accountRepository.findAccount({ type: data.type, email: data.email });
    if (accountExists) return Response.sendError({ res, statusCode: status.CONFLICT, message: "Account already exists" });

    const userAccount = await accountRepository.createAccount({ name: data.name, email: data.email, number: Math.random().toString().slice(2, 11), type: data.type, user });

    return Response.sendSuccess({ res, statusCode: status.CREATED, message: "Account successfully created", body: userAccount });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

const fundMyAccount = async (req, res) => {
  const { user, data } = res;

  if (!user) return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Unautheniticated user" });

  try {
    const accountExists = await accountRepository.findAccount({ email: data.email });
    if (!accountExists) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Account cannot be found" });

    /* Paystack payment initialization */
    initializePayment(data, (error, response) => {
      if (error) {
        console.log(error);
      }
      console.log(JSON.parse(response));
    });

    // return Response.sendSuccess({ res, statusCode: status.OK, message: "Payment Initialized", body: JSON.parse(response) });
    //  console.log("**************Payment Data: ", paymentData);
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  createUserAccount,
  fundMyAccount,
};
