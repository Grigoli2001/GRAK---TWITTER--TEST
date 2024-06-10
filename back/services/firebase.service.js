const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const { firebaseUpload, validateFiles } = require("../utils/firebase.utils");

const uploadImage = async (req, res) => {

    console.log("FILES", req.files)

    try {
        if (!req.files) {
            return res.status(statusCodes.badRequest).json({ error: "No file uploaded" });
        }
        const files = await validateFiles(req.files);
        console.log("VALIDATED FILES", files)
        if (!files) {
            return res.status(statusCodes.badRequest).json({ error: "file could not be validated" });
        }
        let image = files.image?.[0]

        console.log("IMAGE", image)
        
        console.log("USER", req.user.id)
        const imageUrl = await firebaseUpload(image, req.user.id, 'profile_pic');

        console.log("IMAGE URL", imageUrl)
        return res.status(statusCodes.success).json({ imageUrl });
    } catch (err) {
        logger.error(err);
        return res.status(statusCodes.serverError).json({ error: "Server Error" });
    }

};

module.exports = { uploadImage };
