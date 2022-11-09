const User = require("../models/user");

/**
 *
 * @param email
 * @returns {Promise<*>}
 */

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createUser = async (data) => {
  return await User.create(data);
};

const findUser = async (data) => {
  return await User.findOne(data);
};

module.exports = {
  findUserByEmail,
  createUser,
  findUser,
};
