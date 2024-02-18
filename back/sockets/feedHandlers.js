module.exports = (io , socket) => {
    // on post add to db and emit to all
    socket.on('feed:notify-create-post', (data) => {
        io.emit('notificiation:new',{
            title: 'Home',
            value: 1
        })
    })
}
