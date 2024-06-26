export const requests = {
  login: "/auth/login",
  signup: "/auth/signup",
  check: "/auth/check",
  logout: "/auth/logout",
  sendOTP: "/auth/sendOTP",

  getUsers: "/users",
  getUser: "/users/user",
  updateUser: "/users/update",
  change_password: "/auth/change_password",
  changeUsername: "/profile/changeUsername",
  userPreferences: "/auth/user_preferences",

  exploreUsers: "/users/explore-users",
  getActiveChats: '/messages/active-chats'
};

export const followRequests = {
  follow: "/users/follow",
  unfollow: "/users/unfollow",
  followData: "/users/follow-data",
  // followers: "/users/followers",
  // following: "/users/following",
};

export const tweetRequests = {
  allTweets: "/tweets",

  forYou: "/tweets/category/foryou",
  following: "/tweets/category/following",
  likes: "/tweets/category/likes",
  myTweets: "/tweets/category/mytweets",
  bookmarks: "/tweets/category/bookmarks",
  replies: "/tweets/category/replies",
  highlights: "/tweets/category/highlights",
  myMedia: "/tweets/category/mymedia",

  getTweetById: "/tweets/",
  getTweets: "/tweets",
  getReplyTweets: "/tweets/replies/",
  getFollowedTweets: "/tweets/followed",
  likeTweet: "/tweets/like",
  retweetTweet: "/tweets/retweet",
  bookmarkTweet: "/tweets/bookmark",
  replyTweet: "/tweets/reply",
  createTweets: "/tweets/create",
  editTweet: "/tweets/edit",
  deleteTweet: "/tweets/delete",
  highlightTweet: "/tweets/highlight",
  getTrending: "/tweets/trending",
  searchTags: '/tweets/tags'
}

  

export const notificationRequests = {
  allNotifications: "/notifications",
  markAsSeen: "/notifications/update",
  deleteNotification: "/notifications/delete",
};
