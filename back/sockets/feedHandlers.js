// should rename to navHandlers
module.exports = (io , socket) => {
    socket.on('feed:notify-create-post', (data) => {
        console.log('feed:notify-create-post', data?.user.id)
        // notify all users except the user who created the post -- still buggy
        io.except(data?.user?.id ?? 0).except(socket.id).emit('nav:notif:new',{
            category: 'home',
            value: 1
        })
    })
}
