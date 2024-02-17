const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const pool = require("../database/db_setup");

const follow = async (user_id, following, client) => {
  const addingFollow = await client.query(
    `INSERT INTO follows(user_id, following)
             VALUES ($1, $2);`,
    [user_id, following]
  );

  if (!addingFollow.rowCount) {
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while following",
    });
  }
  logger.info(user_id, "followed", following);

  return res.status(statusCodes.success).json({ message: "User followed" });
};

const unfollow = async (user_id, following, client) => {
  const unFollow = await client.query(
    `DELETE FROM follows
WHERE user_id = $1 and following = $2;`,
    [user_id, following]
  );

  if (!unFollow.rowCount) {
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while unfollowing",
    });
  }

  logger.info(user_id, "unfollowed", following);

  res.status(statusCodes.success).json({ message: "User unfollowed" });
};

const changeFollowStatus = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Missing user to follow" });
  }

  const client = await pool.connect();
  const user_id = req.user.id;
  const following = await client.query(
    `SELECT id FROM users WHERE username = $1;`,
    [username]
  );

  if (!following.rowCount) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Invalid user to follow" });
  }

  if (following.rows[0].id === user_id) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "You cannot follow yourself" });
  }

  const followStatus = await client.query(
    `SELECT 1 FROM follows WHERE user_id = $1 AND following = $2;`,
    [user_id, following.rows[0].id]
  );

  try {
    if (!followStatus.rowCount) {
      follow(user_id, following.rows[0].id, client);
    } else {
      unfollow(user_id, following.rows[0].id, client);
    }
  } catch (error) {
    logger.error("Following error:", error);
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while following",
    });
  } finally {
    client.release();
  }
};

const changeProfilePicture = async (req, res) => {
  const user_id = req.user.id;
  const profile_picture = req.file.path;

  const updateProfilePicture = await pool.query(
    `UPDATE users
        SET profile_picture = $1
        WHERE id = $2;`,
    [profile_picture, user_id]
  );

  if (!updateProfilePicture.rowCount) {
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

  const user = await pool.query(
    `SELECT password
        FROM users
        WHERE id = $1;`,
    [user_id]
  );

  if (!user.rowCount) {
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while updating password",
    });
  }

  const validPassword = await bcrypt.compare(
    oldPassword,
    user.rows[0].password
  );

  if (!validPassword) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Invalid password" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updatePassword = await pool.query(
    `UPDATE users
        SET password = $1
        WHERE id = $2;`,
    [hashedPassword, user_id]
  );

  if (!updatePassword.rowCount) {
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

  const usernameExists = await pool.query(
    `SELECT 1
        FROM users
        WHERE username = $1;`,
    [newUsername]
  );

  if (usernameExists.rowCount) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Username already exists" });
  }

  const updateUsername = await pool.query(
    `UPDATE users
        SET username = $1
        WHERE id = $2;`,
    [newUsername, user_id]
  );

  if (!updateUsername.rowCount) {
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

  const emailExists = await pool.query(
    `SELECT 1
        FROM users
        WHERE email = $1;`,
    [newEmail]
  );

  if (emailExists.rowCount) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Email already exists" });
  }

  const updateEmail = await pool.query(
    `UPDATE users
SET email = $1
WHERE id = $2;`,
    [newEmail, user_id]
  );

  if (!updateEmail.rowCount) {
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

  const updateBio = await pool.query(
    `UPDATE users
SET bio = $1
WHERE id = $2;`,
    [newBio, user_id]
  );

  if (!updateBio.rowCount) {
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while updating bio",
    });
  }

  logger.info("Bio updated for", user_id);

  res.status(statusCodes.success).json({ message: "Bio updated" });
};

const getProfile = async (req, res) => {
  const user_id = req.user.id;

  const profile = await pool.query(
    `SELECT username, email, bio, profile_picture
FROM users
WHERE id = $1;`,
    [user_id]
  );

  if (!profile.rowCount) {
    return res.status(statusCodes.queryError).json({
      message: "Exception occurred while fetching profile",
    });
  }

  res.status(statusCodes.success).json(profile.rows[0]);
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
