const Response = require("../../../utils/response");
const userRepository = require("../../../repositories/user");
const status = require("../../../status-code");

/**
 * @Author Edomaruse, Frank
 * @Responsibility:  Admin - Get a single user or all users
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const getUsers = async (req, res) => {
  const { admin } = res;
  const { flag, id } = req.query;

  if (!admin) return Response.sendError({ res, statusCode: status.UNAUTHORIZED, message: "Unauthorized to access resource" });

  if (!flag) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Provide a flag" });

  const validFlags = ["single", "all"];
  if (!validFlags.includes(flag)) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Invalid flag" });

  try {
    if (flag == "single") {
      if (!id) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Provide the user ID" });

      const getUser = await userRepository.findUser({ _id: id });
      if (!getUser) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "User does not exist" });

      return Response.sendSuccess({ res, statusCode: status.OK, message: "Successfully retrieved user", body: getUser });
    }

    if (flag == "all") {
      const getUsers = await userRepository.findUsers();
      return Response.sendSuccess({ res, statusCode: status.OK, message: "Successfully retrieved all users", body: getUsers });
    }
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility:  Admin - Get a single user or all users
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const updateUser = async (req, res) => {
  const { admin } = res;
  const { flag, id } = req.query;

  try {
  } catch (error) {
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  getUsers,
  updateUser,
};
