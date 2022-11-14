require("dotenv").config();
const accountRepository = require("../../../repositories/account");
const status = require("../../../status-code");
const Response = require("../../../utils/response");
// const request = require("request");
// const util = require("util");
// const theRequest = util.promisify(request);
const crypto = require("crypto");


/**
 * @Author Edomaruse, Frank
 * @Responsibility:  create a new account for a user
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const createUserAccount = async (req, res) => {
  const { user, data } = res;

  if (!user) return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Unautheniticated user" });

  try {
    const accountExists = await accountRepository.findAccount({ type: data.type, email: data.email });
    if (accountExists) return Response.sendError({ res, statusCode: status.CONFLICT, message: "Account already exists" });

    const userAccount = await accountRepository.createAccount({ name: data.name, email: data.email, accountNum: Math.random().toString().slice(2, 12), type: data.type, user });

    return Response.sendSuccess({ res, statusCode: status.CREATED, message: "Account successfully created", body: userAccount });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility:  retrive all users or a single user by account number, based on admin privilege
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */


const getUserAccounts = async (req, res) => {
  const { admin } = res;
  const { flag, acct_num } = req.query;

  if (!admin) return Response.sendError({ res, statusCode: status.UNAUTHORIZED, message: "Unauthorized to access resource" });

  if (!flag) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Provide a flag" });

  const validFlags = ["single", "all"];
  if (!validFlags.includes(flag)) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Invalid flag" });

  try {
    if (flag == "single") {
      if (!acct_num) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Provide an account number" });

      const getAccount = await accountRepository.findAccount({ accountNum: acct_num });
      if (!getAccount) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Account does not exist" });

      return Response.sendSuccess({ res, statusCode: status.OK, message: "Successfully retrieved user account", body: getAccount });
    }

    if (flag == "all") {
      const getAccounts = await accountRepository.findAccounts();
      return Response.sendSuccess({ res, statusCode: status.OK, message: "Successfully retrieved all user accounts", body: getAccounts });
    }
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

const 

// const initializePayment = async (req, res) => {
//   const { user, data } = res;

//   if (!user) return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Unautheniticated user" });

//   try {
//     const accountExists = await accountRepository.findAccount({ email: data.email });
//     if (!accountExists) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Account cannot be found" });

//     const url = `https://api.paystack.co/transaction/initialize`;
//     const SECRET = process.env.PAYSTACK_TEST_SK;

//     const options = {
//       method: "POST",
//       url: url,
//       headers: {
//         "content-type": "application/json",
//         authorization: `Bearer ${SECRET}`,
//       },
//       body: { email: data.email, amount: data.amount * 100 },
//       json: true,
//     };

//     /* Paystack payment initialization */
//     theRequest(options).then(async (resp) => {
//       if (resp.body.status == true) {
//         return Response.sendSuccess({ res, statusCode: status.OK, message: resp.body.message, body: resp.body.data.authorization_url });
//       }
//       if (resp.body.status == false) {
//         return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: resp.body.message });
//       }
//     });
//   } catch (error) {
//     console.log(error);
//     return Response.sendFatalError({ res });
//   }
// };

module.exports = {
  createUserAccount,
  getUserAccounts,
  /* initializePayment */
};
