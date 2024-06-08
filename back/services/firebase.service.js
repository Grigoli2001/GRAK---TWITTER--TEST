const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const { getBucket } = require("../database/firebase_setup");

const uploadImage = async (req, res) => {
  // havent tested this yet but should work
  const bucket = getBucket();
  const { file } = req.body;
  const { originalname, buffer } = file;

  if (!buffer) {
    return res
      .status(statusCodes.badRequest)
      .json({ error: "No image provided" });
  }

  console.log("file", file);
  const blob = bucket.file(originalname);
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype,
    },
  });

  blobStream.on("error", (err) => {
    logger.error(err);
    return res
      .status(statusCodes.serverError)
      .json({ error: "Error uploading image" });
  });

  blobStream.on("finish", async () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    return res.status(statusCodes.success).json({ url: publicUrl });
  });

  blobStream.end(buffer);
};

module.exports = { uploadImage };
