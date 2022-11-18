const userRepository = require("../../../repositories/user");
const accountRepository = require("../../../repositories/account");
const Response = require("../../../utils/response");
const status = require("../../../status-code");

/**
 * @Author Edomaruse, Frank
 * @Responsibility:  Search for a user
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const search = async (req, res) => {
  const { query, flag } = req.query;

  if (!flag) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Provide a flag" });

  const validFlags = ["user", "account"];
  if (!validFlags.includes(flag)) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Invalid flag" });

  try {
    const results = flag == "user" ? await userRepository.searchUser(query) : await accountRepository.searchAccount(query);
    if (!results || results.hits) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "result not found for query" });

    const theResult = results.body.hits.hits.map((hit) => hit._source);

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Search was successful", body: theResult });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  search,
};
