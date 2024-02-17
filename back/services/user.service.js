const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const pool = require("../database/db_setup");
const jwt = require("jsonwebtoken");


const getAllUsers = async (req, res) => {
  try {
    const users = await SVGTextPositioningElement.query("SELECT * FROM users");

    if(!users.rowCount) {
      return res.status(statusCodes.notFound).json({ message: "No users found" });
    }

    res.status(statusCodes.success).json({ users: users.rows });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching users" });
  } finally {
    client.release();
  }
};

const getUserByUsername = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await pool.query(`SELECT * FROM users WHERE username = $1`, [username]);

        if (!user.rowCount) {
            return res.status(statusCodes.notFound).json({ message: "User not found" });
        }
        res.status(statusCodes.success).json({ user: user.rows[0] });
    } catch (err) {
        logger.error(err);
        res.status(statusCodes.queryError).json({ message: "Error fetching user" });
    } finally {
        client.release();
    }
    }

const getAllFollowers = async (req, res) => {
  try {
    const followers = await pool.query(
      `SELECT * FROM follows WHERE following = $1`,
      [req.user.id]
    );

    res.status(statusCodes.success).json({ followers: followers.rows });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching followers" });
  } finally {
    client.release();
  }
};

const getAllFollowing = async (req, res) => {
  try {
    const following = await pool.query(
      `SELECT * FROM follows WHERE user_id = $1`,
      [req.user.id]
    );
    res.status(statusCodes.success).json({ following: following.rows });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching following" });
  } finally {
    client.release();
  }
};


module.exports = {
    getAllUsers,
    getAllFollowers,
    getAllFollowing,
};

