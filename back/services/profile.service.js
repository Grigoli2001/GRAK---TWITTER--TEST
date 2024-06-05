const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const { session } = require("../database/neo4j_setup");
const bcrypt = require("bcrypt");

const follow = async (user_id, following) => {
  const result = await session.run(
    `MATCH (u1:User {id: $user_id})
     MATCH (u2:User {id: $following})
     CREATE (u1)-[:FOLLOWS]->(u2)
     RETURN u1, u2`,
    { user_id, following }
  );

  if (!result.records.length) {
    throw new Error("Exception occurred while following");
  }

  logger.info(user_id, "followed", following);
  return "User followed";
};

const unfollow = async (user_id, following) => {
  const result = await session.run(
    `MATCH (u1:User {id: $user_id})-[r:FOLLOWS]->(u2:User {id: $following})
     DELETE r
     RETURN u1, u2`,
    { user_id, following }
  );

  if (!result.records.length) {
    throw new Error("Exception occurred while unfollowing");
  }

  logger.info(user_id, "unfollowed", following);
  return "User unfollowed";
};

const changeFollowStatus = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Missing user to follow" });
  }

  const user_id = req.user.id;
  const following = await session.run(
    `MATCH (u:User {username: $username}) RETURN u.id AS id`,
    { username }
  );

  if (!following.records.length) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Invalid user to follow" });
  }

  const followedUserId = following.records[0].get("id");

  if (followedUserId === user_id) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "You cannot follow yourself" });
  }

  try {
    const followStatus = await session.run(
      `MATCH (u1:User {id: $user_id})-[r:FOLLOWS]->(u2:User {id: $followedUserId})
       RETURN COUNT(r) AS count`,
      { user_id, followedUserId }
    );

    if (!followStatus.records[0].get("count")) {
      await follow(user_id, followedUserId);
    } else {
      await unfollow(user_id, followedUserId);
    }

    res.status(statusCodes.success).json({ message: "Follow status changed" });
  } catch (error) {
    logger.error("Following error:", error);
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while changing follow status",
    });
  }
};

const changeProfilePicture = async (req, res) => {
  const user_id = req.user.id;
  const profile_picture = req.file.path;

  const result = await session.run(
    `MATCH (u:User {id: $user_id})
     SET u.profile_picture = $profile_picture
     RETURN u`,
    { user_id, profile_picture }
  );

  if (!result.records.length) {
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while updating profile picture",
    });
  }

  logger.info("Profile picture updated for", user_id);

  res.status(statusCodes.success).json({ message: "Profile picture updated" });
};

const changePassword = async (req, res) => {
  const user_id = req.user.id;
  const { oldPassword, newPassword } = req.body;

  const user = await session.run(
    `MATCH (u:User {id: $user_id}) RETURN u.password AS password`,
    { user_id }
  );

  if (!user.records.length) {
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while updating password",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const validPassword = await bcrypt.compare(
    oldPassword,
    user.records[0].get("password")
  );

  if (!validPassword) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Invalid password" });
  }

  const result = await session.run(
    `MATCH (u:User {id: $user_id})
     SET u.password = $hashedPassword
     RETURN u`,
    { user_id, hashedPassword }
  );

  if (!result.records.length) {
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while updating password",
    });
  }

  logger.info("Password updated for", user_id);

  res.status(statusCodes.success).json({ message: "Password updated" });
};

const changeUsername = async (req, res) => {
  const user_id = req.user.id;
  const { newUsername } = req.body;

  if (!newUsername) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Missing new username" });
  }

  const result = await session.run(
    `MATCH (u:User {username: $newUsername})
     RETURN COUNT(u) AS count`,
    { newUsername }
  );

  if (result.records[0].get("count")) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Username already exists" });
  }

  const updateResult = await session.run(
    `MATCH (u:User {id: $user_id})
     SET u.username = $newUsername
     RETURN u`,
    { user_id, newUsername }
  );

  if (!updateResult.records.length) {
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while updating username",
    });
  }

  logger.info("Username updated for", user_id);

  res.status(statusCodes.success).json({ message: "Username updated" });
};

const changeEmail = async (req, res) => {
  const user_id = req.user.id;
  const { newEmail } = req.body;

  const result = await session.run(
    `MATCH (u:User {email: $newEmail})
     RETURN COUNT(u) AS count`,
    { newEmail }
  );

  if (result.records[0].get("count")) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Email already exists" });
  }

  const updateResult = await session.run(
    `MATCH (u:User {id: $user_id})
     SET u.email = $newEmail
     RETURN u`,
    { user_id, newEmail }
  );

  if (!updateResult.records.length) {
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while updating email",
    });
  }

  logger.info("Email updated for", user_id);

  res.status(statusCodes.success).json({ message: "Email updated" });
};

const changeBio = async (req, res) => {
  const user_id = req.user.id;
  const { newBio } = req.body;

  const result = await session.run(
    `MATCH (u:User {id: $user_id})
     SET u.bio = $newBio
     RETURN u`,
    { user_id, newBio }
  );

  if (!result.records.length) {
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while updating bio",
    });
  }

  logger.info("Bio updated for", user_id);

  res.status(statusCodes.success).json({ message: "Bio updated" });
};

const getProfile = async (req, res) => {
  const user_id = req.user.id;

  const result = await session.run(
    `MATCH (u:User {id: $user_id})
     RETURN u.username AS username, u.email AS email, u.bio AS bio, u.profile_picture AS profile_picture`,
    { user_id }
  );

  if (!result.records.length) {
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while fetching profile",
    });
  }

  res.status(statusCodes.success).json(result.records[0].toObject());
};

module.exports = {
  changeFollowStatus,
  changeProfilePicture,
  changePassword,
  changeUsername,
  changeEmail,
  changeBio,
  getProfile,
};
