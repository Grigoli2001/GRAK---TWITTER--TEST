const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const logger = require("../middleware/winston");
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  'neo4j://localhost',
  neo4j.auth.basic('neo4j', 'password')
);
const session = driver.session();

const makeUsername = (name) => {
  const username =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 6) + Math.floor(Math.random() * 10000);

  return username;
};

const checkExisting = async (data, column) => {
  try {
    let result;
    if (column) {
      const existingUser = await session.run(
        'MATCH (u:User) WHERE u.$column = $data RETURN u',
        { column: column, data: data }
      );
      result = existingUser.records.length > 0;
    } else {
      const existingUser = await session.run(
        'MATCH (u:User) WHERE u.username = $data OR u.email = $data RETURN u',
        { data: data }
      );
      result = existingUser.records.length > 0;
    }
    return result;
  } catch (error) {
    logger.error(`Error while checking existing ${column}:`, error);
    return true;
  }
};

const generateOTP = () => {
  //numbers only
  return otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: to,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    logger.error("Error while sending email:", error);
    return false;
  } finally {
    transporter.close();
  }
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      profile_pic: user.profile_pic,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "3h",
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
    },
    process.env.REFRESH_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_SECRET_KEY);
};

module.exports = {
  makeUsername,
  checkExisting,
  generateOTP,
  sendEmail,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
};
