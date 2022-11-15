const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const userController = require("../controllers/user");

const userRouter = Router();

userRouter.get("/get-users", userMiddleware.isAdmin, userController.getUsers);

userRouter.patch("/update-user/:id", userMiddleware.authenticateUser, userMiddleware.updateUserValidation, userController.updateUser);

userRouter.delete("/delete-user/:id", userMiddleware.isAdmin, userController.deleteUser);

module.exports = userRouter;
