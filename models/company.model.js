const mongoose = require("mongoose");

const { Schema } = mongoose;

const companySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    shortName: String,
    businessEntity: String,
    contract: {
      no: Number,
      issue_date: Date,
    },
    status: String,
    type: [String],
    photos: [
      {
        name: String,
        filepath: String,
        thumbpath: String,
      },
    ],
    contact: [
      {
        type: Schema.Types.ObjectId,
        ref: "Contact",
      },
    ],
    createdAt: Date,
    updateAt: Date,
  },
  { timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } }
);

module.exports = mongoose.model("Company", companySchema);
