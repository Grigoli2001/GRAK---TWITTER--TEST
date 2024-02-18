export const joinRoom = (socket, roomId) => {
  socket.emit("joinRoom", roomId);
};

export const leaveRoom = (socket, roomId) => {
  socket.emit("leaveRoom", roomId);
};
