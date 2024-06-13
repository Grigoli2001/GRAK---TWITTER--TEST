const startApp = require("./boot/setup");
const logger = require("./middleware/winston");

(async () => {
  try {
    await startApp();
    logger.info("Application started successfully");
  } catch (err) {
    console.log("Error while starting up server");
    process.exit(1);
  }
})();
