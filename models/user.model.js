const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);
