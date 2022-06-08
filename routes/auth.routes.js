const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { body, query } = require("express-validator");

const User = require("../models/user.model");
const authController = require("../controllers/auth.controller");
const { findOne } = require("../services/auth.service");
const config = require("../config");
const logger = require("../services/logger")(module);

const router = Router();

router.get(
  "/",
  query("username")
    .trim()
    .isString()
    .withMessage("username invalid")
    .isLength({ min: 5 })
    .withMessage("username too short"),

  authController.login
);

//signup route with verification for the input

router.post(
  "/signup",
  body("username")
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage("Please the provide username")
    .custom(async (value) => {
      const user = await findOne(value);
      if (user) {
        return Promise.reject(
          "The user provided already exists in the database"
        );
      }
    }),
  authController.signup
);

module.exports = router;
