const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const userController = require("../controllers/user");

const userRouter = Router();

userRouter.post("/signup", userMiddleware.signupValidation, userController.userSignUp);

userRouter.post("/login", userMiddleware.loginValidation, userController.userLogin);

userRouter.post("/forgot-password", userController.forgotPassword);

module.exports = userRouter;
