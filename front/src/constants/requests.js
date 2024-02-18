export const requests = {
  login: "/auth/login",
  signup: "/auth/signup",
  check: "/auth/check",
  logout: "/auth/logout",
  sendOTP: "/auth/sendOTP",

  getAllUsers: "/users/all",
  getUser: "/users",
  updateUser: "/users/update",
  change_password: "/auth/change_password",
  createTweets: "/tweets/create",
  getTweetById: "/tweets/",
  getTweets: "/tweets",
  getReplyTweets: "/tweets/replies/",
  getFollowedTweets: "/tweets/followed",
  likeTweet: "/tweets/like",
  retweetTweet: "/tweets/retweet",
  bookmarkTweet: "/tweets/bookmark",
  replyTweet: "/tweets/reply",
  changeUsername: "/profile/changeUsername",
  userPreferences: "/auth/user_preferences",
};

export const followRequests = {
  follow: "/users/follow",
  unfollow: "/users/unfollow",
  followers: "/users/followers",
  following: "/users/following",
};

export const tweetRequests = {
  allTweets: "/tweets",
  forYou: "/tweets/category/foryou",
  following: "/tweets/category/following",
  likes: "/tweets/category/likes",
  mytweets: "/tweets/category/mytweets",
  bookmarks: "/tweets/category/bookmarks",
  retweets: "/tweets/category/retweets",
  replies: "/tweets/category/replies",
};

export const notificationRequests = {
  allNotifications: "/notifications",
  markAsSeen: "/notifications/update",
  deleteNotification: "/notifications/delete",
};
