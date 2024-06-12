const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const { getDriver } = require("../database/neo4j_setup");
const { comparePassword, hashPassword } = require("../utils/auth.utils");

const follow = async (user_id, following, session) => {
  const result = await session.run(
    `MATCH (a:User), (b:User) WHERE a.id=$user_id and b.id = $following MERGE (a)-[r:FOLLOWS]->(b) return a,b,r`,
    { user_id, following }
  );
  if (!result) {
    return {
      status: statusCodes.serverError,
      message: "Exception occurred while following",
    };
  }
  logger.info(user_id + " followed " + following);

  return {
    status: statusCodes.success,
    message: "User followed",
  };
};

const unfollow = async (user_id, following, session) => {
  try {
    const result = await session.run(
      `MATCH (a:User)-[r:FOLLOWS]->(b:User) WHERE a.id=$user_id and b.id = $following DELETE r return a,b,r`,
      { user_id, following }
    );
    logger.info(user_id + " uenfollowed " + following);
    return {
      status: statusCodes.success,
      message: "User unfollowed",
    };
  } catch (error) {
    logger.error("Unfollowing error:", error);
    return {
      status: statusCodes.serverError,
      message: "Exception occurred while unfollowing",
    };
  }
};

const changeFollowStatus = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Missing user to follow" });
  }

  const session = getDriver()?.session();
  const user_id = req.user.id;
  try {
    const followingResult = await session.run(
      `MATCH (u:User {username: $username}) RETURN u.id as id`,
      { username }
    );
    if (!followingResult.records.length) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Invalid user to follow" });
    }
    const following = followingResult.records[0].get("id");

    if (following === user_id) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "You cannot follow yourself" });
    }
    const followStatus = await session.run(
      `MATCH (a:User), (b:User) WHERE a.id=$user_id and b.id = $following RETURN EXISTS((a)-[:FOLLOWS]->(b)) as followStatus`,
      { user_id, following }
    );

    console.log(
      `follow status ${user_id} follows ${following}`,
      followStatus.records[0].get("followStatus")
    );
    let response;
    if (!followStatus.records[0].get("followStatus")) {
      response = await follow(user_id, following, session);
    } else {
      response = await unfollow(user_id, following, session);
    }
    return res.status(response.status).json({ message: response.message });
  } catch (error) {
    logger.error("Following error:", error);
    return res.status(statusCodes.serverError).json({
      message: "Exception occurred while following",
    });
  } finally {
    session.close();
  }
};

const changeProfilePicture = async (req, res) => {
  const user_id = req.user.id;
  const profile_picture = req.file.path;

  try {
    const session = getDriver()?.session();
    const result = await session.run(
      `MATCH (u:User {id: $user_id}) SET u.profile_picture = $profile_picture RETURN u`,
      { user_id, profile_picture }
    );
    logger.info("Profile picture updated for : " + user_id);
    return res
      .status(statusCodes.success)
      .json({ message: "Profile picture updated" });
  } catch (error) {
    logger.error("Profile picture update error:", error);
    return res.status(statusCodes.serverError).json({
      message: "Exception occurred while updating profile picture",
    });
  } finally {
    session.close();
  }
};

const changePassword = async (req, res) => {
  const user_id = req.user.id;
  const { oldPassword, newPassword } = req.body;

  try {
    const session = getDriver()?.session();
    const user = await session.run(
      `MATCH (u:User {id: $user_id}) RETURN u.password as password`,
      { user_id }
    );
    if (!user.records.length) {
      return res.status(statusCodes.serverError).json({
        message: "Exception occurred while updating password",
      });
    }
    const validPassword = await comparePassword(
      oldPassword,
      user.records[0].get("password")
    );
    if (!validPassword) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Invalid password" });
    }
    const hashedPassword = await hashPassword(newPassword);
    const result = await session.run(
      `MATCH (u:User {id: $user_id}) SET u.password = $hashedPassword RETURN u`,
      { user_id, hashedPassword }
    );
    logger.info("Password updated for " + user_id);
    return res
      .status(statusCodes.success)
      .json({ message: "Password updated" });
  } catch (error) {
    logger.error("Password update error:", error);
    return res.status(statusCodes.serverError).json({
      message: "Exception occurred while updating password",
    });
  } finally {
    session.close();
  }
};

const changeUsername = async (req, res) => {
  const user_id = req.user.id;
  const { newUsername } = req.body;

  if (!newUsername) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Missing new username" });
  }

  try {
    const session = getDriver()?.session();
    const usernameExists = await session.run(
      `MATCH (u:User {username: $newUsername}) RETURN u`,
      { newUsername }
    );
    if (usernameExists.records.length) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Username already exists" });
    }
    const result = await session.run(
      `MATCH (u:User {id: $user_id}) SET u.username = $newUsername RETURN u`,
      { user_id, newUsername }
    );
    logger.info("Username updated for " + user_id);
    return res
      .status(statusCodes.success)
      .json({ message: "Username updated" });
  } catch (error) {
    logger.error("Username update error:", error);
    return res.status(statusCodes.serverError).json({
      message: "Exception occurred while updating username",
    });
  } finally {
    session.close();
  }
};

const changeEmail = async (req, res) => {
  const user_id = req.user.id;
  const { newEmail } = req.body;

  try {
    const session = getDriver()?.session();
    const emailExists = await session.run(
      `MATCH (u:User {email: $newEmail}) RETURN u`,
      { newEmail }
    );
    if (emailExists.records.length) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Email already exists" });
    }
    const result = await session.run(
      `MATCH (u:User {id: $user_id}) SET u.email = $newEmail RETURN u`,
      { user_id, newEmail }
    );
    logger.info("Email updated for " + user_id);
    return res.status(statusCodes.success).json({ message: "Email updated" });
  } catch (error) {
    logger.error("Email update error:", error);
    return res.status(statusCodes.serverError).json({
      message: "Exception occurred while updating email",
    });
  } finally {
    session.close();
  }
};

const changeBio = async (req, res) => {
  const user_id = req.user.id;
  const { newBio } = req.body;

  try {
    const session = getDriver()?.session();
    const result = await session.run(
      `MATCH (u:User {id: $user_id}) SET u.bio = $newBio RETURN u`,
      { user_id, newBio }
    );
    logger.info("Bio updated for " + user_id);
    return res.status(statusCodes.success).json({ message: "Bio updated" });
  } catch (error) {
    logger.error("Bio update error:", error);
    return res.status(statusCodes.serverError).json({
      message: "Exception occurred while updating bio",
    });
  } finally {
    session.close();
  }
};

const getProfile = async (req, res) => {
  const user_id = req.user.id;

  try {
    const session = getDriver()?.session();
    const result = await session.run(
      `MATCH (u:User {id: $user_id}) RETURN u.username as username, u.email as email, u.bio as bio, u.profile_picture as profile_picture`,
      { user_id }
    );
    if (!result.records.length) {
      return res.status(statusCodes.serverError).json({
        message: "Exception occurred while fetching profile",
      });
    }
    res.status(statusCodes.success).json(result.records[0].toObject());
  } catch (error) {
    logger.error("Profile fetch error:", error);
    return res.status(statusCodes.serverError).json({
      message: "Exception occurred while fetching profile",
    });
  } finally {
    session.close();
  }
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
