const Company = require("../models/company.model");

exports.findById = async (id) => {
  return await Company.findById(id);
};

exports.enumStatus = {
  ACTIVE: "active",
  PENDING: "pending",
  MODIFY: "modify",
};
