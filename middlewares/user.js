const Joi = require("joi");
const Response = require("../utils/response");

const signupValidation = async (req, res, next) => {
  const payload = req.body;

  const regexAlpha = /^[a-zA-Z]+$/;
  try {
    const schema = Joi.object({
      firstName: Joi.string().regex(regexAlpha).min(3).max(15).required().error(new Error("First name must not be empty and must contain only letters")),
      lastName: Joi.string().regex(regexAlpha).min(3).max(15).required().error(new Error("Last name must not be empty and must contain only letters")),
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .lowercase()
        .required()
        .error(new Error("Email must be a valid email")),
      password: Joi.string().min(6).required().error(new Error("Password must be more than 6 characters")),
    });

    const { error, value } = schema.validate(payload);

    if (error) {
      return Response.sendError({ res, error: error.message });
    }

    res.data = value;
    return next();
  } catch (error) {
    return error;
  }
};
