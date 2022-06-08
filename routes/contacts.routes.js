const express = require("express");
const { body, param } = require("express-validator");

const router = express.Router();

const logger = require("../services/logger")(module);
const auth = require("../middleware/auth.middleware");
const contactsController = require("../controllers/contacts.controller");

router.get(
  "/:id",
  auth,
  param("id").isString().withMessage("Provide a correct id"),
  contactsController.get
);

router.post(
  "/",
  auth,
  body("lastname")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Lastname too short"),
  body("firstname")
    .trim()
    .isLength({ min: 5 })
    .withMessage("firstname too short"),
  body("email")
    .trim()
    .isLength({ min: 5 })
    .isEmail()
    .withMessage("Please provide a correct email"),
  contactsController.createContact
);

router.patch(
  "/:id",
  auth,
  body("lastname")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Please provide a lastname / check the length"),
  body("firstname")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Please provide a firstname"),
  body("email")
    .trim()
    .isLength({ min: 5 })
    .isEmail()
    .withMessage("Please provide a correct email"),
  contactsController.update
);

router.delete(
  "/:id",
  auth,
  param("id")
    .trim()
    .isString()
    .withMessage("Provide a correct id")
    .isLength({ min: 5 })
    .withMessage("incorrect id"),
  contactsController.deleteContact
);

module.exports = router;
