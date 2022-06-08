const Contact = require("../models/contact.model");

exports.findById = async (id) => {
  return await Contact.findById(id);
};
