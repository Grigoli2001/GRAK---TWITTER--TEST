const Message = require("../models/messageModel");
const { registerSocketMiddleware } = require("./socket-middleware");
module.exports = (io, socket) => {
  registerSocketMiddleware(io);

  // joining room
  socket.on("message:join_room", (data) => {
    console.log("message:joining room", data);
    socket.join(data.room);
    console.log("MEMBERS: ", io.sockets.adapter.rooms.get(data.room));
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
      if (message.length > 1000) {
        throw new Error("Message too long");
      }
      const newMessage = new Message({
        sender_id,
        receiver_id,
        room_id: data.room,
        message,
        date,
        is_read: false,
      });
      // DID NOT IMPLEMENT SENDING IMAGE

      await newMessage.save();
      // ideally get username from db instead of socket
      data._id = newMessage._id;
      // use io instead of socket to also send to sender for _id for deletion and checking last message
      io.to(data.room).emit("message:received_message", data);

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
      io.to(socket.id).emit("message:error_send_message", error);
    }
  });

  // typing
  socket.on("message:typing", (data) => {
    // console.log('typing', data)
    socket.to(data.room).emit("message:typing", data);
  });
};
