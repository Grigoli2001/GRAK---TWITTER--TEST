const registerSocketMiddleware = ( io ) => {
  // register user
io.use((socket, next) => {
    // some validation here
    next()
  })
  
  // register credentials
  io.use((socket, next) => {
    // some validation here
    // const token = socket.handshake.auth.token
    next()
  })
}
module.exports = { registerSocketMiddleware }

