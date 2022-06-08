const User = require("../models/user.model");

exports.findOne = async (value) => {
  return await User.findOne({ username: value });
};
