const statusCodes = require("../constants/statusCode");
const { getDriver } = require("../database/neo4j_setup");
const logger = require("../middleware/winston");
// const jwt = require("jsonwebtoken");
var neo4j = require("neo4j-driver");
const tweetModel = require("../models/tweetModel");
const { getUserFullDetails } = require("../utils/user.utils");
const { firebaseUpload, validateFiles } = require("../utils/firebase.utils");

const getUserSimple = async (req, res) => {
  try {
    const { id, username } = req.query;
    if (id) {
      return getUserById(req, res);
    } else if (username) {
      const session = getDriver().session();
      const result = await session.run(
        `MATCH (u:User) WHERE u.username = $username 
      RETURN {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        profile_pic: u.profile_pic,
        cover: u.cover,
        created_at: u.created_at,
        dob: u.dob,
        bio: u.bio,
        website: u.website,
        location: u.location
      } as u
      `,
        { username }
      );
      const user = result.records.map(
        (record) => record.get("u").properties
      )?.[0];
      if (!user) {
        return res
          .status(statusCodes.notFound)
          .json({ message: "User not found" });
      }

      return res.status(statusCodes.success).json({ user });
    } else {
      res.status(statusCodes.badRequest).json({ message: "Missing fields" });
    }
  } catch (err) {
    // logger.error(err);
    console.log(err);
    res
      .status(statusCodes.serverError)
      .json({ message: "Error fetching user" });
  }
};

const getUsers = async (req, res) => {
  const { q } = req.query;

  try {
    let qformat = q?.trim().toLowerCase() ?? "";

    const session = getDriver().session();
    const result = await session.run(
      `MATCH (u:User) 
      WHERE u.id <> $current_userid 
      AND NOT EXISTS((u)-[:BLOCKS]->({id: $current_userid}))
      AND  (u.username  CONTAINS $query_user OR u.name CONTAINS $query_user) 
      RETURN 
      {
        id: u.id, 
        name: u.name, 
        username: u.username, 
        email: u.email, 
        profile_pic: u.profile_pic, 
        created_at: u.created_at
        } as u
      ORDER BY u.username LIMIT 6`,
      { current_userid: req.user.id, query_user: qformat }
    );
    const users = result.records.map((record) => record.get("u"));
    return res.status(statusCodes.success).json({ users });
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res
      .status(statusCodes.serverError)
      .json({ message: "Error fetching users" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.query;

    const session = getDriver().session();
    const result = await session.run(
      `MATCH (u:User) WHERE u.id = $userid
      RETURN
      {
        id: u.id, 
        name: u.name, 
        username: u.username, 
        email: u.email, 
        profile_pic: u.profile_pic, 
        created_at: u.created_at, 
        bio: u.bio, 
        website: u.website, 
        location: u.location, 
        cover: u.cover, 
        dob: u.dob
      } as u
     `,
      { userid: id }
    );
    const user = result.records.map((record) => record.get("u"))?.[0];
    // console.log(user, 'user')
    if (!user) {
      return res
        .status(statusCodes.notFound)
        .json({ message: "User not found" });
    }
    return res.status(statusCodes.success).json({ user });
  } catch (err) {
    console.log(err);
    logger.error(err);
    res
      .status(statusCodes.serverError)
      .json({ message: "Error fetching user" });
  }
};

const getUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(statusCodes.badRequest).json({
        message: "username required",
      });
    }

    const user = await getUserFullDetails(username, req.user.id, "username");
    if (!user) {
      return res
        .status(statusCodes.notFound)
        .json({ message: "User not found" });
    }
    
        let postcount = await tweetModel.countDocuments({ userId: user.id,  $or: [
          { is_deleted: false }, 
          { is_deleted: { $exists: false } }
      ]});
      user.post_count = postcount;
      return res.status(statusCodes.success).json({ user });

  } catch (err) {
    console.log(err);
    logger.error(err);
    return res
      .status(statusCodes.serverError)
      .json({ message: "Error user by username" });
  }
};

const getExploreUsers = async (req, res) => {
  // gets users that are not followed by the user with their followers and following count
  // does not return is followed as they are already not followed
  try {
    const { limit, page } = req.query;
    const session = getDriver().session();

    const intLimit = parseInt(limit) ?? 3;
    const intPage = parseInt(page) ?? 0;
    const intSkip = intPage * intLimit;

    const result = await session.run(
      `MATCH (u:User) WHERE u.id <> $userid AND NOT (u)<-[:FOLLOWS]-(:User {id: $userid})  AND NOT EXISTS((u)<-[:BLOCKS]->({id: $userid}))
      OPTIONAL MATCH (u)-[:FOLLOWS]->(f:User)
      OPTIONAL MATCH (u)<-[:FOLLOWS]-(f2:User)
      RETURN 
      u.id as id,
      u.name as name,
      u.username as username,
      u.profile_pic as profile_pic,
      count(distinct f) as following_count, 
      count( distinct f2) as followers_count
      ORDER BY rand() SKIP $skip LIMIT $limit`,
      {
        userid: req.user.id,
        limit: neo4j.int(intLimit),
        skip: neo4j.int(intSkip),
      }
    );
    const users = result.records.map((record) => record.toObject());

    return res.status(statusCodes.success).json({ users });
  } catch (err) {
    // logger.error(err);
    console.log(err);
    res
      .status(statusCodes.serverError)
      .json({ message: "Error fetching non-followed users" });
  }
};

