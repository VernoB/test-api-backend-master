const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const config = require("../config.json");
const logger = require("../services/logger")(module);
const User = require("../models/user.model");
const { findOne } = require("../services/auth.service");
const {
  generateSalt,
  validatePassword,
} = require("../services/validate-password.services");
const validateCheck = require("../services/validation.service");

exports.signup = async (req, res, next) => {
  const errorValidation = validationResult(req);

  if (!validateCheck(errorValidation)) {
    logger.error(errorValidation.array());
    return res
      .status(400)
      .json({ errorValidation: `error in the validation process` });
  }

  logger.info(`Create user ...`);
  const { username, password } = req.body;
  const saltedPw = await generateSalt();

  console.log(username, password, saltedPw);

  bcrypt
    .hash(password, saltedPw)
    .then(async (hashedPw) => {
      const user = new User({
        username,
        password: hashedPw,
        salt: saltedPw,
      });
      return await user.save();
    })
    .then((result) => {
      logger.info(`New user Created with id ${result.id}`);
      res.status(201).json({ message: "User created!", userId: result.id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = async (req, res, next) => {
  const { username, password } = req.query;

  const errorValidation = validationResult(req);

  if (!validateCheck(errorValidation)) {
    logger.error(errorValidation.array());
    return res.status(401).json({ error: errorValidation.array() });
  }

  return findOne(username)
    .then((user) => {
      if (!user) {
        logger.info("Username not found in the database");
        return res.status(404).json({ error: "User not found!" });
      }

      return user;
    })
    .then((result) => {
      const { _id, salt, username, passwordR } = result;

      if (!validatePassword(password, passwordR, salt)) {
        logger.info("Error in the provide password");
        return res.status(404).json({ error: "username / password not found" });
      }

      const token = jwt.sign(
        {
          userId: _id.toString(),
          username,
        },
        config.app,
        { expiresIn: config.jwt_ttl }
      );

      return res.status(200).json({ token, userId: _id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        logger.error(err);
        err.statusCode = 500;
      }
      next(err);
      return err;
    });
};
