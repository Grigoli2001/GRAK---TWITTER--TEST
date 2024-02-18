const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const pool = require("../database/db_setup");
const jwt = require("jsonwebtoken");
const { allFollowers } = require("../utils/tweet.utils");

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
    addFollower,
    removeFollower,
    getFollowers,
    getFollowing,
};