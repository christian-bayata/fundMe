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

module.exports = {
  createAccount,
  findAccount,
};