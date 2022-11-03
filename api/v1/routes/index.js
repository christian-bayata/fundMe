const { Router } = require("express");
const usersRouter = require("./user");

const router = Router();

router.use("/user", usersRouter);

module.exports = router;
