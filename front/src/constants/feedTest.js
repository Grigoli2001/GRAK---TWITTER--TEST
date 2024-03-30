export const users = [
  {
    id: 1,
    username: "john_doe",
    email: "test@test.com",
    name: "TestingThisLongNameOfExactlyFiftyCharacter Surname",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "my new bio",
    dob: "2004-03-22T18:07:00.000Z",
    join_date: "2021-01-26T18:07:00.000Z",
    location: "Testville, Testland",
    verified: true,
    cover:
      "https://plus.unsplash.com/premium_photo-1673306778968-5aab577a7365?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    fname: "Test",
    lname: "User",
    bio: "I'm a test user",
    followers: 100,
    following: ["2", "4"],
  },

  {
    id: 2,
    username: "raunak_test",
    email: "raunak@test.com",
    name: "Raunak Bhansali",
    bio: "I'm Raunak the developer",
    avatar:
      "https://plus.unsplash.com/premium_photo-1687187499277-e1c59bd3032f?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    followers: 100,
    following: ["1", "3"],
    verified: true,
    join_date: "2021-01-26T18:07:00.000Z",
    cover:
      "https://plus.unsplash.com/premium_photo-1676478746894-95d39780d573?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    likesIsPublic: true,
  },

  {
    id: 3,
    username: "amay_test",
    email: "amay@test.com",
    name: "Amay Sunil Shenoy",
    bio: "I'm Amay the developer",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHVzZXJ8ZW58MHx8MHx8fDA%3D",
    followers: 100,
    following: ["1", "2"],
    join_date: "2021-01-26T18:07:00.000Z",
  },
  {
    id: 4,
    username: "grigoli_test",
    email: "grigoli@test.com",
    name: "Grigoli Patsatsia",
    bio: "I'm Grigoli the developer",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    join_date: "2021-01-26T18:07:00.000Z",
  },
  {
    id: 5,
    username: "matt_test",
    email: "matt@test.com",
    name: "Matt Test",
    bio: "I'm Matt the developer",
    join_date: "2021-01-26T18:07:00.000Z",
  },

  {
    id: 6,
    username: "sim1",
    email: "matt@test.com",
    name: "Matt Test",
    bio: "I'm Matt the developer",
    join_date: "2021-01-26T18:07:00.000Z",
  },

    {
        "id": 7,
        "username": "sim2",
        "email": "matt@test.com",
        "name": "Totally Test",
        join_date: "2021-01-26T18:07:00.000Z",
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    }
]

export const forYouTweets = [
  {
    _id: 4,
    tweetType: "tweet",
    tweetText: "SMH🤦",
    userId: 2,
    createdAt: "2024-01-26T18:07:00.000Z",
    tweet_likes: [],
    tweet_retweets: [],
    tweet_bookmarks: [],
    replies: 50,
    // media: {
    //     src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUJcmljayByb2xs",
    //     mediaType: "video",
    // },
    retweeted: true,
    bookmarked: true,
  },
  {
    _id: 5,
    tweetType: "tweet",
    tweetText: "Brand new car",
    userId: 2,
    createdAt: "2021-01-26T18:07:00.000Z",
    tweet_likes: [],
    tweet_retweets: [],
    tweet_bookmarks: [],
    replies: 50,
    // media: {
    //     src: "https://images.unsplash.com/photo-1541348263662-e068662d82af?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BvcnRzJTIwY2FyfGVufDB8fDB8fHww",
    //     mediaType: "image",
    // },
    liked: true,
  },

  // {
  //     id: 6,
  //     caption: "Dance vibes! 💃",
  //     userId: 3,
  //     createdAt: "2024-02-01T14:30:00.000Z",
  //     likes: 500,
  //     retweets: 20,
  //     replies: 10,
  //     media: {
  //         src:"https://www.youtube.com/shorts/YwkEHtQKvig?feature=share",
  //         mediaType: "video"
  //     },
  //     liked: true
  // },
  // {
  //     id: 7,
  //     caption: "Beautiful sunset view",
  //     userId: 1,
  //     createdAt: "2024-02-02T10:45:00.000Z",
  //     likes: 25,
  //     retweets: 5,
  //     replies: 2,
  //     media: {
  //         src:"https://images.unsplash.com/photo-1683009427598-9c21a169f98f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //         mediaType: "image"
  //     },
  //     retweeted: true
  // },

  // {
  //     id: 8,
  //     caption: "Chill vibes for the weekend!",
  //     userId: 4,
  //     createdAt: "2024-02-02T20:15:00.000Z",
  //     likes: 15,
  //     retweets: 2,
  //     replies: 3
  // }
];

