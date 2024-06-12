const statusCodes = require("../constants/statusCode");
const { getDriver } = require("../database/neo4j_setup");

const getExcludeUsers = async (req, res, next) => {

    try {

        const neo4jSession = getDriver().session();
       
        const excludedUsersQuery = await neo4jSession.run(
            `MATCH (u:User {id: $userId})-[:BLOCKS]->(b:User) RETURN b.id as id
            UNION
            MATCH (u:User {id: $userId})<-[:BLOCKS]-(b:User) RETURN b.id as id`,
            { userId: req.user.id }
        );

        const excludedUsers = excludedUsersQuery.records.map(record => record.get('id'));
        req.excludedUsers = excludedUsers;
        next();
    }
    catch (err) {
        console.log(err)
        res.status(statusCode.serverError).json({
            message: "Unexpected error",
        });
    }
}

 
const checkBlocked = async (req, res, next) => { 

    try{
      const { otherUserId } = req.body;
  
      if (!otherUserId) {
        return res.status(statusCodes.badRequest).json({ message: "Missing fields (otherUser)" });
      }
  
      if (otherUserId === req.user.id) {
        return res.status(statusCodes.badRequest).json({ message: "Cannot perform action on self" });
      }
      
      if (req.path !== "/unblock"){
      const session = getDriver().session();
      const result = await session.run(
        `MATCH (u:User {id: $currentUser})-[r:BLOCKS]->(f:User {id: $blockedUser}) RETURN f`,
        {currentUser: req.user.id, blockedUser: otherUserId}
      );
  
      if (result.records.length) {
        return res.status(statusCodes.forbidden).json({ message: "Blocked" });
      }
    }
      next();
    } catch (error) {
      console.log(error)
      logger.error("Error checking blocked", error);
      res.status(statusCodes.serverError).json({ message: "Error checking blocked" });
    } 
  }
  
module.exports = {
    getExcludeUsers,
    checkBlocked
}