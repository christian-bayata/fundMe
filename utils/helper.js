const CryptoJS = require("crypto-js");

const formatUserData = (data) => {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), "!@#109Tyuuryfqowp085rjf{}[])_+.//||").toString();

  var decr = CryptoJS.AES.decrypt(ciphertext, "!@#109Tyuuryfqowp085rjf{}[])_+.//||").toString(CryptoJS.enc.Utf8);
  console.log("**********", decr);

  return ciphertext;
};

module.exports = {
  formatUserData,
};
