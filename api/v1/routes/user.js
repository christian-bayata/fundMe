const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const userController = require("../controllers/user");

const userRouter = Router();

userRouter.get("/get-users", userMiddleware.isAdmin, userController.getUsers);

module.exports = userRouter;
