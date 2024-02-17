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

const checkExisting = async (client, data, column) => {
  try {
    if (column) {
      const { rows } = await client.query(
        "SELECT $1 FROM users WHERE $2 = $3;",
        [1, column, data]
      );
      return rows.length > 0;
    } else {
      const { rows } = await client.query(
        "SELECT $1 FROM users WHERE username = $2 OR email = $2;",
        [1, data]
      );
      return rows.length > 0;
    }
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
    service: 'gmail',
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

module.exports = {
  makeUsername,
  checkExisting,
  generateOTP,
  sendEmail,
};
