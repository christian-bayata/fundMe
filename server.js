const app = require("./app");
const Database = require("./config/database");

//Error handler for uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log("Shutting down due to uncaught exception");
});

/* Connect to the database */
const connectionString = require("./config/connection");
new Database(connectionString).connect();

/* Declare port and environment, then run the server */
const port = process.env.PORT || 5000;
const environment = process.env.NODE_ENV || "development";
let server = app.listen(port, () => console.log(`Server is running on port ${port} in ${environment} mode`));

//Error handler for unhandled rejections
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log("Shutting down due to unhandled rejections");
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;
