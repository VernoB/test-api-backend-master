module.exports = async function server() {
  try {
    mongoose.connect(config.db.HOME).then((result) => {
      app.listen(config.port, () => {
        logger.info(`App has been started on port ${config.port}...`);
      });
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};
