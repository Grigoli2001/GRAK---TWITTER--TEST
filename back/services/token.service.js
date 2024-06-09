const { verifyRefreshToken } = require("../utils/auth.utils");
const { generateToken } = require("../utils/auth.utils");
const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const { getDriver } = require("../database/neo4j_setup");

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Missing fields" });
  }
  try {
    const session = getDriver().session();
    const refreshDecoded = verifyRefreshToken(refreshToken);
    console.log(refreshDecoded);
    const user = await session.run(
      `MATCH (u:User {id: $id}) RETURN u`,
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
      .status(statusCodes.serverError)
      .json({ message: "Error while refreshing token" });
  } 

};

module.exports = { refreshToken };
