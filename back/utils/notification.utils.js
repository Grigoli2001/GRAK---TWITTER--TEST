const session = require("../database/db_setup");

const getUserById = async (userId) => {
  try {
    const result = await session.run(
      "MATCH (u:User) WHERE u.id = $userId RETURN u",
      { userId: userId }
    );
    if (result.records.length > 0) {
      const user = result.records[0].get("u").properties;
      return user;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user by id: ", error);
    return null;
  }
};

module.exports = {
  getUserById,
};
