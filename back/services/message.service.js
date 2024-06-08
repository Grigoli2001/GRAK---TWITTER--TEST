const messageModel = require('../models/messageModel');
const statusCode = require('../constants/statusCode');
const driver = require("../database/db_setup");
const { error } = require('winston');

const MESSAGE_PAGE_SIZE = 20;

const getAllMessages = async (req, res) => {

    try {
        let skip = req.query.page ? parseInt(req.query.page) : 0;
        const messages = await messageModel.find({ 
            room_id: req.params.room, 
            is_deleted_for: { $nin: [req.user.id] }, 
            is_room_deleted_for: { $nin: [req.user.id] }
        })
        .sort({ date: -1 })
        .skip(skip * MESSAGE_PAGE_SIZE)
        .limit(MESSAGE_PAGE_SIZE)
        res.status(statusCode.success).json({ messages })
    } catch (err) {
        console.log(err);
        res.status(statusCode.badRequest).json({
            message: err,
        });
    }
}

const deleteMessage = async (req, res) => {

    try {
        let { msg_id } = req.body

        if (!msg_id) {
            throw new Error('msg_id is required')
        }
    
       const deleted = await messageModel.updateOne({_id: msg_id}, {$addToSet: {is_deleted_for: req.user.id}})
       
       if (deleted.modifiedCount === 1){
        // console.log('sending success')
        return res.status(statusCode.success).send()
       }else{
        return res.status(statusCode.notModified).send()
       }

    }catch(err) {
        console.log(err)
        return res.status(statusCode.badRequest).json({
            message: err
        })
    }

}

const deleteRoom = async(req, res) => {
    try {
        let { room_id }= req.body

        if (!room_id) {
          console.log('room_id is required')
            throw new Error('room_id is required')
        }

       const deleted = await messageModel.updateMany({
                    room_id: room_id,
                    date: { $lt: new Date() } 
                }, 
                {
                    $addToSet: {is_deleted_for: req.user.id}
                }
        )
    
       if (deleted.modifiedCount > 0){
        res.status(statusCode.success).send()
       }else{
        console.log('not modified')
        res.status(statusCode.notModified).send()
       }

    }catch(err) {
      console.log(err)
        res.status(statusCode.badRequest).json({
            message:err
        })
    }
}

const getActiveChats = async (req, res) => {
  const session = driver.session();
  try {
    const { q } = req.query;
    const result = await session.run(
      `
      MATCH (m:Message)
      WHERE m.sender_id = $userId OR m.receiver_id = $userId
      AND NOT $userId IN m.is_deleted_for
      WITH m, 
      CASE 
        WHEN m.sender_id = $userId THEN m.receiver_id
        ELSE m.sender_id
      END AS otherUserId
      ORDER BY m.date DESC
      WITH COLLECT(DISTINCT otherUserId) AS combined_ids
      RETURN combined_ids
      `,
      { userId: req.user.id }
    );

    const combinedIds = result.records.length ? result.records[0].get('combined_ids') : [];

    if (combinedIds.length === 0) {
      return res.status(statusCode.success).json({ users: [] });
    }

    const userData = await session.run(
      `
      MATCH (u:User)
      WHERE u.id IN $combinedIds
      AND u.username CONTAINS $username
      RETURN u.id AS id, u.username AS username, u.name AS name, u.profile_pic AS profile_pic
      LIMIT 10
      `,
      { combinedIds, username: q ? `%${q}%` : '%' }
    );

    const users = userData.records.map(record => ({
      id: record.get('id'),
      username: record.get('username'),
      name: record.get('name'),
      profile_pic: record.get('profile_pic')
    }));

    res.status(statusCode.success).json({ users });
  } catch (error) {
    logger.error(error);
    res.status(statusCode.badRequest).json({ message: error });
  } finally {
    await session.close();
  }
};

module.exports = {
    getAllMessages,
    deleteMessage, 
    deleteRoom,
    getActiveChats
}