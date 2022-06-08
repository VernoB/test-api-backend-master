const bcrypt = require("bcryptjs");

exports.validatePassword = async (password, comparePassword, passwordSalt) => {
  const hashedPw = await bcrypt.hash(password, passwordSalt);
  return hashedPw === comparePassword;
};

exports.generateSalt = async () => {
  return await bcrypt.genSalt(10);
};
