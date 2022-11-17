const CryptoJS = require("crypto-js");
const crypto = require("crypto");

const formatUserData = (data) => {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), "!@#109Tyuuryfqowp085rjf{}[])_+.//||").toString();
  return ciphertext;
};

const resetToken = async (user) => {
  const token = crypto.randomBytes(20).toString("hex");

  //Encrypt the token and set it to resetPasswordToken
  user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  user.resetPasswordDate = Date.now();
  await user.save();

  return user.resetPasswordToken;
};

const calcCharges = ({ accountId, userId, flag, amount }) => {
  const data = {
    refNo: crypto.randomBytes(5).toString("hex").toUpperCase(),
    transType: flag == "my_account" ? "credit" : "debit",
    transDate: Date.now(),
    amount,
    user: userId,
    account: accountId,
    status: "success",
  };

  let overallData;

  /* For every credit amount greater than 10000, subtract charges of 50 */
  if (data.amount > 10000) {
    data.charge = 50;
    overallData = { ...data, totalAmount: +(data.amount - data.charge) };
  } else {
    overallData = { ...data, totalAmount: data.amount };
  }

  return overallData;
};

module.exports = {
  formatUserData,
  resetToken,
  calcCharges,
};
