const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const { getSession } = require("../database/db_setup");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const {
  makeUsername,
  checkExisting,
  generateOTP,
  sendEmail,
  generateToken,
  generateRefreshToken,
} = require("../utils/auth.utils");

const signup = async (req, res) => {
  const {
    email,
    name,
    password,
    dob,
    isGetmoreMarked,
    isConnectMarked,
    isPersonalizedMarked,
    profile_pic,
  } = req.body;

  if (!email || !name || !password) {
    return res.status(statusCodes.badRequest).json({ message: "Missing fields" });
  }

  const session = getSession();
  try {
    logger.info('Checking if email exists:', email);
    const emailExists = await checkExisting(session, email, "email");
    if (emailExists) {
      return res.status(statusCodes.badRequest).json({ message: "Email already exists" });
    }

    let username = makeUsername(name);
    while (await checkExisting(session, username, "username")) {
      logger.info("USERNAME ALREADY EXISTS", username);
      username = makeUsername(name);
    }

    const queryParams = {
      email,
      name,
      username,
      password,
      dob,
      isGetmoreMarked,
      isConnectMarked,
      isPersonalizedMarked,
      profile_pic: "default_profile_pic.png",
    };

    const addUser = await session.run(
      `
      CREATE (u:User {
        email: $email,
        name: $name,
        username: $username,
        password: apoc.crypto.bcrypt($password),
        dob: $dob,
        isGetmoreMarked: $isGetmoreMarked,
        isConnectMarked: $isConnectMarked,
        isPersonalizedMarked: $isPersonalizedMarked,
        profile_pic: $profile_pic
      })
      RETURN u
      `,
      queryParams
    );
    logger.info("USER ADDED", addUser.records.length, "email", email);

    // Login the user
    req.body.userInfo = email;
    login(req, res);
  } catch (error) {
    logger.error("Adding user error:", error);
    res.status(statusCodes.queryError).json({ message: "Exception occurred while registering" });
  } finally {
    await session.close();
  }
};

const checkExistingUser = async (req, res) => {
  if (!req.body.userInfo) {
    return res.status(statusCodes.badRequest).json({ message: "Missing fields" });
  }

  const session = getSession();
  try {
    const userExists = await checkExisting(session, req.body.userInfo);
    const message = userExists ? "User exists" : "User does not exist";
    return res.status(statusCodes.success).json({ message });
  } catch (error) {
    logger.error(error);
    return res.status(statusCodes.queryError).json({ message: "Error while checking existing user" });
  } finally {
    await session.close();
  }
};

const login = async (req, res) => {
  const { userInfo, password, usingGoogle } = req.body;

  if (usingGoogle) {
    const session = getSession();
    try {
      const result = await session.run("MATCH (u:User {email: $email}) RETURN u", { email: userInfo });
      const user = result.records.length ? result.records[0].get('u').properties : null;
      if (!user) {
        return res.status(statusCodes.notFound).json({ message: "User does not exist" });
      }
      req.session.user = { email: user.email };

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      return res.status(statusCodes.success).json({ token, refresh: refreshToken, username: user.username });
    } catch (error) {
      logger.error(error);
      return res.status(statusCodes.queryError).json({ error: "Exception occurred while logging in" });
    } finally {
      await session.close();
    }
  }

  if (!userInfo || !password) {
    return res.status(statusCodes.badRequest).json({ message: "Missing fields" });
  }

  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (u:User) 
       WHERE (u.username = $userInfo OR u.email = $userInfo) 
         AND u.password = apoc.crypto.bcryptCheck($password, u.password) 
       RETURN u`,
      { userInfo, password }
    );
    const user = result.records.length ? result.records[0].get('u').properties : null;
    if (!user) {
      return res.status(statusCodes.notFound).json({ message: "Incorrect credentials" });
    }

    req.session.user = { email: user.email };

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(statusCodes.success).json({ token, refresh: refreshToken, username: user.username });
  } catch (error) {
    logger.error(error);
    return res.status(statusCodes.queryError).json({ error: "Exception occurred while logging in" });
  } finally {
    await session.close();
  }
};

const logout = (req, res) => {
  if (req.session.user) {
    delete req.session.user;
  }
  return res.status(200).json({ message: "Disconnected" });
};

const sendOTP = async (req, res) => {
  const email = req.body.email;
  const otp = generateOTP();
  const subject = "OTP for verification";
  const text = `Your OTP is ${otp}`;
  const mailSent = await sendEmail(email, subject, text);
  if (mailSent) {
    return res.status(statusCodes.success).json({ message: "OTP sent", otp });
  } else {
    return res.status(statusCodes.queryError).json({ message: "Error while sending OTP" });
  }
};

const changePassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (u:User {email: $email})
      SET u.password = apoc.crypto.bcrypt($newPassword)
      RETURN u
      `,
      { email, newPassword }
    );

    if (result.records.length) {
      return res.status(statusCodes.success).json({ message: "Password changed" });
    }
    return res.status(statusCodes.notFound).json({ message: "User not found" });
  } catch (error) {
    logger.error(error);
    return res.status(statusCodes.queryError).json({ message: "Error while changing password" });
  } finally {
    await session.close();
  }
};

const userPreferences = async (req, res) => {
  const {
    userId,
    selectedTopics,
    selectedCategories,
    selectedLanguages,
    userName,
    profile_pic,
  } = req.body;

  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})
      SET u.selectedTopics = $selectedTopics,
          u.selectedCategories = $selectedCategories,
          u.selectedLanguages = $selectedLanguages,
          u.username = $userName,
          u.profile_pic = $profile_pic
      RETURN u
      `,
      {
        userId,
        selectedTopics,
        selectedCategories,
        selectedLanguages,
        userName,
        profile_pic: profile_pic || "default_profile_pic.png",
      }
    );

    if (result.records.length) {
      return res.status(statusCodes.success).json({ message: "Preferences updated" });
    }
    return res.status(statusCodes.notFound).json({ message: "User not found" });
  } catch (error) {
    logger.error(error);
    return res.status(statusCodes.queryError).json({ message: "Error while updating preferences" });
  } finally {
    await session.close();
  }
};

module.exports = {
  signup,
  login,
  logout,
  checkExistingUser,
  sendOTP,
  changePassword,
  userPreferences,
};
