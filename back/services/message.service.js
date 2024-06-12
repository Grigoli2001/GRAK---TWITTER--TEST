const messageModel = require('../models/messageModel');
const statusCode = require('../constants/statusCode');
const { redisClient } = require('../database/redis_setup');
const mongoose = require('mongoose');
const { getDriver } = require('../database/neo4j_setup');

const MESSAGE_PAGE_SIZE = 20;

const getAllMessages = async (req, res) => {

    let messages = [];
    try {
        let skip = req.query.page ? parseInt(req.query.page) : 0;
        let totalToSkip = skip * MESSAGE_PAGE_SIZE


        // fisrt check redis
        // TODO: filter out deleted messages
        messages = await redisClient.zRange(req.params.room, totalToSkip, totalToSkip + MESSAGE_PAGE_SIZE, {"REV": true})
        // get size of messages
       
        messages = messages.map(msg => JSON.parse(msg))

        if (messages.length < MESSAGE_PAGE_SIZE) {
            remaining = MESSAGE_PAGE_SIZE - messages.length
         
            mongoskip = Math.floor(totalToSkip / MESSAGE_PAGE_SIZE) * MESSAGE_PAGE_SIZE
            // console.log('remaining', remaining, 'mongoskip', mongoskip)
            // get from db
            
            persistedMessages = await messageModel.find({ 
                room_id: req.params.room, 
                is_deleted_for: { $nin: [req.user.id] }, 
                is_room_deleted_for: { $nin: [req.user.id] }
            })
            .sort({ date: -1 })
            .skip(mongoskip)
            .limit(remaining)

            messages = [...messages, ...persistedMessages]

        }

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
        console.log('msg_id', msg_id)

        if (!msg_id) {
            return res.status(statusCode.badRequest).json({
                message: 'msg_id is required'
            })
        }

        pos = msg_id.lastIndexOf(':')
        let room = msg_id.substring(0, pos)
        console.log('room', room)
        if (!room || !room.startsWith('message-room:')) {
          console.log('Invalid message id (room)') 
            return res.status(statusCode.badRequest).json({
                message: 'Invalid message id (room)'
            })
        }

        let score = msg_id.split(':')[2] // should be in format message-room:<room>:<score>
        console.log('score', score, /^\d+$/.test(score))
        if (!score || !/^\d+$/.test(score)) {
          console.log('Invalid message id (score)') 
            return res.status(statusCode.badRequest).json({
                message: 'Invalid message id (score)'
            })
        }

        score = parseInt(score)

        let messageToDelete = await redisClient.zRangeByScore(room, score, score)

        if (messageToDelete && messageToDelete.length > 0) {
          messageToDelete = messageToDelete.map(msg => JSON.parse(msg)) 
          messageToDelete = messageToDelete[0]

          if (!messageToDelete.is_deleted_for) { // should be an array
            messageToDelete.is_deleted_for = [req.user.id]
          }else{
            // psuh only if not already in the array
            if (!messageToDelete.is_deleted_for.includes(req.user.id)) {
              messageToDelete.is_deleted_for.push(req.user.id)
            }

            // replace message with updated message instead of full delete
            const delResp = await redisClient.zRemRangeByScore(room, score, score)
            if (delResp === 0) {
              return res.status(statusCode.notModified).send()
            }

            const resp = await redisClient.zAdd(room, [{score: score, value: JSON.stringify(messageToDelete)}])
            if (resp === 0) {
              return res.status(statusCode.notModified).send()
            }
          }
          return res.status(statusCode.success).send({ message: 'Message deleted for you!'})
        }

        // otherwise delete from mongo
        deleted = await messageModel.updateOne({message_id: msg_id}, {$addToSet: {is_deleted_for: req.user.id}})
       
       if (deleted.modifiedCount === 0){
        return res.status(statusCode.notModified).send()
       }else{
        // console.log('sending success')
        return res.status(statusCode.success).send({ message: 'Message deleted for you!'})
       }

    }catch(err) {
        console.log(err)
        return res.status(statusCode.serverError).json({
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

        const session = await mongoose.startSession()
        await session.withTransaction(async () => {

        // check if redis has the room
        const roomExists = await redisClient.exists(room_id)
        if (roomExists) {
          // persist to mongo as is_deleted_for
          const messages = await redisClient.zRange(room_id, 0, -1)
          const messageObjects = messages.map(msg => JSON.parse(msg)).map(msg => {
            if (!msg.is_deleted_for) {
              msg.is_deleted_for = [req.user.id]
            }
            else if (!msg.is_deleted_for.includes(req.user.id)) {
              msg.is_deleted_for.push(req.user.id)
            }
            return msg
          }
          )
          await messageModel.insertMany(messageObjects, {session})
          await redisClient.del(room_id)
        }

       const deleted = await messageModel.updateMany({
                    room_id: room_id,
                    date: { $lt: new Date() } 
                }, 
                {
                    $addToSet: {is_deleted_for: req.user.id}
                }
                , {session}
        )
    
       if (deleted.modifiedCount > 0 || roomExists){
        res.status(statusCode.success).send()
       }else{
        console.log('not modified')
        res.status(statusCode.notModified).send()
       }
    })

    }catch(err) {
      console.log(err)
        res.status(statusCode.badRequest).json({
            message:err
        })
    }
}

const getActiveChats = async (req, res) => {
    try {


      let checkRedis1 = await redisClient.keys(`message-room:*-${req.user.id}`)
      let checkRedis2 = await redisClient.keys(`message-room:${req.user.id}-*`)

      keys = [...checkRedis1, ...checkRedis2]

      const roomsExcluded = req.excludedUsers.flatMap(user => [
        `message-room:${req.user.id}-${user}`,
        `message-room:${user}-${req.user.id}`
      ]);

      filteredKeys =  keys.filter(key => !new Set(roomsExcluded).has(key))
      console.log("KEYS", keys, "Excluded", roomsExcluded, 'filteredKeys', filteredKeys) 


      let userIds = [];
      if (filteredKeys.length > 0) {
        filteredKeys = filteredKeys.map(key => key.split(':')[1])
        userIds = filteredKeys.map(key => key.split('-')).map(key => key[0] === req.user.id ? key[1] : key[0])
      }

        // get any message where the current user is the send er or receiver and the message is not deleted
        const activeChatsQuery = await messageModel.aggregate([
            {
              $match: {
                $or: [
                  {
                    'sender_id': req.user.id
                  }, {
                    'receiver_id': req.user.id
                  }
                ], 
                is_deleted_for: {
                  $nin: [
                    req.user.id
                  ]
                },
                room_id: { $nin: roomsExcluded }
              }
            }, {
              $sort: {
                'date': -1
              }
            }, {
              $group: {
                _id: 1, 
                combined_ids: {
                  $addToSet: {
                    $cond: {
                      if: {
                        $eq: [
                          '$sender_id', req.user.id
                        ]
                      }, 
                      then: '$receiver_id', 
                      else: '$sender_id'
                    }
                  }
                }
              }
            }, {
              $project: {
                _id: 0, 
                combined_ids: {
                  $setDifference: ['$combined_ids', userIds]
                }
              }
            }
          ])


        if (activeChatsQuery.length > 0) {
        userIds = [...filteredKeys, ...activeChatsQuery[0].combined_ids]
        }

        console.log("FINAL USERIDS", userIds)
        const session = getDriver().session();
        const result = await session.run(
          `MATCH (u:User) WHERE u.id <> $current_userid AND u.id IN $userIds
          RETURN 
          {
            id: u.id, 
            name: u.name, 
            username: u.username, 
            email: u.email, 
            profile_pic: u.profile_pic, 
            created_at: u.created_at
            } as u
          `,
          { current_userid: req.user.id, userIds}
        );

      const users = result.records.map(record => record.get('u'));
        // user array order to match the combined_ids array which has the is sorted by latest date
        res.status(statusCode.success).json({ users })
    }catch (err) {
        console.log(err)
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

