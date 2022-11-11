const Joi = require("joi");
const Response = require("../utils/response");

/**
 * @Responsibility: Validation middleware for user account creation
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const validateCreateAccount = async (req, res, next) => {
  const payload = req.body;

  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      type: Joi.string().required(),
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .lowercase()
        .required(),
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
 * @Responsibility: Validation middleware for initiliazing payment
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const validateInitializePayment = async (req, res, next) => {
  const payload = req.body;

  try {
    const schema = Joi.object({
      amount: Joi.string().required(),
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .lowercase()
        .required(),
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

module.exports = {
  validateCreateAccount,
  validateInitializePayment,
};
