export const requests = {
  login: "/auth/login",
  signup: "/auth/signup",
  check: "/auth/check",
  logout: "/auth/logout",
  sendOTP: "/auth/sendOTP",

  getAllUsers: "/users",
  getUser: "/user",
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
  follow: "/user/follow",
  unfollow: "/user/unfollow",
  followers: "/user/followers",
  following: "/user/following",
};
