const { getDriver } = require("../database/neo4j_setup");

const getUserFullDetails = async (targetUser, currentUser, fetch_how) => {
  // returns a single user with their followers, following and if currentUser follows targetUser
  if (fetch_how !== "id" && fetch_how !== "username") {
    throw new Error("Invalid fetch_how: should be id or username");
  }

  const session = getDriver().session();
  const result = await session.run(
    `MATCH (u:User {${fetch_how}: $targetUser})
    WHERE NOT EXISTS((u)-[:BLOCKS]->({id: $currentUser}))
    OPTIONAL MATCH (u)<-[b:BLOCKS]-(User {id: $currentUser})
    OPTIONAL MATCH (u)-[f1:FOLLOWS]->(following:User)
    OPTIONAL MATCH (u)<-[f2:FOLLOWS]-(follower:User)
    OPTIONAL MATCH (u)<-[f:FOLLOWS]-(currentUser:User {id: $currentUser})
    RETURN u.id as id, 
    u.name as name, 
    u.username as username, 
    u.email as email,
     u.profile_pic as profile_pic, 
     u.cover as cover,
    u.bio as bio,
    u.location as location,
    u.website as website,
     u.created_at as created_at,
    COUNT(DISTINCT following) as following_count,
    COUNT(DISTINCT follower) as followers_count,
    CASE 
      WHEN f IS NOT NULL THEN 1
      ELSE 0
      END
      AS is_followed,
      CASE
        WHEN b IS NOT NULL THEN 1
        ELSE 0
      END as is_blocked
    `,
    { targetUser, currentUser }
  );

  console.log("targetUser", targetUser, "currentUser", currentUser);
  // if (!result.records.length) {
  //   throw new Error("User not found");
  // }
  const user = result.records.map((record) => record.toObject())[0];
  console.log(user);  
  return user;

};

const allFollowers = async (userId) => {

    const session = getDriver().session();
    const result = await session.run(
      `MATCH (u:User {id: $userId})<-[:follows]-(f:User)
      RETURN {
        id: f.id,
        name: f.name,
        username: f.username,
        email: f.email,
        profile_pic: f.profile_pic,
        created_at: f.created_at
      } as follower
      `,
      { userId: userId }
    );
    const followers = result.records.map((record) => record.toObject().follower);
    return followers;
  };

module.exports = {  
    allFollowers,
    getUserFullDetails
}