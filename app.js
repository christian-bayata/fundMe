require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const morgan = require("morgan");
const winston = require("winston");

const port = process.env.PORT || 5000;

/* Initialize express application */
const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(morgan("combined", { stream: winston.stream }));
app.use(express.json());
app.use(cors());
