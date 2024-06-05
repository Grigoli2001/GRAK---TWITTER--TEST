const { session } = require("../database/neo4j_setup");

const getUserById = async (userId) => {
  try {
    const result = await session.run(
      "MATCH (u:User) WHERE id(u) = $userId RETURN u",
      { userId }
    );
    const user = result.records[0].get("u").properties;
    return user;
  } catch (error) {
    console.error("Error getting user by id: ", error);
    return null;
  }
};

module.exports = {
  getUserById,
};
