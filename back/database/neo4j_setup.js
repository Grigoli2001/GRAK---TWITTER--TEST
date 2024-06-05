const neo4j = require("neo4j-driver");

// Function to establish connection to Neo4j database
const connectToNeo4j = async () => {
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  );

  const session = driver.session();
  const result = await session.run("MATCH (n) RETURN count(n) as count");
  const count = result.records[0].get("count").toNumber();

  console.log(`Connected to Neo4j database with ${count} nodes.`);
  session.close();
};

// Export the function to establish connection
module.exports = { connectToNeo4j };
