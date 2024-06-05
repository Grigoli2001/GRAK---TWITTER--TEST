const tweetModel = require("../models/tweetModel");
const pollModel = require("../models/pollModel");
const Interaction = require("../models/interactionModel");
const statusCode = require("../constants/statusCode");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const session = require("../database/neo4j_setup.js"); 
const { tweetQuery, allFollowers, getUserById, checkTweetText } = require('../utils/tweet.utils');

const getAllTweets = async (req, res) => {
  try {
    const tweets = await tweetQuery({ tweetType: "tweet" }, req.user.id);

    return res.status(statusCode.success).json({
      status: "success",
      data: {
        tweets,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(statusCode.badRequest).json({
      status: "fail",
      message: err,
    });
  }
};

const getTweetById = async (req, res) => {
    try {
        const { id } = req.params;
        const tweets = await tweetQuery({matchOptions: { _id: new ObjectId(id) }, currentUID:req.user.id})
        const tweet = tweets[0]
        if (!tweet) {
            return res.status(statusCode.badRequest).json({
                status: "fail",
                message: "No tweet found with that ID",
            });
        }
        return res.status(statusCode.success).json({
            status: "success",
            data: {
                tweet,
            },
        })

    } catch (err) {
        if (err.name === 'BSONError') {
            return res.status(statusCode.badRequest).json({
                status: "fail",
                message: "Invalid tweet ID",
            });
        }
        return res.status(statusCode.badRequest).json({
            status: "fail",
            message: err.message,
        });
    };
}

const getTweetsByCategory = async (req, res) => {
    try {

        const { category } = req.params;
        const { userId, page } = req.query;

        if (!category || !userId) {
            return res.status(statusCode.badRequest).json({
                message: "category is required and userId in query",
            });
        }
        let resolvePage = parseInt(page) ?? 0
        const userid = parseInt(userId)

        const categoryConditions = {
            'foryou': {},
            'following': {},
            'likes': { userLiked: 1 },
            'bookmarks': { userBookmarked: 1 },
            'replies': { $or: [ {tweetType: 'retweet'}, {tweetType: 'retweet'} ], userId: userid },
            'mytweets': { userId: userid },
            'highlights': { userId: userid, is_highlighted: true },
            'mymedia': { userId: userid, tweetMedia: { $exists: true } },
        }

        if(!categoryConditions[category]) return res.status(statusCode.badRequest).json({
            message: "Invalid category",
        });

        let tweets;
        try{

            if(category  === 'following' || category === 'foryou'){
                const following = await allFollowers(userid);
                const followingIds = following.map(follower => follower.following);
                if (category === 'following'){
                    // Neo4j Cypher query for following tweets
                    const result = await session.run(
                        `MATCH (t:Tweet)-[:POSTED_BY]->(u:User)
                        WHERE u.id IN $followingIds
                        RETURN t`
                        , { followingIds }
                    );
                    tweets = result.records.map(record => record.get('t'));
                }else{
                    // Neo4j Cypher query for foryou tweets
                    const result = await session.run(
                        `MATCH (t:Tweet)-[:POSTED_BY]->(u:User)
                        WHERE NOT u.id IN $followingIds
                        RETURN t`
                        , { followingIds }
                    );
                    tweets = result.records.map(record => record.get('t'));
                }
            } else {
                // Neo4j Cypher query for other categories
                const result = await session.run(
                    `MATCH (t:Tweet)-[:POSTED_BY]->(u:User)
                    WHERE t.tweetType = $tweetType AND $categoryConditions
                    RETURN t`
                    , { tweetType: category, categoryConditions }
                );
                tweets = result.records.map(record => record.get('t'));
            }

            return res.status(statusCode.success).json({
                tweets,
            });
        } catch (err) {
            console.log(err);
            return res.status(statusCode.badRequest).json({
                message: err,
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(statusCode.queryError).json({
            message: err,
        });
    };
}

const createTweet = async (req, res) => {
    try {
        const newTweetData = req.body;
        console.log(newTweetData)

        if (!newTweetData) {
            console.log('no data')
            return res.status(statusCode.badRequest).json({
                message: "No data provided see documentation for required fields",
            });
        }

    // filter out any undefined o|r null values
    Object.entries(newTweetData).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        delete newTweetData[key];
      }
    });

    const { tweetType, tweetText, tweetPoll, reference_id, tweetMedia } = newTweetData;

        if (!tweetType) {
            console.log('no tweet type')
            return res.status(statusCode.badRequest).json({
                message: "tweetType is required",
            });
        }

        const isOriginalTweet = tweetType === 'tweet'
        if (!isOriginalTweet && !reference_id) {
            console.log('no reference')
            return res.status(statusCode.badRequest).json({
                message: "if not original tweet, reference is required",
            });
        }

        if (isOriginalTweet && reference_id) {
            console.log('ref anD origin')

            return res.status(statusCode.badRequest).json({
                message: "should not pass a reference if original tweet",
            });
        }

        // change until firbase is implemented in back
        if ( ((!tweetText && !tweetMedia) && tweetType !== 'retweet') || (tweetMedia && tweetPoll)) {
            console.log('err', ((!tweetText && !tweetMedia) && tweetType !== 'retweet'))
            return res.status(statusCode.badRequest).json({
                message: "tweetText or tweetMedia is required",
            });
        }
        
        if (tweetType === 'retweet') {
            if (tweetText){
            console.log('retweet and text')
            return res.status(statusCode.badRequest).json({
                message: "retweet should not have tweetText",
            });
            }
            const checkRetweet = await tweetModel.findOne({ _id: reference_id, tweetType: 'retweet', userId: req.user.id, is_deleted: false});
            if (checkRetweet) {
                console.log('retweet exists')
                return res.status(statusCode.badRequest).json({
                    message: "retweet already exists",
                });
            }
        } else if (tweetType === 'reply') {
            console.log('reply')
            const checkReply = await tweetModel.findOne({ _id: reference_id, tweetType: 'tweet', userId: req.user.id, is_deleted: false});
            if (!checkReply) {
                console.log('not reply')
                return res.status(statusCode.badRequest).json({
                    message: "replying to a tweet that doesn't exist",
                });
            }
        }

        if (tweetText && !checkTweetText(tweetText)) {
            console.log('invalid tweet text')
            return res.status(statusCode.badRequest).json({
                message: "invalid tweet text",
            });
        }

        //NEO4J
        const query = `
            MATCH (user:User {id: $userId})
            CREATE (tweet:Tweet {
                tweetType: $tweetType,
                tweetText: $tweetText,
                createdAt: TIMESTAMP(),
                is_deleted: false
            })<-[:POSTED_BY]-(user)
            RETURN tweet
        `;

        const params = {
            userId: req.user.id,
            tweetType,
            tweetText,
        };

        const result = await session.run(query, params);
        const createdTweet = result.records[0].get('tweet').properties;

        return res.status(statusCode.created).json({
            status: 'success',
            data: {
                tweet: createdTweet,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(statusCode.internalServerError).json({
            message: err,
        });
    }
};

const updateTweet = async (req, res) => {

const { tweetId, tweetText, tags } = req.body;
  try {
    if (!tweetId || !tweetText) {
        console.log('no tweet id or text', req.body)
      res.status(statusCode.badRequest).json({
        message: "tweetId is required and tweeText are required in body ",
      });
    }
    const resolveTweetText = checkTweetText(tweetText);
    console.log('resolveTweetText', resolveTweetText)
    if (!resolveTweetText) {
        return res.status(statusCode.badRequest).json({
            message: "tweetText is too long or invalid",
        });
    }
    const updateTweet = await tweetModel.findOneAndUpdate(
      { 
        _id: tweetId, 
        userId: req.user.id, 
        $or: [
            { is_deleted: false }, 
            { is_deleted: { $exists: false } }
        ],
        $or: [
            { tweetType: 'tweet' },
            { tweetType: 'quote' },
            { tweetType: 'reply' }
        ]
    },
      {
        $set: { tweetText: resolveTweetText, tags, is_edited: true},
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updateTweet) {
      res.status(statusCode.notFound).json({
        message: "No tweet found with that ID",
      });
    }

    res.status(statusCode.success).json({
        message: "Tweet updated successfully",
        tweet: updateTweet
    });
  } catch (err) {
    res.status(statusCode.queryError).json({
      message: err,
    });
  }
};

const deleteTweet = async (req, res) => {


    try {

        const { tweetId, action } = req.body;
        if (!tweetId) throw new Error('tweetId is required in body')

        // start transaction to remove interactions and tweet

        if (action === 'undo-retweet') { // delete to avoid repost abuse
            const retweet = await tweetModel.findOneAndDelete({
                reference_id: tweetId,
                userId: req.user.id,
                tweetType: 'retweet'
            })
            if (!retweet) {
                return res.status(statusCode.notFound).json({
                    message: "No retweet found",
                });
            }
            return res.status(statusCode.success).json({
                message: "Retweet undone successfully",
                tweetType: 'retweet'
            });
        }else {

        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
                

                const tweet = await tweetModel.findOneAndUpdate({ 
                        _id: tweetId, 
                        $or: [
                            { is_deleted: false }, 
                            { is_deleted: { $exists: false } }
                        ]
                    }, { 
                        $set: { 
                            is_deleted: true, 
                            tweetMedia: null,
                            tweetText: "This tweet has been deleted by the user or the admin X",
                            tags: [],
                            poll: null,
                            reference_id: null,
                            tweetType: 'deleted'
                        }  
                    }, { session });

                    if (!tweet) {
                        throw new Error('No tweet found with that ID');
                    }

                // delete all interactions
                    await Interaction.updateMany({ tweetId: tweetId }, { is_deleted: true }, { session });
                // console.log('tweet delete', tweet)
                
                });

                res.status(statusCode.success).json({
                    message: "Tweet deleted successfully",
                    });

                }

    } catch (err) {
        console.log(err)
        res.status(statusCode.queryError).json({
            message: "error deleting the tweet" ,
        });
    }
};

const getReplies = async (req, res) => {
    try {

        const { id } = req.params
        try {

            const tweet = await tweetModel.findOne({ _id: new ObjectId(id), $or: [
                { is_deleted: false }, 
                { is_deleted: { $exists: false } }
            ] });
            if (!tweet) throw new Error("invalid id")
        }catch (err){
            console.log(err)
            return (
                res.status(statusCode.notFound).json({
                    message: "No tweet found with that ID",
                })
            );
        }
        
        const replies = await tweetQuery({matchOptions:{ reference_id: new ObjectId(req.params.id), tweetType: 'reply' }, currentUID: req.user.id});
        const users = await Promise.all(replies.map(async (reply) => {
        const user = await session.run(
            `MATCH (u:User {id: $userId}) RETURN u.id AS id, u.username AS username, u.name AS name, u.profile_pic AS profile_pic`,
            { userId: reply.userId }
        );
                
            return user.records[0].toObject();
        }));

    } catch (err) {
        console.log(err)
        res.status(statusCode.notFound).json({
            status: "fail",
            message: "error finding the tweet", err,
        });
    }
}



const likeTweet = async (req, res) => {
    try {
        const { tweetId, willLike } = req.body
        // console.log(tweetId, isLiked)
        const tweet = await tweetModel.findOne({ _id: tweetId, $or: [
            { is_deleted: false }, 
            { is_deleted: { $exists: false } }
        ] });
        if (!tweet) {
            return (
                res.status(statusCode.notFound).json({
                    status: "fail",
                    message: "No tweet found with that ID",
                })
            );
        }

        const tweetOptions = { tweet_id: tweetId, userId: req.user.id, interactionType: 'like' }
        const currentLikeInteraction = await Interaction.findOne(tweetOptions);
        let likeInteraction;
        if (currentLikeInteraction) {
            const outOfSync = ((willLike && !currentLikeInteraction.is_deleted) || (!willLike && currentLikeInteraction.is_deleted))
            // if the user has liked and but it is already is_deleted only need to trigger a color not number to reflect that it is deleted and vice versa --usedb to sync -- ithink

            if (outOfSync) {
                return res.status(statusCode.success).json({
                    is_liked: !currentLikeInteraction.is_deleted,
                })
            } else {
                likeInteraction = await Interaction.findOneAndUpdate(tweetOptions, { is_deleted: !currentLikeInteraction.is_deleted }, { new: true });
            }
        } else {
            likeInteraction = new Interaction(tweetOptions);
        }

    await likeInteraction.save();
    res.status(statusCode.success).json({
      is_liked: !likeInteraction.is_deleted,
    });
  } catch (err) {
    console.log("liking error : ", err);
    res.status(statusCode.badRequest).json({
      status: "fail",
      message: "error liking the tweet" + err.message,
    });
  }
};

const bookmarkTweet = async (req, res) => {
    try {
        const { tweetId, willBookmark } = req.body
        const tweet = await tweetModel.findOne({ _id: tweetId, $or: [
            { is_deleted: false }, 
            { is_deleted: { $exists: false } }
        ] });
        if (!tweet) {
            return (
                res.status(statusCode.notFound).json({
                    status: "fail",
                    message: "No tweet found with that ID",
                })
            );
        }

        const tweetOptions = { tweet_id: tweetId, userId: req.user.id, interactionType: 'bookmark' }
        const currentBoomarkInteraction = await Interaction.findOne(tweetOptions);
        let bookmarkedInteraction;
        if (currentBoomarkInteraction) {
            const outOfSync = ((willBookmark && !currentBoomarkInteraction.is_deleted) || (!willBookmark && currentBoomarkInteraction.is_deleted))

            if (outOfSync) {
                return res.status(statusCode.success).json({
                    is_bookmarked: !currentBoomarkInteraction.is_deleted,
                })
            } else {
                bookmarkedInteraction = await Interaction.findOneAndUpdate(tweetOptions, { is_deleted: !currentBoomarkInteraction.is_deleted }, { new: true });
            }
        } else {
            bookmarkedInteraction = new Interaction(tweetOptions);
        }

    await bookmarkedInteraction.save();

        res.status(statusCode.success).json({
            is_bookmarked: !bookmarkedInteraction.is_deleted,
        });

    } catch (err) {
        console.log(err)
        res.status(statusCode.badRequest).json({
            message: "error bookmarking the tweet" + err.message
        });
    }
}

const highlightTweet = async (req, res) => {
    try {
        const { tweetId, willHighlight } = req.body
        if (!tweetId) {
            return res.status(statusCode.badRequest).json({
                message: "tweetId is required in body"
            });
        }
        const tweet = await tweetModel.findOneAndUpdate({ 
            _id: tweetId,
            userId: req.user.id, 
            $or: [
                { is_deleted: false }, 
                { is_deleted: { $exists: false } }
            ]
        }, { is_highlighted: willHighlight }, { new: true });
        if (!tweet) {
            return res.status(statusCode.notFound).json({
                message: "No tweet found"
            });
        }

        res.status(statusCode.success).json({
            is_highlighted: tweet.is_highlighted
        })

    }catch(err) {
        res.status(statusCode.queryError).json({
            message: "error highlighting the tweet"
        });
    
    }
}

const getTrendingTags = async (req, res) => {
    try {
        const trends = await tweetModel.aggregate([
            { $match: { tweetType: 'tweet' } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $project: { _id: 0, tag: "$_id", count: 1 } },
            { $sort: { count: -1, tag: 1} },
            { $limit: 10 },
        ]);

        res.status(statusCode.success).json({
                trends,
        });
    }
    catch (err) {
        res.status(statusCode.queryError).json({
            message: "error finding the tweet", err,
        });
    }
}

const getTags = async (req, res) => {
    try {
        const { q } = req.query;

        const pipeline = [
            {
                $match: {
                    tags: { $regex: q, $options: 'i' }
                }
            },
            {
                $unwind: '$tags' 
            },
            {
                $match: {
                    tags: { $regex: q, $options: 'i' } 
                }
            },
            {
                $group: {
                    _id: null,
                    tags: { $addToSet: '$tags' }
                }
            },
            {
                $project: {
                    _id: 0, 
                    tags: {'$slice': ['$tags', 6]}
                }
            }
        ];

        const tagsQuery = await tweetModel.aggregate(pipeline);
        const tags = tagsQuery[0] ?? [];
        console.log(tags)
        res.status(statusCode.success).json({ tags });
    } catch (error) {
        res.status(statusCode.queryError).json({ error: error.message });
    }
}

const getTweetsByTag = async(req, res) => {

    try {
        const { q } = req.query;
        const tweets = await tweetQuery({matchOptions:{ tags: { $regex: q, $options: 'i' } }, currentUID:req.user.id});
        res.status(statusCode.success).json({
            tweets,
        });
        
    }
    catch (err) {
        console.log(err)
        res.status(statusCode.queryError).json({
            message: "error finding tags", err,
        });
    }

}

module.exports = {
    getAllTweets,
    getTweetById,
    createTweet,
    updateTweet,
    deleteTweet,
    likeTweet,
    getTweetsByCategory,
    bookmarkTweet,
    getReplies,
    highlightTweet,
    getTrendingTags,
    getTags,
    getTweetsByTag

};