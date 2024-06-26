const statusCodes = require("../constants/statusCode");
const logger = require("../middleware/winston");
const pool = require("../database/db_setup");
// const jwt = require("jsonwebtoken");
const tweetModel = require("../models/tweetModel");
const { post } = require("../routes/auth.routes");
// const { allFollowers } = require("../utils/tweet.utils");



const getUserSimple = async (req, res) => {

  try{

  const { id, username } = req.query;
  if (id) {
    return getUserById(req, res);
  } else if (username) {
    const user = await pool.query(`SELECT id, name, username, email, dob, profile_pic, created_at, cover FROM users WHERE username = $1`, [username]);
    if (!user.rowCount) {
      return res.status(statusCodes.notFound).json({ message: "User not found" });
    }
    res.status(statusCodes.success).json({ user: user.rows[0] });

  } else {
    res.status(statusCodes.badRequest).json({ message: "Missing fields" });
  }
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching user" });
  };
}

const getUsers = async (req, res) => {
  const { q } = req.query;

  try {
    let qformat = `%${q.trim()}%`;

    const users = await pool.query(`
    SELECT id, name, username, email, profile_pic, created_at 
    FROM users 
    WHERE (username LIKE $1 OR name LIKE $2)
    AND id != $3
    LIMIT 6 `, [qformat, qformat, req.user.id]);

    if (!users?.rowCount) {
      return res.status(statusCodes.notFound).json({ message: "No users found" });
    }
    res.status(statusCodes.success).json({ users: users.rows });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching users" });
  }
}


const getUserById = async (req, res) => {
  try {
    const { id } = req.query;
    const user = await pool.query(`SELECT id, name, username, email, profile_pic, created_at, bio, website, location, cover, dob FROM users WHERE id = $1`, [id]);

    if (!user.rowCount) {
      return res.status(statusCodes.notFound).json({ message: "User not found" });
    }
    res.status(statusCodes.success).json({ user: user.rows[0] });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching user" });
  }
}

const getUserByUsername = async (req, res) => {
  const { username } = req.params; 

  try {

    if (!username) {
      return res.status(statusCodes.badRequest).json({
        message: 'username required'
      })
    }

    const userData = await pool.query(`
    SELECT u.id, name, username, email, profile_pic, u.created_at, cover, website, location, bio, dob,
    COUNT(DISTINCT f1.following) AS following_count,
    COUNT(DISTINCT f2.user_id) AS followers_count,
    CASE 
      WHEN u.id IN (SELECT following from follows where user_id= $1) 
      THEN 1 
      ELSE 0 
      END 
      AS is_followed
    FROM 
        users u
    LEFT JOIN 
        follows f1 ON u.id = f1.user_id
    LEFT JOIN 
        follows f2 ON u.id = f2.following
    WHERE u.username = $2
    GROUP BY 
        u.id  
    `, [req.user.id, username]);

    
    if (!userData?.rowCount) {
        return res.status(statusCodes.notFound).json({ message: "User not found" });
    }

    console.log(userData.rows[0], 'userData')

    let user = userData.rows[0];
    let postcount = await tweetModel.countDocuments({ userId: user.id,  $or: [
      { is_deleted: false }, 
      { is_deleted: { $exists: false } }
  ]});
  user.post_count = postcount;
  res.status(statusCodes.success).json({ user });

  } catch (err) {
    console.log(err)
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error user by username" });
  }
};

const getExploreUsers = async (req, res) => {
  
  try {
    const { limit, page } = req.query
    const exploreUsers = await pool.query(
      `SELECT 
        u.id, username, bio, profile_pic,name,
        COUNT(DISTINCT f1.following) AS following_count,
        COUNT(DISTINCT f2.user_id) AS followers_count,
        0 as is_followed
      FROM 
          users u
      LEFT JOIN 
          follows f1 ON u.id = f1.user_id
      LEFT JOIN 
          follows f2 ON u.id = f2.following
      WHERE u.id != $1
      AND u.id NOT IN (SELECT following from follows where user_id= $1)
      GROUP BY 
          u.id
      ORDER BY RANDOM()
      LIMIT $2`,
      [req.user.id, limit ?? 3]
    );
    res.status(statusCodes.success).json({ users: exploreUsers.rows });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error fetching non-followed users" });
  }
}

