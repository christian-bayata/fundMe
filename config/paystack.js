require("dotenv").config();
const https = require("https");

const initializePayment = (data, callbackFxn) => {
  const options = {
    hostname: process.env.PAYSTACK_TEST_HOST,
    port: process.env.PAYSTACK_TEST_PORT,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: PAYSTACK_TEST_SK,
      "Content-Type": "application/json",
    },
    data,
  };

  const callback = (error, response, body) => {
    return callbackFxn(error, body);
  };
  https.request.post(options, callback);
};

module.exports = {
  initializePayment,
};
