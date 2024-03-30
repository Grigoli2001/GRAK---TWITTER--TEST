const jwt = require('jsonwebtoken');
const registerSocketMiddleware = ( io ) => {
  // register user
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(new Error(' Socket Authentication failed'));
    }

    socket.user = decoded.user;
    next();
  });
});
}
module.exports = { registerSocketMiddleware }

