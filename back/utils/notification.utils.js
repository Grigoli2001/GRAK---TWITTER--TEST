const pool = require("../database/db_setup");

const getUserById = async (userId) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    return rows[0];
  } catch (error) {
    console.error("Error getting user by id: ", error);
    return null;
  }
};

module.exports = {
  getUserById,
};
