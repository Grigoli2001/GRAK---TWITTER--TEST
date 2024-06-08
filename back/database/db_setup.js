const logger = require('../middleware/winston');
const neo4j = require('neo4j-driver');

// Create the Neo4j driver
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Function to establish connection to Neo4j database and log the number of nodes
const connectToNeo4j = async () => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (n) RETURN count(n) as count');
    const count = result.records[0].get('count').toNumber();
    logger.info(`Connected to Neo4j database with ${count} nodes.`);
  } catch (error) {
    logger.error('Failed to connect to Neo4j database:', error);
  } finally {
    await session.close();
  }
};

// Function to create a new session
const getSession = () => {
  logger.info('Creating a new session with Neo4j database.');
  return driver.session();
};

// Log driver errors
driver.onError = (error) => {
  logger.error('Neo4j driver instantiation failed:', error);
};

// Export the function to establish connection and getSession
module.exports = { connectToNeo4j, getSession };
