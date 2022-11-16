const Transaction = require("../models/transaction");

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const fundAccount = async (data) => {
  return await Transaction.create(data);
};

module.exports = {
  fundAccount,
};
