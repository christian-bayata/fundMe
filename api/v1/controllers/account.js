const accountRepository = require("../../../repositories/account");
const status = require("../../../status-code");
const Response = require("../../../utils/response");

const createUserAccount = async (req, res) => {
  const { user, data } = res;

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
  const { user } = res;
  const { amount, email } = req.body;

  try {
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  createUserAccount,
  fundMyAccount,
};
