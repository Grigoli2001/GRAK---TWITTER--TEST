const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const pool = require("../database/db_setup");
const jwt = require("jsonwebtoken");

const { makeUsername, checkExisting } = require("../utils/auth.utils");

const signup = async (req, res) => {
  const {
    email,
    name,
    password,
    dob,
    isGetmoreMarked,
    isConnectMarked,
    isPersonalizedMarked,
  } = req.body;

  if (!email || !name || !password || !dob) {
    res.status(statusCodes.badRequest).json({ message: "Missing fields" });
  } else {
    const client = await pool.connect();

    try {
      const emailExists = await checkExisting(client, email, "email");
      if (emailExists) {
        return res.status(statusCodes.badRequest).json({
          message: "Email already exists",
        });
      }

      let username = makeUsername(name);
      while (await checkExisting(client, username, "username")) {
        logger.info("USERNAME ALREADY EXISTS", username);
        username = makeUsername(name);
      }

      const addUser = await client.query(
        `INSERT INTO users(email,name, username, password,dob,isGetmoreMarked,isConnectMarked,isPersonalizedMarked)
           VALUES ($1,$2,$3, crypt($4, gen_salt('bf')), $5, $6, $7, $8);`,
        [
          email,
          name,
          username,
          password,
          dob,
          isGetmoreMarked,
          isConnectMarked,
          isPersonalizedMarked,
        ]
      );
      logger.info("USER ADDED", addUser.rowCount, "email", email);

      //   Login the user

      req.session.user = {
        email: email,
      };

      const token = jwt.sign(
        { user: { email: email } },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );

      res
        .status(statusCodes.success)
        .json({ message: "User created", token, username });
    } catch (error) {
      logger.error("Adding user error:", error);
      res.status(statusCodes.queryError).json({
        message: "Exception occurred while registering",
      });
    } finally {
      client.release();
    }
  }
};

const checkExistingUser = async (req, res) => {
  if (!req.body.userInfo) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Missing fields" });
  }
  if (await checkExisting(pool, req.body.userInfo)) {
    return res.status(statusCodes.success).json({ message: "User exists" });
  }
  return res
    .status(statusCodes.success)
    .json({ message: "User does not exist" });
};

const login = async (req, res) => {
  const { userInfo, password } = req.body;

  if (!userInfo || !password) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Missing fields" });
  } else {
    try {
      const user = await pool.query(
        "SELECT * FROM users WHERE (username = $1 OR email = $1) AND password = crypt($2, password) ;",
        [userInfo, password]
      );
      if (!user.rowCount) {
        return res
          .status(statusCodes.notFound)
          .json({ message: "Incorrect credentials" });
      }

      req.session.user = {
        email: user.rows[0].email,
      };

      const token = jwt.sign(
        { user: { email: user.rows[0].email } },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );

      return res
        .status(statusCodes.success)
        .json({ token, username: user.rows[0].username });
    } catch (error) {
      logger.error(error);
      return res
        .status(statusCodes.queryError)
        .json({ error: "Exception occurred while logging in" });
    }
  }
};

const logout = (req, res) => {
  if (req.session.user) {
    delete req.session.user;
  }
  return res.status(200).json({ message: "Disconnected" });
};

module.exports = {
  signup,
  login,
  logout,
  checkExistingUser,
};
