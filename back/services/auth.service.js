const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const { getDriver } = require("../database/neo4j_setup");
const { v4: uuidv4 } = require("uuid");
const {
  makeUsername,
  checkExisting,
  generateOTP,
  sendEmail,
  generateToken,
  generateRefreshToken,
  hashPassword,
  comparePassword,
  generateNumberUUID
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
    res.status(statusCodes.badRequest).json({ message: "Missing fields" });
  }
  const session = getDriver()?.session();
  try {
    const emailExists = await checkExisting(session, email, "email");
    if (emailExists) {
      return res.status(statusCodes.badRequest).json({
        message: "Email already exists",
      });
    }
    let username = makeUsername(name);
    while (await checkExisting(session, username, "username")) {
      logger.info("USERNAME ALREADY EXISTS", username);
      username = makeUsername(name);
    }

    const hashedPassword = await hashPassword(password);
    const queryParams = {
      email,
      name,
      username,
      hashedPassword,
      dob,
      isGetmoreMarked,
      isConnectMarked,
      isPersonalizedMarked,
      profile_pic: "default_profile_pic.png",
      id: generateNumberUUID()
    };

    const addUser = await session.run(
      `CREATE (u:User {
              id: $userId, 
              email: $email, 
              name: $name, 
              id: $id,
              username: $username, 
              password: $hashedPassword, 
              dob: $dob, 
              isGetmoreMarked: $isGetmoreMarked, 
              isConnectMarked: $isConnectMarked, 
              isPersonalizedMarked: $isPersonalizedMarked, 
              profile_pic: $profile_pic,
              bio: ""
              }) RETURN u;`,
      queryParams
    );
    logger.info("USER ADDED", addUser.records.length, "email", email);

    //   Login the user
    req.body.userInfo = email;
    login(req, res);
  } catch (error) {
    logger.error("SignUp error:", error);
    return res.status(statusCodes.serverError).json({
      message: "Exception occurred while checking existing user",
    });
  } finally {
    session.close();
  }
};

const checkExistingUser = async (req, res) => {
  if (!req.body.userInfo) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Missing fields" });
  }
  try {
    const session = getDriver()?.session();

    let userExists =
      (await checkExisting(session, req.body.userInfo, "email")) ||
      (await checkExisting(session, req.body.userInfo, "username"));
    if (userExists) {
      return res.status(statusCodes.success).json({ message: "User exists" });
    }
    return res
      .status(statusCodes.success)
      .json({ message: "User does not exist" });
  } catch (error) {
    logger.error("Checking existing user error:", error);
    return res.status(statusCodes.serverError).json({
      message: "Exception occurred while checking existing user",
    });
  } finally {
    // session.close();
  }
};

const login = async (req, res) => {
  const { userInfo, password, usingGoogle } = req.body;

  try {
    const session = getDriver()?.session();

    // Check if the user is logging in with google
    if (usingGoogle) {
      const user = await session.run(
        "MATCH (u:User) WHERE u.email = $1 RETURN u;",
        { userInfo }
      );
      if (!user.records.length) {
        return res
          .status(statusCodes.notFound)
          .json({ message: "User does not exist" });
      }
      req.session.user = {
        email: user.records[0]._fields[0].properties.email,
      };

      const token = generateToken(user.records[0]._fields[0].properties);
      const refreshToken = generateRefreshToken(
        user.records[0]._fields[0].properties
      );

      return res.status(statusCodes.success).json({
        token: token,
        refresh: refreshToken,
        username: user.records[0]._fields[0].properties.username,
      });
    }

    // Normal login
    if (!userInfo || !password) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Missing fields" });
    }
    // get user from neo4j and the check hashed password
    const user = await session.run(
      "MATCH (u:User) WHERE (u.username = $1 OR u.email = $1) RETURN u;",
      { 1: userInfo }
    );

    if (!user.records.length) {
      return res
        .status(statusCodes.notFound)
        .json({ message: "Incorrect credentials" });
    }
    const hashedPassword = user.records[0]._fields[0].properties.password;
    const passwordMatch = await comparePassword(password, hashedPassword);
    if (!passwordMatch) {
      return res
        .status(statusCodes.notFound)
        .json({ message: "Incorrect credentials" });
    }

    req.session.user = {
      email: user.records[0]._fields[0].properties.email,
      id: user.records[0]._fields[0].properties.id,
    };
    req.user = {id:user.records[0]._fields[0].properties.id};
    console.log("USER", user.records[0]._fields[0].properties.id);
    const token = generateToken(user.records[0]._fields[0].properties);
    const refreshToken = generateRefreshToken(
      user.records[0]._fields[0].properties
    );

    return res.status(statusCodes.success).json({
      token: token,
      refresh: refreshToken,
      username: user.records[0]._fields[0].properties.username,
    });
  } catch (err) {
    console.log(err)
    logger.error(err);
    return res
      .status(statusCodes.serverError)
      .json({ error: "Exception occurred while logging in" });
  } finally {
    // session.close();
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
  console.log(otp);
  const mailSent = await sendEmail(email, subject, text);
  console.log(mailSent);
  if (mailSent) {
    return res
      .status(statusCodes.success)
      .json({ message: "OTP sent", otp: otp });
  } else {
    return res
      .status(statusCodes.serverError)
      .json({ message: "Error while sending OTP" });
  }
};

const changePassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    session = getDriver()?.session();
    const hashedPassword = await hashPassword(newPassword);
    const user = await session.run(
      "MATCH (u:User) WHERE u.email = $1 SET u.password = $2 RETURN u;",
      { 1: email, 2: hashedPassword }
    );
    if (user.records.length) {
      return res
        .status(statusCodes.success)
        .json({ message: "Password changed" });
    }
    return res.status(statusCodes.notFound).json({ message: "User not found" });
  } catch (error) {
    logger.error(error);
    return res
      .status(statusCodes.serverError)
      .json({ message: "Error while changing password" });
  } finally {
    // session.close();
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
  try {
    session = getDriver()?.session();

    const params = {
      1: userId,
      2: selectedTopics,
      3: selectedCategories,
      4: selectedLanguages,
      5: userName,
      6: profile_pic,
    };
    const user = await session.run(
      `MATCH (u:User) WHERE u.id = $1 SET u.selectedTopics = $2, u.selectedCategories = $3, u.selectedLanguages = $4, u.username = $5, u.profile_pic = $6 RETURN u;`,
      params
    );

    console.log(user.records.length);
    if (user.records.length) {
      return res
        .status(statusCodes.success)
        .json({ message: "Preferences updated" });
    }
    return res.status(statusCodes.notFound).json({ message: "User not found" });
  } catch (error) {
    logger.error(error);
    return res
      .status(statusCodes.serverError)
      .json({ message: "Error while updating preferences" });
  } finally {
    // session.close();
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
