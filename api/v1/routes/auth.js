const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const authController = require("../controllers/auth");

const authRouter = Router();

authRouter.post("/signup", userMiddleware.signupValidation, authController.userSignUp);

authRouter.post("/login", userMiddleware.loginValidation, authController.userLogin);

authRouter.post("/forgot-password", authController.forgotPassword);

authRouter.patch("/reset-password/:token", authController.resetPassword);

module.exports = authRouter;
