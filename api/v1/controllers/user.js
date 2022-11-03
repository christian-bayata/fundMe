require("express-async-errors");
const userRepository = require("../../../repositories/user");
const Response = require("../../../utils/response");
const status = require("../../../status-code");
const _ = require("lodash");
const helper = require("../../../utils/helper");
const CryptoJS = require("crypto-js");

/**
 * @Author Edomaruse, Frank
 * @Responsibility:  Sign up a new user
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const userSignUp = async (req, res) => {
  const { data } = res;

  try {
    /* Check if user already exists */
    const userExists = await userRepository.findUserByEmail(data.email);
    if (userExists) return Response.sendError({ res, statusCode: status.CONFLICT, message: "User already exists" });

    const createdUser = await userRepository.createUser({ firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password });
    const theUser = _.pick(createdUser, ["_id", "firstName", "lastName", "email", "isAdmin"]);

    return Response.sendSuccess({ res, statusCode: status.CREATED, message: "User successfully signed up", body: theUser });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility:  Logs in an already signed up user
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const userLogin = async (req, res) => {
  const { data } = res;

  try {
    const userExists = await userRepository.findUserByEmail(data.email);
    if (!userExists) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Sorry you do not have an account with us. Please sign up" });

    /* validate user password with bcrypt */
    const validPassword = await userExists.comparePassword(data.password);
    if (!validPassword) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Incorrect Password! Unauthorized" });

    /* Generate JWT token for user */
    const token = userExists.generateJsonWebToken();

    /* Format and hash user data for security */
    const protectedData = helper.formatUserData(data);

    // var decr = CryptoJS.AES.decrypt(protectedData, "!@#109Tyuuryfqowp085rjf{}[])_+.//||");
    // console.log("**********", decr).toString(CryptoJS.enc.Utf8);

    //decr = decr.toString(CryptoJS.enc.Utf8);

    return Response.sendSuccess({ res, statusCode: status.CREATED, message: "User successfully logged in", body: { token, data: protectedData } });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  userSignUp,
  userLogin,
};
