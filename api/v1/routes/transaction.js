const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const transController = require("../controllers/transaction");

const transRouter = Router();

transRouter.post("/fund-my-account", userMiddleware.authenticateUser, transController.fundMyAccount);

module.exports = transRouter;
