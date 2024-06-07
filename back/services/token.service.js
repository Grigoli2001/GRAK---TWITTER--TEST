const { verifyRefreshToken } = require("../utils/auth.utils");
const { generateToken } = require("../utils/auth.utils");
const statusCodes = require("../constants/statusCode");
const driver = require("../database/neo4j_setup");

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Missing fields" });
  }
  try {
    const session = driver.session();
    const refreshDecoded = verifyRefreshToken(refreshToken);
    const user = await session.run(
      `MATCH (u:User) WHERE ID(u) = $id RETURN u`,
      { id: refreshDecoded.id }
    );

    if (!user.records.length) {
      return res
        .status(statusCodes.notFound)
        .json({ message: "Invalid token" });
    }

    const token = generateToken(user.records[0]._fields[0].properties);
    return res.status(statusCodes.success).json({ token: token });
  } catch (error) {
    logger.error("Error while refreshing token:", error);
    return res
      .status(statusCodes.internalServerError)
      .json({ message: "Error while refreshing token" });
  } finally {
    session.close();
  }
};

module.exports = { refreshToken };
