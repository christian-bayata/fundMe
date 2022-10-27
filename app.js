require("express-async-errors");
require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const morgan = require("morgan");
const winston = require("winston");
const error = require("./middlewares/error");

/* Initialize express application */
const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(morgan("combined", { stream: winston.stream }));
app.use(express.json());
app.use(cors());

/* Use the error handling middleware as the last in the middleware stack */
app.use(error);

module.exports = app;
