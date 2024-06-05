const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const session = require("../database/neo4j_setup");
const TweetModel = require("../models/tweetModel");

const getUserSimple = async (req, res) => {
  try {
    const { id, username } = req.query;
    if (id) {
      return getUserById(req, res);
    } else if (username) {
      const user = await session.run(
        `MATCH (u:User {username: $username})
         RETURN u.id, u.name, u.username, u.email, u.profile_pic, u.created_at, u.cover`,
        { username }
      );

      const userData = user.records[0];
      if (!userData) {
        return res.status(statusCodes.notFound).json({ message: "User not found" });
      }

      return res.status(statusCodes.success).json({ user: userData.get("u").properties });
    } else {
      return res.status(statusCodes.badRequest).json({ message: "Missing fields" });
    }
  } catch (error) {
    logger.error(error);
    return res.status(statusCodes.queryError).json({ message: "Error fetching user" });
  }
};

const getUsers = async (req, res) => {
  const { q } = req.query;

  try {
    let qformat = `%${q.trim()}%`;

    const users = await session.run(
      `MATCH (u:User)
       WHERE u.username CONTAINS $qformat OR u.name CONTAINS $qformat
       AND u.id <> $userId
       RETURN u.id, u.name, u.username, u.email, u.profile_pic, u.created_at 
       LIMIT 6`,
      { qformat, userId: req.user.id }
    );

    if (!users.records.length) {
      return res.status(statusCodes.notFound).json({ message: "No users found" });
    }

    const userList = users.records.map((record) => record.get("u").properties);
    return res.status(statusCodes.success).json({ users: userList });
  } catch (error) {
    logger.error(error);
    return res.status(statusCodes.queryError).json({ message: "Error fetching users" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.query;
    const user = await session.run(
      `MATCH (u:User {id: $id})
       RETURN u.id, u.name, u.username, u.email, u.profile_pic, u.created_at, u.bio, u.website, u.location, u.cover, u.dob`,
      { id }
    );

    const userData = user.records[0];
    if (!userData) {
      return res.status(statusCodes.notFound).json({ message: "User not found" });
    }

    return res.status(statusCodes.success).json({ user: userData.get("u").properties });
  } catch (error) {
    logger.error(error);
    return res.status(statusCodes.queryError).json({ message: "Error fetching user" });
  }
};

const getUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(statusCodes.badRequest).json({ message: "Username required" });
    }

    const result = await session.run(
      `MATCH (u:User {username: $username})
       OPTIONAL MATCH (f:User)-[r:FOLLOWS]->(u)
       OPTIONAL MATCH (u)-[:POSTS]->(t:Tweet)
       RETURN u.id, u.name, u.username, u.email, u.profile_pic, u.created_at, u.cover, u.website, u.location, u.bio, u.dob,
              COUNT(DISTINCT r) AS followers_count,
              COUNT(DISTINCT f) AS following_count,
              COUNT(DISTINCT t) AS post_count,
              EXISTS((:User {id: $userId})-[:FOLLOWS]->(u)) AS is_followed`,
      { username, userId: req.user.id }
    );

    const userData = result.records[0];
    if (!userData) {
      return res.status(statusCodes.notFound).json({ message: "User not found" });
    }

    const user = userData.get("u").properties;
    const postCount = await TweetModel.countDocuments({ userId: user.id, is_deleted: { $ne: true } });
    user.post_count = postCount;

    return res.status(statusCodes.success).json({ user });
  } catch (error) {
    logger.error(error);
    return res.status(statusCodes.queryError).json({ message: "Error fetching user by username" });
  }
};

const getExploreUsers = async (req, res) => {
  try {
    const { limit } = req.query;
    const result = await session.run(
      `MATCH (u:User)
       WHERE NOT (u)-[:FOLLOWS]->(:User {id: $userId})
       RETURN u.id, u.name, u.username, u.profile_pic
       ORDER BY RAND()
       LIMIT $limit`,
      { userId: req.user.id, limit: parseInt(limit) || 3 }
    );

    const userList = result.records.map((record) => record.get("u").properties);
    return res.status(statusCodes.success).json({ users: userList });
  } catch (error) {
    logger.error(error);
    return res.status(statusCodes.queryError).json({ message: "Error fetching non-followed users" });
  }
};

