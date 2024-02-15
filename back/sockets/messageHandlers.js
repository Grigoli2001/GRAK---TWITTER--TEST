const Message = require('../models/messageModel')

module.exports = (io, socket) =>  {
    
    // joining room
    socket.on('message:join_room', (data) => {
        console.log('message:joining room', data)
        socket.join(data.room)
        console.log('MEMBERS: ', io.sockets.adapter.rooms.get(data.room))
    })

    // leaving room
    socket.on('message:leave_room', (room) => {
        console.log('message:leaving room', room)
        socket.leave(room)
    })

    // sending message
    socket.on('message:send_message', async (data) => {

        try {
            const newMessage = new Message({
                sender_id: data.sender_id,
                room_id: data.room,
                message: data.message,
                date: data.date,
                is_read: false
            })
            await newMessage.save()
            data._id = newMessage._id
            // use io instead of socket to also send to sender for _id for deletion and checking last message
            io.to(data.room).emit('message:received_message', data)

            // emit notification to receiver which should connect to the room on login
            io.to(data.receiver_id).emit('notification:new', { title: "Messages"})

        } catch (error) {
            console.log('message:error_send_message', error)
            io.to(socket.id).emit('message:error_send_message', error)
        }   
    })

    // typing
    socket.on('message:typing', (data) => {
    // console.log('typing', data)
        socket.to(data.room).emit('message:typing', data)
    })
  
}