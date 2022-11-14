require("express-async-errors");
const userRepository = require("../../../repositories/user");
const Response = require("../../../utils/response");
const status = require("../../../status-code");
const _ = require("lodash");
const helper = require("../../../utils/helper");
const crypto = require("crypto");
const sendEmail = require("../../../utils/send-email");

const homePage = (req, res) => {
  res.render("pages/index");
};

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

    return Response.sendSuccess({ res, statusCode: status.OK, message: "User successfully logged in", body: { token, userData: protectedData } });
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

  if (!email) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Please provide a valid email" });

  try {
    const user = await userRepository.findUserByEmail(email);
    if (!user) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Sorry you do not have an account with us. Please sign up" });

    //Create reset password token and save
    const getResetToken = await helper.resetToken(user);

    const resetUrl = `${req.protocol}://${req.get("host")}/api/user/reset-password/${getResetToken}`;

    //Set the password reset email message for client
    const message = `This is your password reset token: \n\n${resetUrl}\n\nIf you have not requested this email, then ignore it`;

    //The reset token email
    await sendEmail({ email: user.email, subject: "Password Recovery", message });

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Password reset token successfully sent" });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility: Enables user reset password with reset token
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  try {
    const user = await userRepository.findUser({ resetPasswordToken: token });
    if (!user) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Password reset token is invalid" });

    // Check to see if the token is still valid
    const timeDiff = +(Date.now() - user.resetPasswordDate.getTime());
    const timeDiffInMins = +(timeDiff / (1000 * 60));

    if (timeDiffInMins > 30) {
      user.resetPasswordToken = undefined;
      user.resetPasswordDate = undefined;
      await user.save();

      return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Password reset token has expired" });
    }

    // Confirm if the password matches
    if (password !== confirmPassword) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Password does not match" });

    // If password matches
    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordDate = undefined;
    await user.save();

    // Generate another Auth token for user
    const authToken = user.generateJsonWebToken();

    /* Format and hash user data for security */
    const protectedData = helper.formatUserData(user);

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Password reset is successful", body: { token: authToken, userData: protectedData } });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  homePage,
  userSignUp,
  userLogin,
  forgotPassword,
  resetPassword,
};
