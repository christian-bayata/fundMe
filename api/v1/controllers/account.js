require("dotenv").config();
const accountRepository = require("../../../repositories/account");
const status = require("../../../status-code");
const Response = require("../../../utils/response");
const request = require("request");
const util = require("util");
const theRequest = util.promisify(request);
const crypto = require("crypto");

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

const initializePayment = async (req, res) => {
  const { user, data } = res;

  if (!user) return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Unautheniticated user" });

  try {
    const accountExists = await accountRepository.findAccount({ email: data.email });
    if (!accountExists) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Account cannot be found" });

    const url = `https://api.paystack.co/transaction/initialize`;
    const SECRET = process.env.PAYSTACK_TEST_SK;

    const options = {
      method: "POST",
      url: url,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${SECRET}`,
      },
      body: { email: data.email, amount: data.amount * 100 },
      json: true,
    };

    /* Paystack payment initialization */
    theRequest(options).then(async (resp) => {
      if (resp.body.status == true) {
        return Response.sendSuccess({ res, statusCode: status.OK, message: resp.body.message, body: resp.body.data.authorization_url });
      }
      if (resp.body.status == false) {
        return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: resp.body.message });
      }
    });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  createUserAccount,
  initializePayment,
};
