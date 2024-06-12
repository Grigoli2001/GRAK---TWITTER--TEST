// const pool = require("../database/db_setup");
const { getDriver } = require("../database/neo4j_setup");

const getUserById = async (userId) => {
  try {
    const session = getDriver().session();
    const result = await session.run(
      `MATCH (u:User {id: $userId})
      RETURN {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        profile_pic: u.profile_pic,
        created_at: u.created_at
      } as user
      `,
      { userId: userId }
    );
    console.log(result);
    const user = result.records.map((record) => record.toObject().user)[0];
    return user || null;
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getUserById,
};
