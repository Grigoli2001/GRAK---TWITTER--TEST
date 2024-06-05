const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const logger = require("../middleware/winston");

const makeUsername = (name) => {
  const username =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 6) + Math.floor(Math.random() * 10000);

  return username;
};

const checkExisting = async (session, data, column) => {
  try {
    let query = "";
    let parameters = {};

    if (column) {
      query = `MATCH (u:User) WHERE u.${column} = $data RETURN u`;
      parameters = { data };
    } else {
      query = "MATCH (u:User) WHERE u.username = $data OR u.email = $data RETURN u";
      parameters = { data };
    }

    const result = await session.run(query, parameters);
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

module.exports = {
  makeUsername,
  checkExisting,
  generateOTP,
  sendEmail,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
};
