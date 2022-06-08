const { json } = require("body-parser");
const httpContext = require("express-http-context");

const jwt = require("jsonwebtoken");
const logger = require("../services/logger")(module);

const config = require("../config");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).end();
    }

    const decoded = jwt.verify(token, config.app);
    req.userId = decoded.userId;
    req.username = decoded.username;
    httpContext.set("userId", decoded?.userId);
    httpContext.set("username", decoded?.username);
    return next();
  } catch (error) {
    logger.error("Not authorized");
    return res.status(401).json({ message: "Not authorized" }).end();
  }
};
