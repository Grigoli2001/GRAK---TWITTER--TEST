// const neo4j = require("neo4j-driver");
// const logger = require("../middleware/winston");

// let driver;

// async function startConnection() {
//   driver = neo4j.driver(
//     process.env.NEO4J_URI,
//     neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
//   );

//   try {
//     await driver.getServerInfo();
//     logger.info("Neo4j connection established");
//   } catch (error) {
//     logger.error("Neo4j connection failed:", error);
//   }

//   // Periodic check to keep the connection alive
//   setInterval(async () => {
//     const session = driver.session();
//     try {
//       await session.run("RETURN 1");
//     } catch (error) {
//       logger.error("Connection check failed:", error);
//       startConnection();
//     } finally {
//       await session.close();
//     }
//   }, 10000);
// }

// startConnection();


const neo4j = require('neo4j-driver');
const logger = require('../middleware/winston');
let driver
const connectToNeo4j =  async () => {
  const URI = process.env.NEO4J_URI 
  const USER = process.env.NEO4J_USER
  const PASSWORD = process.env.NEO4J_PASSWORD

  console.log(URI, USER, PASSWORD)

  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
    const serverInfo = await driver.getServerInfo()
    if (!serverInfo) {
      throw new Error("Server info not found")
    }
    logger.info('Neo4j connected Successfully')
    // console.log(serverInfo)
  } catch(err) {
    await driver.close()
    console.log(`Connection error\n${err}\nCause: ${err.cause}`)
    return process.exit(1)
  }
};

const getDriver = () => {
  if (!driver) {
    throw new Error('Driver not initialized')
  }
  return driver
}

module.exports = {
  connectToNeo4j,
  getDriver
}
