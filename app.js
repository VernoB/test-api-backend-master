const cron = require("node-cron");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const httpContext = require("express-http-context");
const { marked } = require("marked");
const swaggerUi = require("swagger-ui-express");

const config = require("./config.json");
const logger = require("./services/logger")(module);
// const swaggerDoc = require("./swagger.json");

const authRouter = require("./routes/auth.routes");
const companiesRouter = require("./routes/companies.routes");
const contactsRouter = require("./routes/contacts.routes");

const app = express();

app.use(helmet()); //modify http header

app.use(compression()); // For basic optimization

app.use(httpContext.middleware);
app.use((req, res, next) => {
  httpContext.ns.bindEmitter(req);
  httpContext.ns.bindEmitter(res);
  httpContext.set("method", req?.method);
  httpContext.set("url", req?.url);
  next();
});

app.use(cors());

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

app.use("/auth", authRouter);
app.use("/companies", companiesRouter);
app.use("/contacts", contactsRouter);
// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerDocument, { explorer: true })
// );

app.get("/", (req, res) => {
  const path = `${__dirname}/README.md`;
  const file = fs.readFileSync(path, "utf8");
  const pageContent = marked(file.toString());

  res.send(
    `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="github-markdown.css">
      </head>
      <body>
        <article class="markdown-body">${pageContent}</article>
      </body>
    </html>
    `
  );
});

cron.schedule("0 * * * *", () => {
  fs.rm("./public/images/", { recursive: true, force: true }, (err) => {
    if (err) logger(err);
  });
});
//Error handling
app.use((error, req, res, next) => {
  logger.info(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

async function start() {
  try {
    mongoose.connect(config.db.URI).then((result) => {
      app.listen(config.port, () => {
        logger.info(`App has been started on port ${config.port}...`);
      });
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

start();

module.exports = app;
