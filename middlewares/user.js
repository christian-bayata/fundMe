require("express-async-errors");
const Joi = require("joi");
const Response = require("../utils/response");
const userRepository = require("../repositories/user");
const status = require("../status-code");
const jwt = require("jsonwebtoken");

/**
 * @Responsibility: Validation middleware for user sign up
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

const signupValidation = async (req, res, next) => {
  const payload = req.body;

  // const regexAlpha = /^[a-zA-Z]+$/;
  try {
    const schema = Joi.object({
      firstName: Joi.string() /* .regex(regexAlpha) */
        .min(3)
        .max(15)
        .required(), //.error(new Error("First name must not be empty and must contain only letters")),
      lastName: Joi.string() /* .regex(regexAlpha) */
        .min(3)
        .max(15)
        .required(), //.error(new Error("Last name must not be empty and must contain only letters")),
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .lowercase()
        .required(),
      //.error(new Error("Email must be a valid email")),
      password: Joi.string().min(6).required(), //.error(new Error("Password must be more than 6 characters")),
    });

    const { error, value } = schema.validate(payload);

    if (error) {
      return Response.sendError({ res, message: error.details[0].message });
    }

    res.data = value;
    return next();
  } catch (error) {
    return error;
  }
};

/**
 * @Responsibility: Validation middleware for user login
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

const loginValidation = async (req, res, next) => {
  const payload = req.body;

  try {
    const schema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .lowercase()
        .required(),
      password: Joi.string().min(6).required(),
    });

    const { error, value } = schema.validate(payload);

    if (error) {
      return Response.sendError({ res, message: error.details[0].message });
    }

    res.data = value;
    return next();
  } catch (error) {
    return error;
  }
};

const authenticateUser = async (req, res, next) => {
  let { authorization } = req.headers;
  const { userId } = req.body;

  if (!authorization) {
    authorization = req.body.authorization;
  }

  // decode jwt token from req header
  const decode = jwt.verify(authorization, process.env.JWT_SECRET_KEY, (err, decoded) => decoded);

  // if token is invalid or has expired
  if (!authorization || !decode || !decode._id) {
    return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Unauthenticated! Please login" });
  }

  try {
    // const getUser = userId ? await userRepository.findUser({ _id: userId }) : await userRepository.findUser({ _id: decode._id });

    // // if user could not be found
    // if (!getUser) {
    //   return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "User could not be found" });
    // }

    res.user = decode;

    return next();
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

const isAdmin = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    authorization = req.body.authorization;
  }

  // decode jwt token from req header
  const decode = jwt.verify(authorization, process.env.JWT_SECRET_KEY, (err, decoded) => decoded);

  // if token is invalid or has expired
  if (!authorization || !decode || !decode._id) {
    return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Unauthenticated! Please login" });
  }

  try {
    const getAdmin = decode.isAdmin ? true : false;

    res.admin = getAdmin;
    return next();
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  signupValidation,
  loginValidation,
  authenticateUser,
  isAdmin,
};
