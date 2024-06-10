const Message = require("../models/messageModel");
const mongoose = require("mongoose");
const { registerSocketMiddleware } = require("./socket-middleware");
const { redisClient } = require('../database/redis_setup') 

const evalRoom = (user, otherUser) => {
  if (!user || !otherUser) return null
  return 'message-room:'+[ user, otherUser ].sort().join('-')
}

const LIMIT = 50
const maxPeriod = 20 * 60  * 1000 // 20 minutes


module.exports = (io, socket) => {
  registerSocketMiddleware(io);

  // joining room
  socket.on("message:join_room", async (data) => {
    // console.log("message:joining room", data);
    socket.join(data.room);
    // console.log("MEMBERS: ", io.sockets.adapter.rooms.get(data.room));
  });

  // leaving room
  socket.on("message:leave_room", (room) => {
    // console.log('message:leaving room', room)
    socket.leave(room);
  });

  // sending message
  socket.on("message:send_message", async (data) => {
    try {
      const { sender_id, receiver_id, room, message, date, username } = data;
      if (
        !sender_id ||
        !receiver_id ||
        !room ||
        !message ||
        !date ||
        !username
      ) {
        throw new Error(
          "sender_id, receiver_id, room, message, date are required"
        );
      }
      const formattedMessage = message.trim();
      if (formattedMessage.length > 1000) {
        throw new Error("Message too long");
      }
        const messageData = {
          sender_id,
          receiver_id,
          room_id: evalRoom(sender_id, receiver_id), // redundant room eval
          message: formattedMessage,
          date: date,
          is_read: false,
      }

      let dateScore = new Date(data.date).getTime()
      messageData.message_id = room + ':' + dateScore
      let dataString = JSON.stringify(messageData)

      await redisClient.zAdd(messageData.room_id, [{score: dateScore, value: dataString}, ])
   
      // use io instead of socket to also send to sender for _id for deletion and checking last message
      io.to(data.room).emit("message:received_message", messageData);

      // emit notification to receiver which should connect to the room on login
      io.to(data.receiver_id).emit("nav:notif:new", {
        category: "messages",
        value: 1,
        username,
      });

      io.to(data.receiver_id).emit("notification:new", {
        userId: data.receiver_id,
        triggeredByUserId: sender_id,
        notificationType: "message",
      });

    } catch (error) {
      console.log("message:error_send_message", error);
      io.to(socket.id).emit("message:error_send_message", error.message);
    }
  });

  async function messageExpirationWorker() {
    let period = Date.now() - maxPeriod
    try {
        // Retrieve expired messages from Redis

        
        const expiredMessages = await redisClient.zRangeByScore('message-room:2-5', 0, period);

        if (expiredMessages.length > 0) {
        console.log('Expired messages:', expiredMessages, expiredMessages.length);
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {

          //   console.log('Expired messages:', expiredMessages);
            // persist messages to MongoDB
            let parsedMessages = expiredMessages.map(message => JSON.parse(message))
            await Message.insertMany(parsedMessages, { session });
            console.log('Messages saved to MongoDB:', expiredMessages);
            await redisClient.zRemRangeByScore('message-room:2-5', 0, period);

        })
      }

    } catch (error) {
        console.error('Error processing expired messages:', error);
    }
}

// handelr to delete message for everyone
socket.on('message:delete_message', async (data, callback) => {
   // update redis via score
        // get last index of : to get the score and room
      try {
        let { msg_id } = data
        if (!msg_id) {
          console.log('msg_id is required')
           throw new Error('msg_id is required')
        }
        pos = msg_id.lastIndexOf(':')
        let room = msg_id.substring(0, pos)
        console.log('room', room)
        if (!room || !room.startsWith('message-room:')) {
          console.log('Invalid message id (room)') 
            throw new Error('Invalid message id (room)')
        }

        let score = msg_id.split(':')[2] // should be in format message-room:<room>:<score>
        console.log('score', score, /^\d+$/.test(score))
        if (!score || !/^\d+$/.test(score)) {
          console.log('Invalid message id (score)') 
          throw new Error('Invalid message id (score)')
        }

        score = parseInt(score)

        console.log('room', room, 'score', typeof score) 
        let messageToDelete = await redisClient.zRangeByScore(room, score, score)

        if (messageToDelete && messageToDelete.length > 0) {
          messageToDelete = messageToDelete.map(msg => JSON.parse(msg)) 
          messageToDelete = messageToDelete[0]
          messageToDelete.message = 'This message was deleted'
          messageToDelete.is_deleted_for_everyone = true

            // remove from redis
          const delResp = await redisClient.zRemRangeByScore(room, score, score)
          console.log('delResp', delResp)
          const resp = await redisClient.zAdd(room, [{score: score, value: JSON.stringify(messageToDelete)}])
          console.log('resp', resp)
          }
          else {
            console.log('Message not found')
            throw new Error('Message not found')
          }
          io.to(data.room).emit('message:deleted_message', {msg_id})
          io.to(socket.id).emit('message:success_deleted_message', {msg_id})
        }
    catch (error) {
      io.to(socket.id).emit('message:error_deleted_message', error)
    }
})

// set work to expire messages
setInterval(messageExpirationWorker, 10 * 60 * 1000); // 10 minutes

  // typing
  socket.on("message:typing", (data) => {
    // console.log('typing', data)
    socket.to(data.room).emit("message:typing", data);
  });
};


   // const newMessage = new Message({
      //   sender_id,
      //   receiver_id,
      //   room_id: data.room,
      //   message,
      //   date,
      //   is_read: false,
      // });
      // DID NOT IMPLEMENT SENDING IMAGE

      // await newMessage.save();

      
      // ideally get username from db instead of socket
      // data._id = newMessage._id;