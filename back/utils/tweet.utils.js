const tweetModel = require('../models/tweetModel');
const pollModel = require('../models/pollModel');
const Interaction = require('../models/interactionModel');
const session = require("../database/neo4j_setup");

const getUserById = async (currentUID) => {
    const currentUIDasInt = parseInt(currentUID);
    const result = await session.run(
        `
        MATCH (u:User {id: $userId})
        OPTIONAL MATCH (u)-[:FOLLOWS]->(following)
        OPTIONAL MATCH (follower)-[:FOLLOWS]->(u)
        WITH u, COUNT(DISTINCT following) AS following_count, COUNT(DISTINCT follower) AS followers_count
        RETURN u, following_count, followers_count
        `,
        {
            userId: currentUIDasInt,
        }
    );
    const user = result.records[0].get("u").properties;
    user.following_count = result.records[0].get("following_count").toInt();
    user.followers_count = result.records[0].get("followers_count").toInt();
    user.is_followed = user.followers_count > 0;
    return user;
}

const PAGE_SIZE = 20;

const tweetQuery = async ({ matchOptions, currentUID, otherUserUID, page, sortByInteraction, sort }) => {
    if (isNaN(page)) {
        page = 0;
    }
    const currentUIDasInt = parseInt(currentUID);
    const pipline = [
        {
            $match: matchOptions,
        },
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
                            cond: { $and: [{ $eq: ["$$interaction.interactionType", "like"] }, { $eq: ["$$interaction.is_deleted", false] }] }
                        },
                    },
                },
                totalBookmarks: {
                    $size: {
                        $filter: {
                            input: "$interactions",
                            as: "interaction",
                            cond: { $and: [{ $eq: ["$$interaction.interactionType", "bookmark"] }, { $eq: ["$$interaction.is_deleted", false] }] }

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
                userLiked: {
                    $size: {
                        $filter: {
                            input: "$interactions",
                            as: "interaction",
                            cond: { $and: [{ $eq: ["$$interaction.interactionType", "like"] }, { $eq: ["$$interaction.is_deleted", false] }, { $eq: ["$$interaction.userId", currentUIDasInt] }] },
                        },
                    },
                },
                userBookmarked: {
                    $size: {
                        $filter: {
                            input: "$interactions",
                            as: "interaction",
                            cond: { $and: [{ $eq: ["$$interaction.interactionType", "bookmark"] }, { $eq: ["$$interaction.is_deleted", false] }, { $eq: ["$$interaction.userId", currentUIDasInt] }] },
                        },
                    }
                },
                userVoted: {
                    $arrayElemAt: [{
                        $filter: {
                            input: "$interactions",
                            as: "interaction",
                            cond: { $and: [{ $eq: ["$$interaction.interactionType", "vote"] }, { $eq: ["$$interaction.userId", currentUIDasInt] }] },

                        },
                    }, 0]
                },

            },
        },
    ];

    if (sortByInteraction) {
        pipline.push({
            $unwind: "$interactions"
        },
            {
                $match: { "interactions.interactionType": sortByInteraction }
            },
            {
                $sort: { "interactions.created_at": -1 }
            },
            {
                $group: {
                    _id: "$_id",
                    tweet: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: { newRoot: "$tweet" }
            })
    }
    else {
        pipline.push({
            $sort: { createdAt: sort ?? -1 }
        })
    }

    pipline.push(
        {
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
                }

            },
        },
    )

    const tweets = await tweetModel.aggregate(pipline)
        .skip(page * PAGE_SIZE)
        .limit(PAGE_SIZE);

    await Promise.all(tweets.map(async tweet => {
        if (tweet.poll) {
            await Promise.all(tweet.poll.options.map(async (option) => {
                const votes = await Interaction.countDocuments({ tweet_id: tweet._id, interactionType: 'vote', pollOption: option.id });
                option.votes = votes;
            }));

        }
        const totalReplies = await tweetModel.countDocuments({ reference_id: tweet._id, tweetType: 'reply' });
        const totalRetweets = await tweetModel.countDocuments({ reference_id: tweet._id, $or: [{ tweetType: 'retweet' }, { tweetType: 'quote' }] });
        const userRetweeted = await tweetModel.countDocuments({ reference_id: tweet._id, tweetType: 'retweet', userId: currentUIDasInt });

        tweet.totalReplies = totalReplies;
        tweet.totalRetweets = totalRetweets;
        tweet.userRetweeted = userRetweeted;

        if (!tweet.user) {
            try {
                tweet.user = await getUserById(tweet.userId);
            }
            catch (e) {
                console.log(e)
            }

        }
        if (tweet.reference && !tweet.reference.user) {
            tweet.reference.user = await getUserById(tweet.reference.userId);

        }

    })
    );

    return tweets
}

const checkTweetText = (tweetText) => {
    let resolveTweetText
    if (tweetText) {
        const pattern = /\$\$__([^$]+)\$\$/g;;
        resolveTweetText = tweetText.replace(pattern, (match, tag) => {
            return `#${tag}`;
        });

        if (resolveTweetText > 300) {
            return false;
        }
    }
    return resolveTweetText
}

const allFollowers = async (userId) => {
    const result = await session.run(
        `
        MATCH (user:User {id: $userId})-[:FOLLOWS]->(follower)
        RETURN COUNT(follower) AS followers_count
        `,
        {
            userId: userId,
        }
    );
    return result.records[0].get("followers_count").toInt();
}

module.exports = {
    tweetQuery,
    allFollowers,
    getUserById,
    checkTweetText
}
