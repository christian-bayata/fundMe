const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const accountMiddleware = require("../../../middlewares/account");
const accountController = require("../controllers/account");

const accountRouter = Router();

accountRouter.post("/create-account", userMiddleware.authenticateUser, accountMiddleware.validateCreateAccount, accountController.createUserAccount);

module.exports = accountRouter;