const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const session = require("../database/db_setup");
const tweetModel = require("../models/tweetModel");

const getUserSimple = async (req, res) => {
  try {
    const { id, username } = req.query;
    if (id) {
      return getUserById(req, res);
    } else if (username) {
      const result = await session.run(
        `
        MATCH (u:User { username: $username })
        RETURN u.id, u.name, u.username, u.email, u.dob, u.profile_pic, u.created_at, u.cover
        `,
        { username: username }
      );
      const user = result.records[0];
      if (!user) {
        return res.status(statusCodes.notFound).json({ message: "User not found" });
      }
      res.status(statusCodes.success).json({ user: user });
    } else {
      res.status(statusCodes.badRequest).json({ message: "Missing fields" });
    }
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching user" });
  }
};

const getUsers = async (req, res) => {
  const { q } = req.query;
  try {
    const result = await session.run(
      `
      MATCH (u:User)
      WHERE u.username CONTAINS $q OR u.name CONTAINS $q
      AND NOT u.id = $userId
      RETURN u.id, u.name, u.username, u.email, u.profile_pic, u.created_at
      LIMIT 6
      `,
      { q: q.trim(), userId: req.user.id }
    );
    const users = result.records.map(record => record.toObject());
    if (!users.length) {
      return res.status(statusCodes.notFound).json({ message: "No users found" });
    }
    res.status(statusCodes.success).json({ users: users });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching users" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await session.run(
      `
      MATCH (u:User { id: $id })
      RETURN u.id, u.name, u.username, u.email, u.profile_pic, u.created_at, u.bio, u.website, u.location, u.cover, u.dob
      `,
      { id: id }
    );
    const user = result.records[0];
    if (!user) {
      return res.status(statusCodes.notFound).json({ message: "User not found" });
    }
    res.status(statusCodes.success).json({ user: user });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching user" });
  }
};

const getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    if (!username) {
      return res.status(statusCodes.badRequest).json({
        message: 'username required'
      });
    }
    const result = await session.run(
      `
      MATCH (u:User { username: $username })
      RETURN u.id, u.name, u.username, u.email, u.profile_pic, u.created_at, u.cover, u.website, u.location, u.bio, u.dob
      `,
      { username: username }
    );
    const userData = result.records[0];
    if (!userData) {
      return res.status(statusCodes.notFound).json({ message: "User not found" });
    }
    let user = userData.toObject();
    let postcount = await tweetModel.countDocuments({ userId: user.id, is_deleted: false });
    user.post_count = postcount;
    res.status(statusCodes.success).json({ user: user });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching user by username" });
  }
};

const getExploreUsers = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const result = await session.run(
      `
      MATCH (u:User)
      WHERE NOT u.id = $userId AND NOT (u)<-[:FOLLOWS]-(:User { id: $userId })
      RETURN u.id, u.username, u.bio, u.profile_pic, u.name, 
             SIZE((u)<-[:FOLLOWS]-(:User)) AS followers_count,
             SIZE((u)-[:FOLLOWS]->(:User)) AS following_count,
             0 AS is_followed
      ORDER BY rand()
      LIMIT $limit
      `,
      { userId: req.user.id, limit: limit ?? 3 }
    );
    const users = result.records.map(record => record.toObject());
    res.status(statusCodes.success).json({ users: users });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching non-followed users" });
  }
};

const updateUser = async (req, res) => {
  const { name, username, bio, location, website, profile_pic, cover, dob } = req.body;
  try {
    const result = await session.run(
      `
      MATCH (u:User { id: $userId })
      SET u.name = $name, u.username = $username, u.bio = $bio, 
          u.location = $location, u.profile_pic = $profile_pic, u.website = $website,
          u.cover = $cover, u.dob = $dob
      `,
      { userId: req.user.id, name: name, username: username, bio: bio, location: location, profile_pic: profile_pic, website: website, cover: cover, dob: dob }
    );
    res.status(statusCodes.success).json({ message: "User updated" });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error updating user" });
  }
};

const getFollowData = async (req, res) => {
  try {
    const { userId, followType, verified, limit, page } = req.query;
    if (!userId || !followType || (followType !== 'followers' && followType !== 'following')) {
      throw new Error('Missing fields or invalid followType');
    }
    const result = await session.run(
      `
      MATCH (u:User { id: $userId })-[f:FOLLOWS]->(other:User)
      WHERE type(f) = $followType ${verified === 'true' ? 'AND other.verified = true' : ''}
      RETURN other.id AS user_id, other.username, other.name, other.profile_pic, 
             SIZE((other)<-[:FOLLOWS]-(:User)) AS followers_count,
             SIZE((other)-[:FOLLOWS]->(:User)) AS following_count,
             CASE WHEN $userId IN [(other)<-[:FOLLOWS]-(:User)] THEN 1 ELSE 0 END AS is_followed
      SKIP $page * $limit LIMIT $limit
      `,
      { userId: userId, followType: followType, verified: verified, page: page, limit: limit }
    );
    const follow_data = result.records.map(record => record.toObject());
    res.status(statusCodes.success).json({ users: follow_data });
  } catch (error) {
    logger.error(error);
    res.status(statusCodes.queryError).json({ message: 'An error occurred' });
  }
};

const addFollower = async (req, res) => {
  const { followerId } = req.body;
  try {
    if (!followerId) {
      return res.status(statusCodes.badRequest).json({ message: "Missing fields" });
    }
    const result = await session.run(
      `
      MATCH (u:User { id: $userId }), (f:User { id: $followerId })
      CREATE (u)-[:FOLLOWS]->(f)
      `,
      { userId: req.user.id, followerId: followerId }
    );
    res.status(statusCodes.success).json({ message: "Follower added" });
  } catch (error) {
    logger.error("Error adding follower", error);
    res.status(statusCodes.queryError).json({ message: "Error" });
  }
};

const removeFollower = async (req, res) => {
  const { followerId } = req.body;
  try {
    if (!followerId) {
      return res.status(statusCodes.badRequest).json({ message: "Missing follow id" });
    }
    const result = await session.run(
      `
      MATCH (u:User { id: $userId })-[f:FOLLOWS]->(f:User { id: $followerId })
      DELETE f
      `,
      { userId: req.user.id, followerId: followerId }
    );
    res.status(statusCodes.success).json({ message: "Follower removed" });
  } catch (error) {
    logger.error("Error removing follower", error);
    res.status(statusCodes.queryError).json({ message: "Error" });
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