const updateUser = async (req, res) => {
  // const { profile_pic } = req.file 
  console.log(req.body, 'req.body')
  const { name, username, bio, location, website, profile_pic, cover, dob } = req.body;
 
  // if (!id || !name || !username || !bio || !location || !website || !profile_pic || !dob) {
  //   return res.status(statusCodes.badRequest).json({ message: "Missing fields" });
  // }

  if ( !dob || !username) {
    return res.status(statusCodes.badRequest).json({ message: "Missing fields must provide at lease dob and username" });
  }

  if (username.length < 3 || username.length > 50 || username.includes(' ') ) return res.status(statusCodes.badRequest).json({ message: "Invalid username" });
  if (name && (name.length < 3 || name.length > 50)) return res.status(statusCodes.badRequest).json({ message: "Invalid name" });
  if (bio && bio?.length > 150 ) return res.status(statusCodes.badRequest).json({ message: "Invalid bio" });
  if (location && location?.length > 50 ) return res.status(statusCodes.badRequest).json({ message: "Invalid location" });
  if (website && website.length > 50 ) return res.status(statusCodes.badRequest).json({ message: "Invalid website" });
  if (!new Date(dob)) return res.status(statusCodes.badRequest).json({ message: "Invalid dob"})
  
  // firebase should be done here...
  try {
    const user = await pool.query(
      `UPDATE users SET name = $1, username = $2, bio = $3, location = $4, profile_pic = $5, website = $6, cover = $7, dob = $8 WHERE id = $9`,
      [ name, username, bio, location, profile_pic, website, cover, dob, req.user.id,]
    );
    res.status(statusCodes.success).json({ message: "User updated" });
  } catch (err) {
    logger.error(err);
    res.status(statusCodes.queryError).json({ message: "Error updating user" });
  }
}

const getFollowData = async (req, res) => {


  try {
      const { userId, followType, verified, limit, page } = req.query;
      console.log(req.query, 'query')
      if (!userId || !followType || (followType !== 'followers' && followType !== 'following')) {
          throw new Error('Missing fields or invalid followType');
      }

      const pageSize = parseInt(page) ??  0;
      const resolveLimit = parseInt(limit) ?? 20;
      const toSkip = pageSize * resolveLimit;
      const resolveVerified = verified === 'true' ? 'AND users.verified = true' : '';


      const query = `
      SELECT f1.user_id, users.id, username, name, profile_pic,
      COUNT(DISTINCT f2.user_id) AS followers_count,
      COUNT(DISTINCT f1.following) AS following_count,
      CASE WHEN users.id IN (SELECT following from follows where user_id= $1) THEN 1 ELSE 0 END as is_followed
      FROM follows f1
      JOIN users 
      ON f1.${followType === 'following' ? 'following' : 'user_id'} = users.id
      FULL OUTER JOIN follows f2 ON f1.${followType === 'following' ? 'following' : 'user_id'} = f2.${followType === 'following' ? 'user_id' : 'following'}
      WHERE f1.${followType === 'following' ? 'user_id' : 'following'} = $1
      ${resolveVerified}
      GROUP BY f1.user_id, users.id, username, name, profile_pic
      ORDER BY users.username
      OFFSET $2 ROWS FETCH NEXT $3 ROWS ONLY
      `
      ;
      const follow_data = await pool.query(
          query,
          [userId, toSkip, resolveLimit] // default limit is 20 
      );
      res.status(statusCodes.success).json({users: follow_data.rows});
      } catch (error) {
          console.log(error)
      res.status(statusCodes.queryError).json({ message: 'An error occurred' });
  }
}



const addFollower = async (req, res) => {
    const { followerId } = req.body;
    console.log(followerId, req.body, 'followerId')
      try {

        if ( !followerId) {
          return res.status(statusCodes.badRequest).json({ message: "Missing fields" });
        } 
        await pool.query(
          `INSERT INTO follows(user_id, following) VALUES ($1, $2)`,
          [req.user.id, followerId]
       );
        res.status(statusCodes.success).json({ message: "Follower added" });
        } catch (error) {
        logger.error("Error adding follower", error);
        res.status(statusCodes.queryError).json({ message: "Error" });
      } 
}

const removeFollower = async (req, res) => {
    const { followerId } = req.body;
   
        try { 
          if (!followerId) {
          return res.status(statusCodes.badRequest).json({ message: "Missing follow id" });
      } 
        await pool.query(
            `DELETE FROM follows WHERE user_id = $1 AND following = $2`,
            [req.user.id, followerId]
        );
        res.status(statusCodes.success).json({ message: "Follower removed" });
        } catch (error) {
        logger.error("Error removing follower", error);
        res.status(statusCodes.queryError).json({ message: "Error" });
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
    getFollowData
    // getAllFollowers,
    // getAllFollowing,
};

