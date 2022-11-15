const { Router } = require("express");
const authRouter = require("./auth");
const userRouter = require("./user");
const accountRouter = require("./account");

const router = Router();

router.use("/auth", authRouter);

router.use("/user", userRouter);

router.use("/account", accountRouter);

module.exports = router;