const updateUser = async (req, res) => {
  const { name, username, bio, location, website, profile_pic, cover, dob } =
    req.body;
  if (!dob || !username) {
    return res.status(statusCodes.badRequest).json({
      message: "Missing fields must provide at lease dob and username",
    });
  }

  if (username.length < 3 || username.length > 50 || username.includes(" "))
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Invalid username" });
  if (name && (name.length < 3 || name.length > 50))
    return res.status(statusCodes.badRequest).json({ message: "Invalid name" });
  if (bio && bio?.length > 150)
    return res.status(statusCodes.badRequest).json({ message: "Invalid bio" });
  if (location && location?.length > 50)
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Invalid location" });
  if (website && website.length > 50)
    return res
      .status(statusCodes.badRequest)
      .json({ message: "Invalid website" });

  let formatDob = JSON.parse(dob);
  console.log(formatDob, "formatDob");
  if (!formatDob || !formatDob.year || !formatDob.month || !formatDob.day)
    return res.status(statusCodes.badRequest).json({ message: "Invalid dob" });

  await validateFiles(req.files);
  let { media: firebaseProfilePic } = await firebaseUpload(
    req.files.profile_pic?.[0],
    req.user.id,
    "profile_pic"
  );
  let { media: firebaseCover } = await firebaseUpload(
    req.files.cover?.[0],
    req.user.id,
    "cover"
  );
  if (cover === "default") firebaseCover = "";

  try {
    formatDob.year = neo4j.int(formatDob.year);
    formatDob.month = neo4j.int(formatDob.month);
    formatDob.day = neo4j.int(formatDob.day);

    var buildquery = `
      MATCH (u:User {id: $userid})
      SET u.name = $name,
      u.username = $username,
      u.dob = date({
      year: $formatDob.year,
      month: $formatDob.month,
      day: $formatDob.day
    }),
    `;
    const queryParams = {
      userid: req.user.id,
      name,
      username,
      formatDob,
    };
    if (bio) {
      buildquery += `u.bio = $bio,`;
      queryParams.bio = bio;
    }
    if (location) {
      buildquery += `u.location = $location,`;
      queryParams.location = location;
    }
    if (website) {
      buildquery += `u.website = $website,`;
      queryParams.website = website;
    }
    if (firebaseProfilePic) {
      buildquery += `u.profile_pic = $profile_pic,`;
      queryParams.profile_pic = firebaseProfilePic;
    }
    if (firebaseCover !== null && firebaseCover !== undefined) {
      buildquery += `u.cover = $cover,`;
      queryParams.cover = firebaseCover;
    }
    buildquery = buildquery.trim().replace(/,+$/, ""); // remove trailing comma
    buildquery += ` RETURN u`;

    console.log(buildquery, "buildquery");
    console.log(queryParams, "queryParams");

    const session = getDriver().session();
    const result = await session.run(buildquery, queryParams);
    return res.status(statusCodes.success).json({ message: "User updated" });
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res
      .status(statusCodes.serverError)
      .json({ message: "Error updating user" });
  }
};

const getFollowData = async (req, res) => {
  // returns a list of users that a user follows or that follow a user with
  try {
    const { userId, followType, verified, limit, page } = req.query;
    if (
      !userId ||
      !followType ||
      (followType !== "followers" && followType !== "following")
    ) {
      throw new Error("Missing fields or invalid followType");
    }

    const pageSize = parseInt(page) ?? 0;
    const resolveLimit = parseInt(limit) ?? 20;
    const toSkip = pageSize * resolveLimit;
    const resolveVerified =
      verified === "true" ? "WHERE u.verified = true" : "";
    const resolveFollowType =
      followType === "followers" ? "<-[:FOLLOWS]-" : "-[:FOLLOWS]->";

    const session = getDriver().session();
    const result = await session.run(
      `MATCH (u:User {id: $userId})${resolveFollowType}(f:User)
       ${resolveVerified} 
       OPTIONAL MATCH (f)-[:FOLLOWS]->(following:User) 
       WITH f, count(following) as followingCount
       OPTIONAL MATCH (f)<-[:FOLLOWS]-(followers:User)
       WITH f, followingCount, count(followers) as followersCount
       OPTIONAL MATCH (f)<-[:FOLLOWS]-(is_followed_check:User {id: $userId})
       RETURN f {.*, followingCount: followingCount, followersCount: followersCount, is_followed: CASE WHEN is_followed_check IS NOT NULL THEN 1 ELSE 0 END}
       SKIP $toSkip
       LIMIT $resolveLimit`,
      {
        userId,
        toSkip: neo4j.int(toSkip),
        resolveLimit: neo4j.int(resolveLimit),
      }
    );

    const follow_data = result.records.map((record) => record.get(0));

    return res.status(statusCodes.success).json({ users: follow_data });
  } catch (error) {
    console.log(error);
    return res
      .status(statusCodes.serverError)
      .json({ message: "An error occurred" });
  }
};

