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

module.exports = {
  formatUserData,
  resetToken,
};
