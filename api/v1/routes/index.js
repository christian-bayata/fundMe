const { Router } = require("express");
const authRouter = require("./auth");
const userRouter = require("./user");
const transRouter = require("./transaction");
const accountRouter = require("./account");

const router = Router();

router.use("/auth", authRouter);

router.use("/user", userRouter);

router.use("/account", accountRouter);

router.use("/transaction", transRouter);

module.exports = router;
