const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const pool = require("../database/db_setup");
const jwt = require("jsonwebtoken");
const { allFollowers } = require("../utils/tweet.utils");


const getAllUsers = async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");

    if(!users.rowCount) {
      return res.status(statusCodes.notFound).json({ message: "No users found" });
    }

    res.status(statusCodes.success).json({ users: users.rows });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching users" });
  }
};

const getUser = async (req, res) => {
  if (id) {
    return getUserById(req, res);
  } else if (username) {
    return getUserByUsername(req, res);
  } else {
    res.status(statusCodes.badRequest).json({ message: "Missing fields" });
  }

};

const searchUser = async (req, res) => {
  const { search } = req.body;
  try {
    const users = await pool.query(`SELECT id, name, username, email, profile_pic, created_at FROM users WHERE username LIKE '%${search}%' OR name LIKE '%${search}%'`);

    if (!users.rowCount) {
      return res.status(statusCodes.notFound).json({ message: "No users found" });
    }
    res.status(statusCodes.success).json({ users: users.rows });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching users" });
  }
}


const getUserById = async (req, res) => {
  try {
    const user = await pool.query(`SELECT id, name, username, email, profile_pic, created_at, bio, website, location, cover, dob FROM users WHERE id = $1`, [id]);

    if (!user.rowCount) {
      return res.status(statusCodes.notFound).json({ message: "User not found" });
    }
    res.status(statusCodes.success).json({ user: user.rows[0] });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching user" });
  }
}

const getUserByUsername = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await pool.query(`SELECT id, name, username, email, profile_pic, created_at, bio, website, location, cover, dob FROM users WHERE username = $1`, [username]);

    if (!user.rowCount) {
        return res.status(statusCodes.notFound).json({ message: "User not found" });
    }
    res.status(statusCodes.success).json({ user: user.rows[0] });

  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching user" });
  }
};

const updateUser = async (req, res) => {
  // const { profile_pic } = req.file 
  console
  const { id, name, username, bio, location, website, profile_pic, cover, dob } = req.body;
  if (!id || !name || !username || !bio || !location || !website || !profile_pic || !cover) {
    return res.status(statusCodes.badRequest).json({ message: "Missing fields" });
  }

  try {
    const user = await pool.query(
      `UPDATE users SET name = $1, username = $2, bio = $3, location = $4, profile_pic = $5, website = $6, cover = $7, dob = $8 WHERE id = $9`,
      [name, username, bio, location, profile_pic, website, cover, dob, id]
    );

    res.status(statusCodes.success).json({ message: "User updated" });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error updating user" });
  }
}

const addFollower = async (req, res) => {
    const { userId, followerId } = req.body;
    
    if (!userId || !followerId) {
        res.status(statusCodes.badRequest).json({ message: "Missing fields" });
    } else {
        const client = await pool.connect();
        try {
        const addFollower = await client.query(
            `INSERT INTO follows(user_id, following) VALUES ($1, $2)`,
            [userId, followerId]
        );
        res.status(statusCodes.success).json({ message: "Follower added" });
        } catch (error) {
        logger.error("Error adding follower", error);
        res.status(statusCodes.queryError).json({ message: "Error" });
        } finally {
        client.release();
        }
    }
}

const removeFollower = async (req, res) => {
    const { userId, followerId } = req.body;
    if (!userId || !followerId) {
        res.status(statusCodes.badRequest).json({ message: "Missing fields" });
    } else {
        try {
        const removeFollower = await pool.query(
            `DELETE FROM follows WHERE user_id = $1 AND following = $2`,
            [userId, followerId]
        );
        res.status(statusCodes.success).json({ message: "Follower removed" });
        } catch (error) {
        logger.error("Error removing follower", error);
        res.status(statusCodes.queryError).json({ message: "Error" });
        } 
    }
}



const getFollowing = async (req, res) => {
    const userId = req.query.userId || req.user.id;
    if (!userId) {
        res.status(statusCodes.badRequest).json({ message: "Missing fields" });
    } else {
        try {
       const followers = await allFollowers(userId)
        res.status(statusCodes.success).json(followers);
        } catch (error) {
        logger.error("Error getting followers", error);
        res.status(statusCodes.queryError).json({ message: "Error" });
        }
    }
}

const getFollowers = async (req, res) => {
    const { followerId } = req.query;
    if (!followerId) {
        res.status(statusCodes.badRequest).json({ message: "Missing fields" });
    } else {
        try {
        const following = await pool.query(
            `SELECT user_id FROM follows WHERE following = $1`,
            [followerId]
        );
        res.status(statusCodes.success).json(following.rows);
        } catch (error) {
        logger.error("Error getting following", error);
        res.status(statusCodes.queryError).json({ message: "Error" });
        }
    }
}

module.exports = {
    getAllUsers,
    getUser,
    getUserById,
    getUserByUsername,
    updateUser,
    addFollower,
    removeFollower,
    getFollowers,
    getFollowing,
    // getAllFollowers,
    // getAllFollowing,
};

