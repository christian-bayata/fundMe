require("express-async-errors");
require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const morgan = require("morgan");
const winston = require("winston");
const ErrorHandler = require("./utils/error-handler");
const error = require("./middlewares/error");
const swaggerDocument = require("./swagger.json");
const cors = require("cors");

/* Initialize express application */
const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(morgan("combined", { stream: winston.stream }));
app.use(express.json());
app.use(cors());

/* Ping the API to ensure it is running. */
app.get("/health-check", (req, res, next) => {
  return next(new ErrorHandler("Health check passed", 200));
});

/* Use the error handling middleware as the last in the middleware stack */
app.use(error);

module.exports = app;
