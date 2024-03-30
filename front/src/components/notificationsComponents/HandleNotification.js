import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/socketContext";
import useUserContext from "../../hooks/useUserContext";
import { joinRoom, leaveRoom } from "../../utils/socketUtils";
import { createToast } from "../../hooks/createToast";

const handleNotificationCreated = (socket, user) => {
  socket.on("notification:created", (data) => {
    console.log("notification neeew", data);
    if (user && user.id && data?.userId !== user.id) {
      createToast("New Notification", "success");
    }
  });
};

export const HandleNotification = ({ NotificationType }) => {
  const { user } = useUserContext();
  const { socket } = useContext(SocketContext);
  let isMounted = true;

  useEffect(() => {
    if (!user || user.id == null) {
      return;
    }
    joinRoom(socket, user.id);

    handleNotificationCreated(socket, user);

    return () => {
      isMounted = false;
      leaveRoom(socket, user.id);
      socket.off("notification:created");
    };
  }, [socket, user?.id]);

  return null;
};
