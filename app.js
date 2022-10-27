require("express-async-errors");
require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const morgan = require("morgan");
const winston = require("winston");
const error = require("./middlewares/error");
const swaggerDocument = require("./swagger.json");
const cors = require("cors");
const Response = require("./utils/response");

/* Initialize express application */
const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(morgan("combined", { stream: winston.stream.write }));
app.use(express.json());
app.use(cors());

/* Ping the API to ensure it is running. */
app.get("/health-check", (req, res) => {
  return Response.sendSuccess({ res, message: "Health check passed" });
});

/* Use the error handling middleware as the last in the middleware stack */
app.use(error);

module.exports = app;
