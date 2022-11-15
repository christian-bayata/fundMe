const Account = require("../models/account");

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createAccount = async (data) => {
  return await Account.create(data);
};

/**
 *
 * @param where
 * @returns {Promise<*>}
 */

const findAccount = async (where) => {
  return await Account.findOne(where);
};

/**
 *
 * @returns {Promise<*>}
 */

const findAccounts = async () => {
  return await Account.find();
};

/**
 *
 * @param user
 * @param id
 * @returns {Promise<void>}
 */
const updateAccount = async (data, id) => {
  return await Account.findOneAndUpdate({ _id: id }, data, { new: true });
};

/**
 *
 * @param user
 * @param id
 * @returns {Promise<void>}
 */
const deleteAccount = async (data) => {
  return await Account.deleteOne(data);
};

module.exports = {
  createAccount,
  findAccount,
  findAccounts,
  updateAccount,
  deleteAccount,
};
