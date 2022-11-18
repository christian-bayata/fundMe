const { Router } = require("express");
const searchRouter = Router();
const searchController = require("../controllers/search");

searchRouter.get("/users/_search", searchController.search);

searchRouter.get("/accounts/_search", searchController.search);

module.exports = searchRouter;
