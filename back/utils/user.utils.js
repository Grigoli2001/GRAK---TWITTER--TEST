const { getDriver } = require("../database/neo4j_setup");

  // const user = await pool.query(
  //   `SELECT u.id, name, username, email, profile_pic, u.created_at,
  //   COUNT(DISTINCT f1.following) AS following_count,
  //   COUNT(DISTINCT f2.user_id) AS followers_count,
  //   CASE 
  //     WHEN u.id IN (SELECT following from follows where user_id= $1) 
  //     THEN 1 
  //     ELSE 0 
  //     END 
  //     AS is_followed
  //   FROM 
  //       users u
  //   LEFT JOIN 
  //       follows f1 ON u.id = f1.user_id
  //   LEFT JOIN 
  //       follows f2 ON u.id = f2.following
  //   WHERE u.id = $1
  //   GROUP BY 
  //       u.id  `,
  //   [currentUIDasInt]
  // );

  // if (!user.rowCount) {
  //   throw new Error("User not found");
  // }
  // return user.rows[0];
const getUserFullDetails = async (currentUser, fetch_how) => {

  if (fetch_how !== "id" && fetch_how !== "username") {
    throw new Error("Invalid fetch_how: should be id or username");
  }

  console.log("currentUser", currentUser, fetch_how)

  const session = getDriver().session();
  const result = await session.run(
    `MATCH (u:User {${fetch_how}: $currentUser})
    OPTIONAL MATCH (u)-[f1:FOLLOWS]->(following:User)
    OPTIONAL MATCH (u)<-[f2:FOLLOWS]-(follower:User)
    RETURN u.id as id, u.name as name, u.username as username, u.email as email, u.profile_pic as profile_pic, u.created_at as created_at,
    COUNT(DISTINCT following) as following_count,
    COUNT(DISTINCT follower) as followers_count,
    CASE 
      WHEN u.id IN [(f1.following).id]
      THEN 1 
      ELSE 0 
      END 
      AS is_followed
    `,
    { currentUser }
  );
  if (!result.records.length) {
    throw new Error("User not found");
  }
  const user = result.records.map((record) => record.toObject())[0];
  console.log("user in getUserFull", user) 
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