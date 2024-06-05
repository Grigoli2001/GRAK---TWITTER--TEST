const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const session = require("../database/neo4j_setup");
const jwt = require("jsonwebtoken");
const multer = require("multer");

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
  } else {
    try {
      const result = await session.run(
        `
        CREATE (u:User { email: $email, name: $name, password: $password, dob: $dob, 
          isGetmoreMarked: $isGetmoreMarked, isConnectMarked: $isConnectMarked, 
          isPersonalizedMarked: $isPersonalizedMarked, profile_pic: $profile_pic })
        RETURN u
        `,
        {
          email,
          name,
          password,
          dob,
          isGetmoreMarked,
          isConnectMarked,
          isPersonalizedMarked,
          profile_pic
        }
      );

      logger.info("User added", result.records[0].get("u"));
      res.status(statusCodes.success).json({ message: "User added" });
    } catch (error) {
      logger.error("Adding user error:", error);
      res.status(statusCodes.queryError).json({
        message: "Exception occurred while registering",
      });
    }
  }
};

const login = async (req, res) => {
  const { userInfo, password, usingGoogle } = req.body;

  try {
    let result;
    if (usingGoogle) {
      // Logic for Google login
    } else {
      result = await session.run(
        `
        MATCH (u:User { email: $email, password: $password })
        RETURN u
        `,
        {
          email: userInfo,
          password
        }
      );
    }

    if (result.records.length === 0) {
      return res
        .status(statusCodes.notFound)
        .json({ message: "Incorrect credentials" });
    }

    const user = result.records[0].get("u");
    const token = jwt.sign({ email: user.properties.email }, process.env.JWT_SECRET_KEY);

    return res.status(statusCodes.success).json({ token });
  } catch (error) {
    logger.error("Login error:", error);
    return res
      .status(statusCodes.queryError)
      .json({ error: "Exception occurred while logging in" });
  }
};

const checkExistingUser = async (req, res) => {
  const { userInfo } = req.body;

  try {
    const result = await session.run(
      `
      MATCH (u:User { email: $email })
      RETURN u
      `,
      {
        email: userInfo
      }
    );

    if (result.records.length > 0) {
      return res.status(statusCodes.success).json({ message: "User exists" });
    }

    return res.status(statusCodes.success).json({ message: "User does not exist" });
  } catch (error) {
    logger.error("Check existing user error:", error);
    return res
      .status(statusCodes.queryError)
      .json({ error: "Exception occurred while checking existing user" });
  }
};

const logout = (req, res) => {
    // Logic for logout
    try {
      // Destroy the session
      req.session.destroy((err) => {
        if (err) {
          logger.error("Logout error:", err);
          return res.status(statusCodes.queryError).json({ error: "Logout failed" });
        }
        return res.status(statusCodes.success).json({ message: "Logout successful" });
      });
    } catch (error) {
      logger.error("Logout error:", error);
      return res.status(statusCodes.queryError).json({ error: "Logout failed" });
    }
  };
  
  const sendOTP = async (req, res) => {
    // Logic for sending OTP
    try {
      // Implementation for sending OTP
      return res.status(statusCodes.success).json({ message: "OTP sent" });
    } catch (error) {
      logger.error("Send OTP error:", error);
      return res
        .status(statusCodes.queryError)
        .json({ error: "Error while sending OTP" });
    }
  };
  
  const changePassword = async (req, res) => {
    // Logic for changing password
    try {
      // Implementation for changing password
      return res.status(statusCodes.success).json({ message: "Password changed" });
    } catch (error) {
      logger.error("Change password error:", error);
      return res
        .status(statusCodes.queryError)
        .json({ error: "Error while changing password" });
    }
  };
  
  const userPreferences = async (req, res) => {
    // Logic for updating user preferences
    try {
      // Implementation for updating user preferences
      return res
        .status(statusCodes.success)
        .json({ message: "User preferences updated" });
    } catch (error) {
      logger.error("User preferences error:", error);
      return res
        .status(statusCodes.queryError)
        .json({ error: "Error while updating user preferences" });
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
  

module.exports = {
  signup,
  login,
  logout,
  checkExistingUser,
  sendOTP,
  changePassword,
  userPreferences,
};
