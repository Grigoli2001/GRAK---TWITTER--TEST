const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const logger = require("../middleware/winston");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const makeUsername = (name) => {
  const username =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 6) + Math.floor(Math.random() * 10000);

  return username;
};

function generateNumberUUID() {
  const uuid = uuidv4().replace(/-/g, ''); // generate UUID and remove hyphens
  return uuid;
}

const checkExisting = async (session, data, column) => {
  try {
    let query, params;
    if (column) {
      query = `MATCH (u:User) WHERE u.${column} = $data RETURN u LIMIT 1`;
      params = { data };
    } else {
      query = `MATCH (u:User) WHERE u.username = $data OR u.email = $data RETURN u LIMIT 1`;
      params = { data };
    }
    const result = await session.run(query, params);
    return result.records.length > 0;
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
    host: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT, // or the appropriate port provided by Brevo
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: to,
    subject: subject,
    text: text,
  };

  try {
    console.log(text);
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error while sending email:", error);
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

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  makeUsername,
  checkExisting,
  generateOTP,
  sendEmail,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  generateNumberUUID,
};
