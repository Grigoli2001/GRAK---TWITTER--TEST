const startApp = require("./boot/setup");
const logger = require("./middleware/winston");

(async () => {
  try {
    await startApp();
    logger.info("Application started successfully");
  } catch (err) {
    console.log("Error while starting up server");
    console.log(`Error; ${JSON.stringify(err, undefined, 2)}`);
  }
})();