const updateUser = async (req, res) => {
  const { name, username, bio, location, website, profile_pic, cover, dob } = req.body;

  try {
    if (!dob || !username) {
      return res.status(statusCodes.badRequest).json({ message: "Missing fields must provide at least dob and username" });
    }

    if (username.length < 3 || username.length > 50 || username.includes(" ")) {
      return res.status(statusCodes.badRequest).json({ message: "Invalid username" });
    }

    if (name && (name.length < 3 || name.length > 50)) {
      return res.status(statusCodes.badRequest).json({ message: "Invalid name" });
    }

    if (bio && bio.length > 150) {
      return res.status(statusCodes.badRequest).json({ message: "Invalid bio" });
    }

    if (location && location.length > 50) {
      return res.status(statusCodes.badRequest).json({ message: "Invalid location" });
    }

    if (website && website.length > 50) {
      return res.status(statusCodes.badRequest).json({ message: "Invalid website" });
    }

    if (!new Date(dob)) {
      return res.status(statusCodes.badRequest).json({ message: "Invalid dob" });
    }

    await session.run(
      `MATCH (u:User {id: $userId})
       SET u.name = $name, u.username = $username, u.bio = $bio, u.location = $location,
           u.profile_pic = $profile_pic, u.website = $website, u.cover = $cover, u.dob = $dob`,
      { name, username, bio, location, profile_pic, website, cover, dob, userId: req.user.id }
    );

    return res.status(statusCodes.success).json({ message: "User updated" });
  } catch (error) {
    logger.error(error);
    return res.status(statusCodes.queryError).json({ message: "Error updating user" });
  }
};

const getFollowData = async (req, res) => {
  try {
    const { userId, followType, verified, limit, page } = req.query;

    if (!userId || !followType || (followType !== "followers" && followType !== "following")) {
      throw new Error("Missing fields or invalid followType");
    }

    const pageSize = parseInt(page) || 0;
    const resolveLimit = parseInt(limit) || 20;
    const toSkip = pageSize * resolveLimit;
    const resolveVerified = verified === "true" ? "AND users.verified = true" : "";

    const result = await session.run(
      `MATCH (u:User {id: $userId})
       ${followType === "followers" ? "<" : ""}-[r:FOLLOWS]-${followType === "following" ? ">" : ""}(users:User)
       RETURN users.id, users.username, users.name, users.profile_pic,
              COUNT(DISTINCT r) AS followers_count,
              EXISTS((u)-[:FOLLOWS]->(users)) AS is_followed
       ORDER BY users.username
       SKIP $toSkip LIMIT $resolveLimit`,
      { userId, toSkip, resolveLimit }
    );

    const userList = result.records.map((record) => {
      const user = record.get("users").properties;
      user.is_followed = record.get("is_followed");
      return user;
    });

    return res.status(statusCodes.success).json({ users: userList });
  } catch (error) {
    logger.error(error);
    return res.status(statusCodes.queryError).json({ message: "An error occurred" });
  }
};

const addFollower = async (req, res) => {
  const { followerId } = req.body;

  try {
    if (!followerId) {
      return res.status(statusCodes.badRequest).json({ message: "Missing fields" });
    }

    await session.run(
      `MATCH (follower:User {id: $followerId}), (user:User {id: $userId})
       MERGE (follower)-[:FOLLOWS]->(user)`,
      { followerId, userId: req.user.id }
    );

    return res.status(statusCodes.success).json({ message: "Follower added" });
  } catch (error) {
    logger.error("Error adding follower", error);
    return res.status(statusCodes.queryError).json({ message: "Error" });
  }
};

const removeFollower = async (req, res) => {
  const { followerId } = req.body;

  try {
    if (!followerId) {
      return res.status(statusCodes.badRequest).json({ message: "Missing follow id" });
    }

    await session.run(
      `MATCH (follower:User {id: $followerId})-[r:FOLLOWS]->(user:User {id: $userId})
       DELETE r`,
      { followerId, userId: req.user.id }
    );

    return res.status(statusCodes.success).json({ message: "Follower removed" });
  } catch (error) {
    logger.error("Error removing follower", error);
    return res.status(statusCodes.queryError).json({ message: "Error" });
  }
};

module.exports = {
  getUsers,
  getUserSimple,
  getUserByUsername,
  getExploreUsers,
  updateUser,
  addFollower,
  removeFollower,
  getFollowData
};
