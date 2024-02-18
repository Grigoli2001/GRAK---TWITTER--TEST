const { Server } = require("socket.io");
const { createServer } = require("http");
const { registerSocketMiddleware } = require("./socket-middleware");

// event listeners
const registerMessageHandlers = require('./messageHandlers')
const registerPollHandlers = require('./pollHandlers')

const httpPort = 4000
const initSockets = (app) => {

  const http = createServer(app);

  const io = new Server(http, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }, 
  });

  // register with redis adapter
  // store messages in mongo db and implement fetch more on scroll up
  
  registerSocketMiddleware(io)

  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', (msg) => {
      console.log('user disconnected');
    });

    registerMessageHandlers(io, socket)
    registerPollHandlers(io, socket)

  });

  http.listen(httpPort, () => {
    console.log(`listening on ${httpPort}`);
  });

}

module.exports =  initSockets 

