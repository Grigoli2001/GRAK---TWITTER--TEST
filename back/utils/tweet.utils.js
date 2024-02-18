const tweetModel = require('../models/tweetModel');
const pollModel = require('../models/pollModel');
const Interaction = require('../models/interactionModel');
const pool = require("../database/db_setup");


const tweetQuery = async (matchOptions,userid) => {
    console.log(matchOptions, userid)
    const tweets = await tweetModel.aggregate([
     
        {
            $lookup: {
                from: 'polls',
                localField: 'poll',
                foreignField: '_id',
                as: 'poll',
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
                            cond: { $and: [{ $eq: ["$$interaction.interactionType", "like"] }, { $eq: ["$$interaction.is_deleted", false] },] }
                        },
                    },
                },
                totalBookmarks: {
                    $size: {
                        $filter: {
                            input: "$interactions",
                            as: "interaction",
                            cond: { $and: [{ $eq: ["$$interaction.interactionType", "bookmark"] }, { $eq: ["$$interaction.is_deleted", false] },] }

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
                            cond: { $and: [{ $eq: ["$$interaction.interactionType", "like"] }, { $eq: ["$$interaction.is_deleted", false] }, { $eq: ["$$interaction.userId", userid] }] },
                        },
                    },
                },
                userBookmarked: {
                    $size: {
                        $filter: {
                            input: "$interactions",
                            as: "interaction",
                            cond: { $and: [{ $eq: ["$$interaction.interactionType", "bookmark"] }, { $eq: ["$$interaction.is_deleted", false] }, { $eq: ["$$interaction.userId", userid] }] },
                        },
                    }
                },
                userVoted: {
                    $arrayElemAt: [{
                        $filter: {
                            input: "$interactions",
                            as: "interaction",
                            cond: { $and: [{ $eq: ["$$interaction.interactionType", "vote"] }, { $eq: ["$$interaction.userId", userid] }] },

                        },
                    }, 0]
                },

            },
        },
        {
            $match: matchOptions,
        },
        {
            $project: {
                tweetType: 1,
                tweetText: 1,
                tweetMedia: 1,
                userId: 1,
                reference_id: 1,
                createdAt: 1,
                totalLikes: 1,
                totalBookmarks: 1,
                totalComments: 1,
                totalVotes: 1,
                userLiked: 1,
                userRetweeted: 1,
                userBookmarked: 1,
                userVoted: 1,
                poll: {
                    options: 1,
                    poll_end: 1,
                }

            },
        },

    ]).sort({
        createdAt: -1
    });

    await Promise.all(tweets.map(async tweet => {
        if (tweet.poll) {
            await Promise.all(tweet.poll.options.map(async (option) => {
                const votes = await Interaction.countDocuments({ tweet_id: tweet._id, interactionType: 'vote', pollOption: option.id });
                option.votes = votes;
            }));

        }
        // i am sure there is a better way to query but idek
        const totalComments = await tweetModel.countDocuments({ reference_id: tweet._id, $or: [{ tweetType: 'comment' }, { tweetType: 'reply' }] });
        const totalRetweets = await tweetModel.countDocuments({ reference_id: tweet._id, $or: [{ tweetType: 'retweet' }, { tweetType: 'quote' }] });
        const userRetweeted = await tweetModel.countDocuments({ reference_id: tweet._id, tweetType: 'retweet', userId: userid });


        tweet.totalComments = totalComments;
        tweet.totalRetweets = totalRetweets;
        tweet.userRetweeted = userRetweeted;

        if (!tweet.user) {
            const user = await pool.query(`SELECT id, username, name, profile_pic FROM users WHERE id = ${tweet.userId}`);
            tweet.user = user.rows[0];
        }

    })
    );

    return tweets
}


const allFollowers = async (userId) => {
    const followers = await pool.query(
        `SELECT following FROM follows WHERE user_id = $1`,
        [userId]
    );
    return followers.rows;
}

module.exports = {
    tweetQuery,
    allFollowers
}