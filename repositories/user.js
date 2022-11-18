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

/**
 *
 * @param data
 * @returns {Promise<*>}
 */
const findUser = async (data) => {
  return await User.findOne(data);
};

/**
 *
 * @returns {Promise<*>}
 */
const findUsers = async () => {
  return await User.find();
};

/**
 *
 * @param data
 * @param id
 * @returns {Promise<void>}
 */
const updateUser = async (data, id) => {
  return await User.findOneAndUpdate({ _id: id }, data, { new: true });
};

/**
 *
 * @param data
 * @returns {Promise<void>}
 */
const deleteUser = async (data) => {
  return await User.deleteOne(data);
};

/**
 *
 * @param query
 * @returns {Promise<void>}
 */
const searchUser = async (query) => {
  return await User.search({
    query_string: {
      query,
    },
  });
};
module.exports = {
  findUserByEmail,
  createUser,
  findUser,
  findUsers,
  updateUser,
  deleteUser,
  searchUser,
};
