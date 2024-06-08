const admin = require("firebase-admin");
const logger = require("../middleware/winston");
const config = require("../twitter-clone-413423-firebase-adminsdk-b4tea-aaee6e54b8.json");

const connectToFirebase = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(config),
      storageBucket: "gs://twitter-clone-413423.appspot.com",
    });
    logger.info("Firebase connected Successfully");
  } catch (err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    return process.exit(1);
  }
};

const getBucket = () => {
  return admin.storage().bucket();
};

module.exports = { connectToFirebase, getBucket };
