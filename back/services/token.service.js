const { verifyRefreshToken } = require("../utils/auth.utils");
const { generateToken } = require("../utils/auth.utils");
const pool = require("../database/db_setup");
const statusCodes = require("../constants/statusCode");

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res
        .status(statusCodes.badRequest)
        .json({ message: "Missing fields" });
    }
    const refreshDecoded = verifyRefreshToken(refreshToken)
    const user = await pool.query("SELECT * FROM users WHERE id = $1;", [refreshDecoded.id]);
    if (!user.rowCount) {
        return res
        .status(statusCodes.notFound)
        .json({ message: "Invalid token" });
    }

    const token = generateToken(user.rows[0])
    return res.status(statusCodes.success).json({ token: token });

    

};

module.exports = { refreshToken };