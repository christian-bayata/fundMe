const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const transController = require("../controllers/transaction");

const transRouter = Router();

transRouter.post("/fund-user-account", userMiddleware.authenticateUser, transController.fundAccount);

module.exports = transRouter;
