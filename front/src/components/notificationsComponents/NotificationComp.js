import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/socketContext";
import useUserContext from "../../hooks/useUserContext";
import { joinRoom, leaveRoom } from "../../utils/socketUtils";
import instance from "../../constants/axios";
import { notificationRequests, requests } from "../../constants/requests";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../../utils/utils";
import { FaArrowLeft, FaArrowRight, FaTrash } from "react-icons/fa";

const handleNotificationCreated = (socket, user, setNotifications) => {
  socket.on("notification:created", (data) => {
    console.log("notification created", data);
    getNotifications(user.id, setNotifications);
  });
};

const getNotifications = async (userId, setNotifications) => {
  // get notifications by passing userId in params
  const res = await instance.get(`/notifications/${userId}`);
  console.log("notifications", res.data);
  setNotifications(res.data.notifications);
};

export const NotificationComp = ({ NotificationType }) => {
  const { user } = useUserContext();
  const { socket } = useContext(SocketContext);

  const [notifications, setNotifications] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 15;

  // Calculate start and end indices for the current page
  const startIndex = (currentPage - 1) * notificationsPerPage;
  const endIndex = startIndex + notificationsPerPage;

  // Get the notifications to display on the current page
  const currentNotifications = notifications.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const navigate = useNavigate();
  // get notifications on component mount
  useEffect(() => {
    if (!user || user.id == null) {
      return;
    }
    getNotifications(user.id, setNotifications);
  }, [user]);
  useEffect(() => {
    joinRoom(socket, user.id);

    handleNotificationCreated(socket, user, setNotifications);

    console.log("notification comp mounted");

    return () => {
      leaveRoom(socket, user.id);
      socket.off("notification:created");
    };
  }, [socket, user.id]);
  useEffect(() => {
    console.log(notifications);
  }, [notifications]);

  const handleNavigateProfile = (username) => {
    navigate(`/${username}`);
  };
  const handleNavigateTweet = (tweetId, username) => {
    navigate(`/${username}/status/${tweetId}`);
  };

  const handleNotificationSeen = async (notificationId) => {
    const res = await instance.put(`/notifications/update/${notificationId}`);
    console.log(res.data);
    getNotifications(user.id, setNotifications);
  };

  const handleDeleteNotification = async (notificationId) => {
    const res = await instance.delete(
      `/notifications/delete/${notificationId}`
    );
    console.log(res.data);
    getNotifications(user.id, setNotifications);
  };

  const renderNotifications = () => {
    return (
      <div>
        {currentNotifications.map((notification) => (
          <div
            key={notification._id}
            className="relative border-b-[1px] border-gray-300 min-h-12 p-2 hover:bg-gray-200 hover:cursor-pointer"
            onClick={() =>
              !notification.seen && handleNotificationSeen(notification._id)
            }
          >
            <div className="absolute right-2 top-1/2 text-gray-400">
              {timeAgo(notification.createdAt)}
            </div>
            {!notification.seen && (
              <div className="absolute right-20 top-3 text-twitter-blue">
                <span className="text-base font-bold">New</span>
              </div>
            )}
            {/* delete button */}
            <div className="absolute right-2 top-2 text-gray-400 hover:text-lg">
              <FaTrash
                onClick={() => handleDeleteNotification(notification._id)}
              />
            </div>

            <div className="flex">
              <div className="h-full flex align-middle text-center items-center justify-center content-center">
                <img
                  onClick={() =>
                    handleNavigateProfile(
                      notification.triggeredByUser?.username
                    )
                  }
                  src={`/uploads/${notification.triggeredByUser?.profile_pic}`}
                  alt="profile pic"
                  className="h-10 w-10 rounded-full mr-5 hover:cursor-pointer"
                />
              </div>
              <p className="flex align-middle text-center items-center justify-center mr-2">
                @
                <span
                  onClick={() =>
                    handleNavigateProfile(
                      notification.triggeredByUser?.username
                    )
                  }
                  className="hover:underline cursor-pointer"
                >
                  {notification.triggeredByUser?.username}
                </span>
              </p>
              <p className="flex align-middle text-center items-center justify-center">
                {notification.notificationType === "like"
                  ? "Liked Your Tweet"
                  : notification.notificationType === "retweet"
                  ? "Retweeted Your Tweet"
                  : notification.notificationType === "comment"
                  ? "Commented on Your Tweet"
                  : notification.notificationType === "follow"
                  ? "Followed You"
                  : notification.notificationType === "mention"
                  ? "Mentioned You"
                  : notification.notificationType === "quote"
                  ? "Quoted Your Tweet"
                  : notification.notificationType === "message"
                  ? "Messaged You"
                  : ""}
                {" - "}
                <span
                  className="hover:underline"
                  onClick={() =>
                    handleNavigateTweet(
                      notification.tweetId?._id,
                      notification.triggeredByUser?.username
                    )
                  }
                >
                  "{notification.tweetId?.tweetText.slice(0, 20)}..."{" "}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  const renderVerifiedNotifications = () => {
    return <div>Nothing to see here</div>;
  };
  const renderMentionsNotifications = () => {
    return (
      <div>
        {notifications.map((notification) =>
          notification.notificationType === "mention" ? (
            <div
              key={notification._id}
              className="relative border-b-[1px] border-gray-300 min-h-12 p-2 hover:bg-gray-200 hover:cursor-pointer"
              onClick={() =>
                handleNavigateTweet(
                  notification.tweetId?._id,
                  notification.triggeredByUser?.username
                )
              }
            >
              <div className="flex">
                <div className="h-full flex align-middle text-center items-center justify-center content-center">
                  <img
                    onClick={() =>
                      handleNavigateProfile(
                        notification.triggeredByUser?.username
                      )
                    }
                    src={`/uploads/${notification.triggeredByUser?.profile_pic}`}
                    alt="profile pic"
                    className="h-10 w-10 rounded-full mr-5 hover:cursor-pointer"
                  />
                </div>
                <p className="flex align-middle text-center items-center justify-center mr-2">
                  @
                  <span
                    onClick={() =>
                      handleNavigateProfile(
                        notification.triggeredByUser?.username
                      )
                    }
                    className="hover:underline cursor-pointer"
                  >
                    {notification.triggeredByUser?.username}
                  </span>
                </p>
                <p className="flex align-middle text-center items-center justify-center">
                  {notification.notificationType === "like"
                    ? "Liked Your Tweet"
                    : notification.notificationType === "retweet"
                    ? "Retweeted Your Tweet"
                    : notification.notificationType === "comment"
                    ? "Commented on Your Tweet"
                    : notification.notificationType === "follow"
                    ? "Followed You"
                    : notification.notificationType === "mention"
                    ? "Mentioned You"
                    : notification.notificationType === "quote"
                    ? "Quoted Your Tweet"
                    : notification.notificationType === "message"
                    ? "Messaged You"
                    : ""}
                  {" - "}
                  <span className="hover:underline">
                    "{notification.tweetId?.tweetText.slice(0, 20)}..."{" "}
                  </span>
                </p>
              </div>
            </div>
          ) : null
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[520px] flex flex-col justify-between">
      {notifications.length === 0 ? (
        <div className="flex justify-center items-center h-96">
          <p className="text-2xl">No Notifications</p>
        </div>
      ) : (
        ""
      )}
      {NotificationType === "all"
        ? renderNotifications()
        : NotificationType === "verified"
        ? renderVerifiedNotifications()
        : NotificationType === "mentions"
        ? renderMentionsNotifications()
        : ""}

      {notifications.length > notificationsPerPage ? (
        <div className="flex justify-evenly items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg text-twitter-blue disabled:text-black/50"
          >
            <FaArrowLeft />
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentNotifications.length < notificationsPerPage}
            className="p-2 rounded-lg text-twitter-blue disabled:text-black/50"
          >
            <FaArrowRight />
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
