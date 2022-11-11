require("dotenv").config();

const paystackConfig = (request) => {
  const initializePayment = (data, callbackFxn) => {
    const options = {
      url: "https://api.paystack.co/transaction/initialize",
      port: process.env.PAYSTACK_TEST_PORT,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_TEST_SK}`,
        "Content-Type": "application/json",
      },
      data,
    };

    const callback = (error, response, body) => {
      console.log("*************Body: ", body);
      return callbackFxn(error, body);
    };
    request(options, callback);
  };

  const verifyPayment = (ref, callbackFxn) => {
    const options = {
      hostname: process.env.PAYSTACK_TEST_HOST,
      port: process.env.PAYSTACK_TEST_PORT,
      path: `/transaction/verify/:${encodeURIComponent(ref)}`,
      method: "GET",
      headers: {
        Authorization: process.env.PAYSTACK_TEST_SK,
      },
    };

    const callback = (error, response, body) => {
      return callbackFxn(error, body);
    };
    request(options, callback);
  };

  //   const paymentConfirmationWebhook = () => {
  //     var crypto = require("crypto");
  //     var secret = process.env.SECRET_KEY;
  //     // Using Express
  //     app.post("/my/webhook/url", function (req, res) {
  //       //validate event
  //       const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(req.body)).digest("hex");
  //       if (hash == req.headers["x-paystack-signature"]) {
  //         // Retrieve the request's body
  //         const event = req.body;
  //         // Do something with event
  //       }
  //       res.send(200);
  //     });
  //   };

  return { initializePayment, verifyPayment };
};

module.exports = paystackConfig;
