const messageModel = require('../models/messageModel');
const statusCode = require('../constants/statusCode');
const pool = require("../database/db_setup");
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
        // console.log(msg_id, req.body)

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


  

    try {

      const { q } = req.query
        // get any message where the current user is the send er or receiver and the message is not deleted
        const activeChatsQuery = await messageModel.aggregate([
            {
              '$match': {
                '$or': [
                  {
                    'sender_id': req.user.id
                  }, {
                    'receiver_id': req.user.id
                  }
                ], 
                'is_deleted_for': {
                  '$nin': [
                    req.user.id
                  ],
                }
              }
            }, {
              '$sort': {
                'date': -1
              }
            }, {
              '$group': {
                '_id': 1, 
                'combined_ids': {
                  '$addToSet': {
                    '$cond': {
                      'if': {
                        '$eq': [
                          '$sender_id', req.user.id
                        ]
                      }, 
                      'then': '$receiver_id', 
                      'else': '$sender_id'
                    }
                  }
                }
              }
            }, {
              '$project': {
                '_id': 0, 
                'combined_ids': 1
              }
            }
          ])

        
        if (activeChatsQuery?.length<=0) {
            return res.status(statusCode.success).json({ users: [] })
        }

        console.log(activeChatsQuery[0].combined_ids)

        // user array order to match the combined_ids array which has the is sorted by latest date
        const userData = await pool.query(
          `SELECT id, username, name, profile_pic 
           FROM users 
           WHERE id = ANY($1)
           AND username like $2
           ORDER BY ARRAY_POSITION($1, id) 
           LIMIT 10`,
          [activeChatsQuery[0].combined_ids, q ? `%${q}%` : '%']
      )


        res.status(statusCode.success).json({ users: userData.rows })
    }catch (err) {
        console.log(error)
        res.status(statusCode.badRequest).json({
            message: err
        })
    }

}

module.exports = {
    getAllMessages,
    deleteMessage, 
    deleteRoom,
    getActiveChats
}