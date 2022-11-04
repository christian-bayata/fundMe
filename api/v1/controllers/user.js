require("express-async-errors");
const userRepository = require("../../../repositories/user");
const Response = require("../../../utils/response");
const status = require("../../../status-code");
const _ = require("lodash");
const helper = require("../../../utils/helper");
const crypto = require("crypto");

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

    return Response.sendSuccess({ res, statusCode: status.OK, message: "User successfully logged in", body: { token, data: protectedData } });
  } catch (error) {
    // console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility: Provide user with password reset token
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userExists = await userRepository.findUserByEmail(email);
    if (!userExists) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Sorry you do not have an account with us. Please sign up" });

    //Create reset password url
    const token = crypto.randomBytes(3).toString("hex").toUpperCase();
    const resetUrl = `${req.protocol}://${req.get("host")}/api/user/password-reset/${token}`;

    //Set the password reset email message for client
    const message = `This is your password reset token: \n\n${resetUrl}\n\nIf you have not requested this email, then ignore it`;

    //The reset token email
    await sendEmail({ email: userExists.email, subject: "Password Recovery", message });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  userSignUp,
  userLogin,
  forgotPassword,
};
