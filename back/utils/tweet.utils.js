const tweetModel = require("../models/tweetModel");
const pollModel = require("../models/pollModel");
const Interaction = require("../models/interactionModel");
const { getUserFullDetails } = require("./user.utils");

// constant page size ; consider moving to global file
const PAGE_SIZE = 20;
const tweetQuery = async ({
  matchOptions,
  currentUID,
  page,
  sortByInteraction,
  sort,
}) => {

  if (isNaN(page)) {
    page = 0;
  }
  // currentUID to check if user liked, bookmarked, voted
  // const currentUIDasInt = parseInt(currentUID); // swapped to string

  const pipline = [

    // still allow is deleted for everyone to be queried
    {
      $match: {
        $or: [{ is_deleted: false }, { is_deleted: { $exists: false } }],
      },
    },
    {
      $lookup: {
        from: "polls",
        localField: "poll",
        foreignField: "_id",
        as: "poll",
      },
    },
    {
      $lookup: {
        from: "interactions",
        localField: "_id",
        foreignField: "tweet_id",
        as: "interactions",
      },
    },

    {
      $addFields: {
        poll: { $arrayElemAt: ["$poll", 0] },
        totalLikes: {
          $size: {
            $filter: {
              input: "$interactions",
              as: "interaction",
              cond: {
                $and: [
                  { $eq: ["$$interaction.interactionType", "like"] },
                  { $eq: ["$$interaction.is_deleted", false] },
                ],
              },
            },
          },
        },
        totalBookmarks: {
          $size: {
            $filter: {
              input: "$interactions",
              as: "interaction",
              cond: {
                $and: [
                  { $eq: ["$$interaction.interactionType", "bookmark"] },
                  { $eq: ["$$interaction.is_deleted", false] },
                ],
              },
            },
          },
        },
        totalVotes: {
          $size: {
            $filter: {
              input: "$interactions",
              as: "interaction",
              cond: { $eq: ["$$interaction.interactionType", "vote"] },
            },
          },
        },

        // swap to user id from token

        userLiked: {
          $size: {
            $filter: {
              input: "$interactions",
              as: "interaction",
              cond: {
                $and: [
                  { $eq: ["$$interaction.interactionType", "like"] },
                  { $eq: ["$$interaction.is_deleted", false] },
                  { $eq: ["$$interaction.userId", currentUID] },
                ],
              },
            },
          },
        },
        userBookmarked: {
          $size: {
            $filter: {
              input: "$interactions",
              as: "interaction",
              cond: {
                $and: [
                  { $eq: ["$$interaction.interactionType", "bookmark"] },
                  { $eq: ["$$interaction.is_deleted", false] },
                  { $eq: ["$$interaction.userId", currentUID] },
                ],
              },
            },
          },
        },
        userVoted: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$interactions",
                as: "interaction",
                cond: {
                  $and: [
                    { $eq: ["$$interaction.interactionType", "vote"] },
                    { $eq: ["$$interaction.userId", currentUID] },
                  ],
                },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $match: matchOptions,
    },

    {
      $lookup: {
        from: "tweets",
        localField: "reference_id",
        foreignField: "_id",
        as: "reference",
      },
    },
    {
      $addFields: {
        reference: { $arrayElemAt: ["$reference", 0] },
      },
    },
  ];

  if (sortByInteraction) {
    pipline.push(
      {
        $unwind: "$interactions",
      },
      {
        $match: { "interactions.interactionType": sortByInteraction },
      },
      {
        $sort: { "interactions.created_at": -1 },
      },
      // Group by tweet ID and keep the original tweet document
      {
        $group: {
          _id: "$_id",
          tweet: { $first: "$$ROOT" },
        },
      },
      // replace with the original tweet
      {
        $replaceRoot: { newRoot: "$tweet" },
      }
    );
  } else {
    pipline.push({
      $sort: { createdAt: sort ?? -1 },
    });
  }
  

  pipline.push({
    $project: {
      tweetType: 1,
      tweetText: 1,
      tweetMedia: 1,
      is_highlighted: 1,
      userId: 1,
      reference_id: 1,
      reference: 1,
      createdAt: 1,
      totalLikes: 1,
      totalBookmarks: 1,
      totalVotes: 1,
      userLiked: 1,
      userRetweeted: 1,
      userBookmarked: 1,
      userVoted: 1,
      is_highlighted: 1,
      is_edited: 1,
      poll: {
        options: 1,
        poll_end: 1,
      },
    },
  });

  const tweets = await tweetModel
    .aggregate(pipline)
    .skip(page * PAGE_SIZE)
    .limit(PAGE_SIZE);

  await Promise.all(
    tweets.map(async (tweet) => {
      if (tweet.poll) {
        await Promise.all(
          tweet.poll.options.map(async (option) => {
            const votes = await Interaction.countDocuments({
              tweet_id: tweet._id,
              interactionType: "vote",
              pollOption: option.id,
            });
            option.votes = votes;
          })
        );
      }
      // i am sure there is a better way to query but idek
      const totalReplies = await tweetModel.countDocuments({
        reference_id: tweet._id,
        tweetType: "reply",
      });
      const totalRetweets = await tweetModel.countDocuments({
        reference_id: tweet._id,
        $or: [{ tweetType: "retweet" }, { tweetType: "quote" }],
      });
      const userRetweeted = await tweetModel.countDocuments({
        reference_id: tweet._id,
        tweetType: "retweet",
        userId: currentUID,
      });

      tweet.totalReplies = totalReplies;
      tweet.totalRetweets = totalRetweets;
      tweet.userRetweeted = userRetweeted;

      // has to stay since users are stored in neo4j
      if (!tweet.user) {
        try {
          tweet.user = await getUserFullDetails(tweet.userId, currentUID, "id");
        } catch (e) {
          console.log(e);
        }
      }

      if (tweet.reference && !tweet.reference.user) {
        tweet.reference.user = await getUserFullDetails(tweet.reference.userId, currentUID, "id");
      }
      if (tweet.reference && tweet.reference.poll) {
        console.log("TWEET REFERENCE POLL: ", tweet.reference.poll);
        refpoll = await pollModel.findOne({ _id: tweet.reference.poll });
        console.log("REFPOLL: ", refpoll, 'currentREFPOLL');
        console.log("SEttiNG REFERENCE POLL: ", tweet.reference.poll, "TO: ", refpoll);
        
            tweet.reference.poll = refpoll;
        }
    })
  );

  console.log("ALL TWEETS: ",JSON.stringify(matchOptions), tweets);
  return tweets;
};

const checkTweetText = (tweetText) => {
  let resolveTweetText;
  if (tweetText) {
    // parse for hastags generated from mentions
    const pattern = /\$\$__([^$]+)\$\$/g;
    resolveTweetText = tweetText.replace(pattern, (match, tag) => {
      return `#${tag}`;
    });

    if (resolveTweetText > 300) {
      return false;
    }
  }
  return resolveTweetText;
};

  // const followers = await pool.query(
  //   `SELECT following FROM follows WHERE user_id = $1`,
  //   [userId]
  // );



module.exports = {
  tweetQuery,
  checkTweetText,
};
