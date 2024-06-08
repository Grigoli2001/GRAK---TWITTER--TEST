const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const driver = require("../database/db_setup");

const follow = async (user_id, following, session) => {
  try {
    await session.run(
      `
      MATCH (u:User {id: $userId}), (f:User {id: $followingId})
      MERGE (u)-[:FOLLOWS]->(f)
      `,
      { userId: user_id, followingId: following }
    );

    logger.info(user_id, "followed", following);
    return { success: true, message: "User followed" };
  } catch (error) {
    logger.error("Error while following:", error);
    return { success: false, message: "Exception occurred while following" };
  }
};

const unfollow = async (user_id, following, session) => {
  try {
    await session.run(
      `
      MATCH (u:User {id: $userId})-[r:FOLLOWS]->(f:User {id: $followingId})
      DELETE r
      `,
      { userId: user_id, followingId: following }
    );

    logger.info(user_id, "unfollowed", following);
    return { success: true, message: "User unfollowed" };
  } catch (error) {
    logger.error("Error while unfollowing:", error);
    return { success: false, message: "Exception occurred while unfollowing" };
  }
};

const changeFollowStatus = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Missing user to follow" });
  }

  const session = driver.session();
  const user_id = req.user.id;
  try {
    const result = await session.run(
      `
      MATCH (f:User {username: $username})
      RETURN f.id AS followingId
      `,
      { username }
    );

    if (!result.records.length) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Invalid user to follow" });
    }

    const followingId = result.records[0].get("followingId");

    if (followingId === user_id) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "You cannot follow yourself" });
    }

    const followStatus = await session.run(
      `
      MATCH (u:User {id: $userId})-[r:FOLLOWS]->(f:User {id: $followingId})
      RETURN count(r) AS count
      `,
      { userId: user_id, followingId }
    );

    if (followStatus.records[0].get("count") === 0) {
      await follow(user_id, followingId, session);
    } else {
      await unfollow(user_id, followingId, session);
    }

    res.status(statusCodes.success).json({ message: "Follow status changed" });
  } catch (error) {
    logger.error("Following error:", error);
    res.status(statusCodes.queryError).json({
      message: "Exception occurred while changing follow status",
    });
  } finally {
    await session.close();
  }
};

const changeProfilePicture = async (req, res) => {
  const user_id = req.user.id;
  const profile_picture = req.file.path;

  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (u:User {id: $userId})
      SET u.profile_picture = $profilePicture
      `,
      { userId: user_id, profilePicture: profile_picture }
    );

    logger.info("Profile picture updated for", user_id);
    res.status(statusCodes.success).json({ message: "Profile picture updated" });
  } catch (error) {
    logger.error("Error while updating profile picture:", error);
    res.status(statusCodes.queryError).json({
      message: "Exception occurred while updating profile picture",
    });
  } finally {
    await session.close();
  }
};

const changePassword = async (req, res) => {
  const user_id = req.user.id;
  const { oldPassword, newPassword } = req.body;

  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})
      RETURN u.password AS password
      `,
      { userId: user_id }
    );

    const userPassword = result.records[0].get("password");

    if (!userPassword) {
      return res.status(statusCodes.queryError).json({
        message: "Exception occurred while updating password",
      });
    }

    const validPassword = await bcrypt.compare(oldPassword, userPassword);

    if (!validPassword) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Invalid password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await session.run(
      `
      MATCH (u:User {id: $userId})
      SET u.password = $hashedPassword
      `,
      { userId: user_id, hashedPassword }
    );

    logger.info("Password updated for", user_id);
    res.status(statusCodes.success).json({ message: "Password updated" });
  } catch (error) {
    logger.error("Error while updating password:", error);
    res.status(statusCodes.queryError).json({
      message: "Exception occurred while updating password",
    });
  } finally {
    await session.close();
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

  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {username: $newUsername})
      RETURN count(u) AS count
      `,
      { newUsername }
    );

    if (result.records[0].get("count") > 0) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Username already exists" });
    }

    await session.run(
      `
      MATCH (u:User {id: $userId})
      SET u.username = $newUsername
      `,
      { userId: user_id, newUsername }
    );

    logger.info("Username updated for", user_id);
    res.status(statusCodes.success).json({ message: "Username updated" });
  } catch (error) {
    logger.error("Error while updating username:", error);
    res.status(statusCodes.queryError).json({
      message: "Exception occurred while updating username",
    });
  } finally {
    await session.close();
  }
};

const changeEmail = async (req, res) => {
  const user_id = req.user.id;
  const { newEmail } = req.body;

  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {email: $newEmail})
      RETURN count(u) AS count
      `,
      { newEmail }
    );

    if (result.records[0].get("count") > 0) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Email already exists" });
    }

    await session.run(
      `
      MATCH (u:User {id: $userId})
      SET u.email = $newEmail
      `,
      { userId: user_id, newEmail }
    );

    logger.info("Email updated for", user_id);
    res.status(statusCodes.success).json({ message: "Email updated" });
  } catch (error) {
    logger.error("Error while updating email:", error);
    res.status(statusCodes.queryError).json({
      message: "Exception occurred while updating email",
    });
  } finally {
    await session.close();
  }
};

const changeBio = async (req, res) => {
  const user_id = req.user.id;
  const { newBio } = req.body;

  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (u:User {id: $userId})
      SET u.bio = $newBio
      `,
      { userId: user_id, newBio }
    );

    logger.info("Bio updated for", user_id);
    res.status(statusCodes.success).json({ message: "Bio updated" });
  } catch (error) {
    logger.error("Error while updating bio:", error);
    res.status(statusCodes.queryError).json({
      message: "Exception occurred while updating bio",
    });
  } finally {
    await session.close();
  }
};

const getProfile = async (req, res) => {
  const user_id = req.user.id;

  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})
      RETURN u.username AS username, u.email AS email, u.bio AS bio, u.profile_picture AS profile_picture
      `,
      { userId: user_id }
    );

    const profile = result.records[0];

    if (!profile) {
      return res.status(statusCodes.queryError).json({
        message: "Exception occurred while fetching profile",
      });
    }

    res.status(statusCodes.success).json({
      username: profile.get("username"),
      email: profile.get("email"),
      bio: profile.get("bio"),
      profile_picture: profile.get("profile_picture"),
    });
  } catch (error) {
    logger.error("Error while fetching profile:", error);
    res.status(statusCodes.queryError).json({
      message: "Exception occurred while fetching profile",
    });
  } finally {
    await session.close();
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
