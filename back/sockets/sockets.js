const { Server } = require("socket.io");
const { createServer } = require("http");
const { registerSocketMiddleware } = require("./socket-middleware");

// event listeners
const registerMessageHandlers = require("./messageHandlers");
const registerPollHandlers = require("./pollHandlers");
const registerNotificationHandlers = require("./notificationHandlers");
const registerFeedHandlers = require("./feedHandlers"); 

const httpPort = 4000;
const initSockets = (app) => {
  const http = createServer(app);

  const io = new Server(http, {
    cors: {
      origin: "http://localhost:3002",
      methods: ["GET", "POST"],
    },
  });

  // register with redis adapter
  // store messages in mongo db and implement fetch more on scroll up

  registerSocketMiddleware(io);

  io.on("connection", (socket) => {
    console.log("a user connected");

    // Join a room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Leave a room
    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
    });

    socket.on("disconnect", (msg) => {
      console.log("user disconnected");
    });

    registerMessageHandlers(io, socket);
    registerPollHandlers(io, socket);
    registerNotificationHandlers(io, socket);
    registerFeedHandlers(io, socket);
  });

  http.listen(httpPort, () => {
    console.log(`listening on ${httpPort}`);
  });
};

module.exports = initSockets;
