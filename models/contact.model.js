const mongoose = require("mongoose");

const { Schema } = mongoose;

const contactSchema = new Schema(
  {
    lastname: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    patronymic: String,
    phone: "Number",
    email: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: Date,
    updateAt: Date,
  },
  { timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } }
);

module.exports = mongoose.model("Contact", contactSchema);