const addFollower = async (req, res) => {
  const { otherUserId } = req.body;
  try {
    if (!otherUserId) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Missing fields" });
    }

    const session = getDriver().session();
    await session.run(
      `MATCH (u:User {id: $userid}), (f:User {id: $otherUserId}) MERGE (u)-[:FOLLOWS]->(f)`,
      { userid: req.user.id, otherUserId }
    );

    res.status(statusCodes.success).json({ message: "Follower added" });
  } catch (error) {
    logger.error("Error adding follower", error);
    res.status(statusCodes.serverError).json({ message: "Error" });
  }
};

const removeFollower = async (req, res) => {
  const { otherUserId } = req.body;

  try {
    if (!otherUserId) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Missing follow id" });
    }
    const session = getDriver().session();
    await session.run(
      `MATCH (u:User {id: $1})-[r:FOLLOWS]->(f:User {id: $2}) DELETE r`,
      { 1: req.user.id, 2: otherUserId }
    );
    res.status(statusCodes.success).json({ message: "Follower removed" });
  } catch (error) {
    logger.error("Error removing follower", error);
    res.status(statusCodes.serverError).json({ message: "Error" });
  }
};

const setPostNotification = async (req, res) => {
  const { otherUserId } = req.body;
  try {
    if (!otherUserId) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Missing fields" });
    }
    const session = getDriver().session();
    await session.run(
      `MATCH (u:User {id: $currentUser}), (f:User {id: $otherUser}) MERGE (u)-[:NOTIFIES]->(f)`,
      { currentUser: req.user.id, otherUser: otherUserId }
    );
    res.status(statusCodes.success).json({ message: "Notification set" });
  } catch (error) {
    logger.error("Error setting post notification", error);
    res
      .status(statusCodes.serverError)
      .json({ message: "Error setting post notification" });
  }
};

const removePostNotification = async (req, res) => {
  const { otherUserId } = req.body;
  console.log(otherUserId, "otherUserId");
  try {
    if (!otherUserId) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Missing fields" });
    }
    const session = getDriver().session();
    await session.run(
      `MATCH (u:User {id: $currentUser})-[r:NOTIFIES]->(f:User {id: $otherUser}) DELETE r`,
      { currentUser: req.user.id, otherUser: otherUserId }
    );
    res.status(statusCodes.success).json({ message: "Notification removed" });
  } catch (error) {
    logger.error("Error removing post notification", error);
    res
      .status(statusCodes.serverError)
      .json({ message: "Error removing post notification" });
  }
};

const blockUser = async (req, res) => {
  const { otherUserId } = req.body;
  try {
    if (!otherUserId) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Missing fields" });
    }
    if (otherUserId === req.user.id) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Cannot block self" });
    }

    const session = getDriver().session();
    await session.run(
      `MATCH (u:User {id: $currentUser}), (f:User {id: $blockedUser}) MERGE (u)-[:BLOCKS]->(f)
      with u, f
      OPTIONAL MATCH (u)-[brel:FOLLOWS]-(f)
      DELETE brel`,
      {currentUser: req.user.id, blockedUser: otherUserId}
    );
    res.status(statusCodes.success).json({ message: "User blocked" });
  } catch (error) {
    logger.error("Error blocking user", error);
    res
      .status(statusCodes.serverError)
      .json({ message: "Error blocking user" });
  }
};

const unblockUser = async (req, res) => {
  const { otherUserId } = req.body;
  try {
    if (!otherUserId) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Missing fields" });
    }
    if (otherUserId === req.user.id) {
      return res
        .status(statusCodes.badRequest)
        .json({ message: "Cannot block self" });
    }

    const session = getDriver().session();
    await session.run(
      `MATCH (u:User {id: $currentUser})-[r:BLOCKS]->(f:User {id: $blockedUser}) DELETE r`,
      { currentUser: req.user.id, blockedUser: otherUserId }
    );
    res.status(statusCodes.success).json({ message: "User unblocked" });
  } catch (error) {
    logger.error("Error unblocking user", error);
    res.status(statusCodes.serverError).json({ message: "Error unblocking user" });
  }
}

module.exports = {
    getUsers,
    getUserSimple,
    getUserByUsername,
    getExploreUsers,
    updateUser,
    addFollower,
    removeFollower,
    getFollowData,
    setPostNotification, 
    removePostNotification,
    blockUser,
    unblockUser, 
};
