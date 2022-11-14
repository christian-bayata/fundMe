const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const accountMiddleware = require("../../../middlewares/account");
const accountController = require("../controllers/account");

const accountRouter = Router();

accountRouter.post("/create-account", userMiddleware.authenticateUser, accountMiddleware.validateCreateAccount, accountController.createUserAccount);

accountRouter.get("/get-accounts", userMiddleware.isAdmin, accountController.getUserAccounts);

accountRouter.patch("/update-account/:id", userMiddleware.isAdmin, accountController.updateAccount);

accountRouter.delete("/delete-account/:id", userMiddleware.isAdmin, accountController.deleteAccount);

// accountRouter.post("/initialize-payment", userMiddleware.authenticateUser, accountMiddleware.validateInitializePayment, accountController.initializePayment);

module.exports = accountRouter;