// export const followedTweets = [
//     {
//         id: 2,
//         caption: "Warming up for the new season",
//         userId: 1,
//         createdAt: "2024-01-19T18:07:00.000Z",
//         updatedAt: "2021-03-19T18:07:00.000Z",
//         likes: 30,
//         retweets: 10,
//         replies: 5,
//         media: {
//             src:"https://plus.unsplash.com/premium_photo-1685055940272-62cce291d7d3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//             mediaType: "image"
//         },
//         bookmarked: true
//     },

//     {
//         id: 3,
//         caption: "Brand new stadium",
//         userId: 2,
//         createdAt: "2024-01-26T18:07:00.000Z",
//         likes: 0,
//         retweets: 10,
//         replies: 5,
//         media: {
//             src:"https://plus.unsplash.com/premium_photo-1663133768501-1ff9ba64d122?q=80&w=1933&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//             mediaType: "image"
//         }

//     }, {
//         id: 10,
//         caption: "Epic roller coaster ride! 🎢",
//         userId: 3,
//         createdAt: "2024-01-28T16:20:00.000Z",
//         likes: 40,
//         retweets: 8,
//         replies: 4,
//         media: {
//             src:"https://www.youtube.com/shorts/k-9obR_Y3oU?feature=share",
//             mediaType: "video"
//         },
//         bookmarked: true
//     },
//     {
//         id: 9,
//         caption: "Sunny day at the beach",
//         userId: 1,
//         createdAt: "2024-02-01T12:00:00.000Z",
//         likes: 5,
//         retweets: 3,
//         replies: 1,
//         media: {
//             src:"https://images.unsplash.com/photo-1684698937050-ae323feb1fb0?q=80&w=2075&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//             mediaType: "image"
//         },
//         liked: true
//     },
//     // ... (three more tweets with media)

//     {
//         id: 11,
//         caption: "Tech conference day!",
//         userId: 5,
//         createdAt: "2024-02-02T14:45:00.000Z",
//         likes: 8,
//         retweets: 1,
//         replies: 2
//         // (no media for this tweet)
//     },
//     {
//         id: 12,
//         caption: "New game release",
//         userId: 4,
//         createdAt: "2024-02-02T20:15:00.000Z",
//         likes: 15,
//         retweets: 2,
//         replies: 3
//     },
//     {
//         id: 1,
//         caption: "New game release 2",
//         userId: 4,
//         createdAt: "2024-02-02T20:15:00.000Z",
//         likes: 15,
//         retweets: 2,
//         replies: 3,
//         media: {
//             src:"http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_2160p_60fps_normal.mp4",
//             mediaType: "video"
//         },
//     }

// ]

export const tags = ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#totally"];

export const trends = [
  {
    category: "Football",
    title: "Ronaldo",
    tweets: 2000000,
  },
  {
    category: "Football",
    title: "AFCON",
    tweets: 1000,
  },
  {
    category: "Football",
    title: "Messi",
    tweets: 900,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
  {
    category: "Science",
    title: "Space",
    tweets: 60,
  },
];

export const topics = [
  {
    category: "Sports",
    topic: [
      "Premier League",
      "Champions League",
      "NBA",
      "Manchester United",
      "Basketball",
      "Cristiano Ronaldo",
      "Lionel Messi",
      "Formula 1",
      "Tennis",
    ],
  },
  {
    category: "Music",
    topic: ["Rock", "Hip Hop", "Pop", "Jazz", "Rap", "Classical"],
  },
  {
    category: "Science",
    topic: [
      "Space",
      "Physics",
      "Biology",
      "Chemistry",
      "Mathematics",
      "Astronomy",
    ],
  },
  {
    category: "Technology",
    topic: ["Apple", "Google", "Microsoft", "Tesla", "SpaceX", "Elon Musk"],
  },
  {
    category: "Politics",
    topic: ["USA", "UK", "India", "China", "Russia", "Canada"],
  },
  {
    category: "Entertainment",
    topic: ["Movies", "TV Shows", "Anime", "Manga", "Games", "Books"],
  },
  {
    category: "Health",
    topic: [
      "Fitness",
      "Nutrition",
      "Mental Health",
      "Diet",
      "Exercise",
      "Yoga",
    ],
  },
];

export const defaultMessages = (user) => {
  return [
    {
      message: "Hello",
      sender: user.id,
    },
    {
      message: "Hi",
      sender: 2,
    },
    {
      message: "How are you?",
      sender: user.id,
    },
    {
      message: "I am fine",
      sender: 2,
    },
    {
      message: "And you?",
      sender: 2,
    },
    {
      message: "I am fine too",
      sender: user.id,
    },
    {
      message: "What are you doing?",
      sender: user.id,
    },
    {
      message: "Nothing much, just chilling",
      sender: 2,
    },
    {
      message: "Okay",
      sender: user.id,
    },
    {
      message: "I am going to sleep now",
      sender: user.id,
    },
    {
      message: "Goodnight",
      sender: user.id,
    },
    {
      message: "Goodnight",
      sender: 2,
    },
  ];
};
