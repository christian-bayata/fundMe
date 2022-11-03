const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const userController = require("../controllers/user");

const userRouter = Router();

userRouter.post("/signup", userMiddleware.signupValidation, userController.userSignUp);

module.exports = userRouter;
