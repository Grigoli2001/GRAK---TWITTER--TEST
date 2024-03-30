const tweetModel = require('../models/tweetModel');
const pollModel = require('../models/pollModel');
const Interaction = require('../models/interactionModel');
const pool = require("../database/db_setup");


const getUserById = async (currentUID) => {
    const currentUIDasInt = parseInt(currentUID);
    const user = await pool.query(
      `SELECT u.id, name, username, email, profile_pic, u.created_at,
    COUNT(DISTINCT f1.following) AS following_count,
    COUNT(DISTINCT f2.user_id) AS followers_count,
    CASE 
      WHEN u.id IN (SELECT following from follows where user_id= $1) 
      THEN 1 
      ELSE 0 
      END 
      AS is_followed
    FROM 
        users u
    LEFT JOIN 
        follows f1 ON u.id = f1.user_id
    LEFT JOIN 
        follows f2 ON u.id = f2.following
    WHERE u.id = $1
    GROUP BY 
        u.id  `, [currentUIDasInt]);

    if (!user.rowCount) {
      throw new Error('User not found')
    }
    return user.rows[0];
}
// constant page size ; consider moving to global file 
const PAGE_SIZE = 20;
const tweetQuery = async ({matchOptions, currentUID, otherUserUID, page, sortByInteraction, sort}) => {
    console.log(matchOptions,'sort',sort)
    if (isNaN(page)) {
        page = 0;
    }
    // currentUID to check if user liked, bookmarked, voted
    const currentUIDasInt = parseInt(currentUID);

    const pipline = [

        { $match: 
            {
               $or: [
                    { is_deleted: false }, 
                    { is_deleted: { $exists: false } }
                ]
            }
            
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
        {
            $match: matchOptions,
        },

        {
            $lookup: {
                from: "tweets",
                localField: "reference_id",
                foreignField: "_id",
                as: "reference",
            }

        },
        {
            $addFields: {
                reference: { $arrayElemAt: ["$reference", 0] },
            },
        },
      
        
        

    ]


    if (sortByInteraction) {
        pipline.push({
            $unwind: "$interactions" 
        },
        {
            $match: {"interactions.interactionType": sortByInteraction} 
        },
        {
            $sort: { "interactions.created_at": -1 } 
        },
        // Group by tweet ID and keep the original tweet document
        {
            $group: {
                _id: "$_id", 
                tweet: { $first: "$$ROOT" } 
            }
        },
        // replace with the original tweet
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
        // i am sure there is a better way to query but idek
        const totalReplies = await tweetModel.countDocuments({ reference_id: tweet._id,  tweetType: 'reply'  });
        const totalRetweets = await tweetModel.countDocuments({ reference_id: tweet._id, $or: [{ tweetType: 'retweet' }, { tweetType: 'quote' }] });
        const userRetweeted = await tweetModel.countDocuments({ reference_id: tweet._id, tweetType: 'retweet', userId: currentUIDasInt });


        tweet.totalReplies = totalReplies;
        tweet.totalRetweets = totalRetweets;
        tweet.userRetweeted = userRetweeted;

        if (!tweet.user) {
            try{
                tweet.user = await getUserById(tweet.userId);
            }
            catch(e){
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
        // parse for hastags generated from mentions
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
    const followers = await pool.query(
        `SELECT following FROM follows WHERE user_id = $1`,
        [userId]
    );
    return followers.rows;
}

module.exports = {
    tweetQuery,
    allFollowers,
    getUserById,
    checkTweetText
}