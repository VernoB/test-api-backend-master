const { validationResult } = require("express-validator");

function validateCheck(errorValidation) {
  if (!errorValidation.isEmpty()) {
    return false;
  }
  return true;
}

module.exports = validateCheck;
