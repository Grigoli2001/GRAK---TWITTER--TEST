const { verifyRefreshToken, generateToken } = require("../utils/auth.utils");
const { driver } = require("../database/db_setup");
const statusCodes = require("../constants/statusCode");

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res
            .status(statusCodes.badRequest)
            .json({ message: "Missing fields" });
    }
    const refreshDecoded = verifyRefreshToken(refreshToken);
    const session = driver.session();
    try {
        const result = await session.run(
            `
            MATCH (u:User {id: $userId})
            RETURN u
            `,
            { userId: refreshDecoded.id }
        );
        
        const user = result.records[0].get("u");

        if (!user) {
            return res
                .status(statusCodes.notFound)
                .json({ message: "Invalid token" });
        }

        const token = generateToken(user.properties);
        return res.status(statusCodes.success).json({ token });
    } catch (error) {
        console.error("Error while refreshing token:", error);
        return res.status(statusCodes.queryError).json({ message: "Error while refreshing token" });
    } finally {
        await session.close();
    }
};

module.exports = { refreshToken };
