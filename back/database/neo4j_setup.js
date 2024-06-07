const neo4j = require("neo4j-driver");
const logger = require("../middleware/winston");

let driver;

async function startConnection() {
  driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  );

  try {
    await driver.getServerInfo();
    logger.info("Neo4j connection established");
  } catch (error) {
    logger.error("Neo4j connection failed:", error);
  }

  // Periodic check to keep the connection alive
  setInterval(async () => {
    const session = driver.session();
    try {
      await session.run("RETURN 1");
    } catch (error) {
      logger.error("Connection check failed:", error);
      startConnection();
    } finally {
      await session.close();
    }
  }, 10000);
}

startConnection();

module.exports = driver;
