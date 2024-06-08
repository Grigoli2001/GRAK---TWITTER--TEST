const tweetModel = require("../models/tweetModel");
const pollModel = require("../models/pollModel");
const Interaction = require("../models/interactionModel");
const statusCode = require("../constants/statusCode");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
// const pool = require("../database/db_setup");
const { tweetQuery, checkTweetText } = require('../utils/tweet.utils');
const { getUserFullDetails, allFollowers } = require('../utils/user.utils');

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
                tweets = await tweetQuery({matchOptions:{userId : { $in: followingIds} }, currentUID:req.user.id, page:resolvePage})
            }else{
                tweets = await tweetQuery({matchOptions: {userId : { $nin: followingIds} }, currentUID:req.user.id, page:resolvePage})
            }
        } else {
            tweets = await tweetQuery({
                matchOptions: categoryConditions[category], 
                currentUID:userid, 
                page:resolvePage, 
                sort:category==='replies' ? 1 : -1, 
                sortByInteraction: category === 'likes' ? 'like' : category === 'bookmarks'?'bookmark' : null
            });
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
    return res.status(statusCode.serverError).json({
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
                    message: "You have already retweeted this tweet",
                });
            }
        }

       const resolveTweetText = checkTweetText(tweetText);
        if (resolveTweetText === false) {
            return res.status(statusCode.badRequest).json({
                message: "tweetText is too long or invalid",
            });
        }
        newTweetData.tweetText = resolveTweetText;


        // if (req.file) {

        //     await import('file-type').then(async ({ fileTypeFromBuffer }) => {
        //         const { mime } = await fileTypeFromBuffer(req.file.buffer)
        //         if (!mime.startsWith('image') && !mime.startsWith('video')) {
        //             throw new Error('Invalid file type, only JPEG, PNG and MP4 is allowed!');
        //         }
        //     })

            // do firebase here

            // newTweetData.tweetMedia = {
            //     data: req.file.buffer,
            //     contentType: req.file.mimetype,
            // };
        // }

        let originalTweet;
        if (reference_id) {
            // console.log('ref id', reference_id)
            originalTweet = await tweetModel.findOne({ _id: reference_id,  $or: [
                { is_deleted: false }, 
                { is_deleted: { $exists: false } }
            ] });
            if (!originalTweet) {
                console.log('no original tweet')
                return res.status(statusCode.badRequest).json({
                    status: "fail",
                    message: "No tweet found with that reference ID",
                });
            } 
        }

       

        // create transaction to ensure if poll fails, tweet is not created -- must convert to replica set to use transactions
        newTweetData.userId = req.user.id
        const tweet = new tweetModel(newTweetData);
        

        const session = await mongoose.startSession();
        await session.withTransaction(async () => {

            // filter out any undefined or null values
            if (tweetPoll) {
                const poll_options = tweetPoll?.choices.filter(option => !!option);
                if (poll_options?.length < 2 || poll_options?.length > 4) {
                    throw Error("Poll must have between 2 and 4 options");
                } else if (poll_options.some(option => !option.text || option.text.length > 25)) {
                    throw Error("Invalid poll data")
                } else if (!tweetPoll.duration || tweetPoll.duration.days < 1 || tweetPoll.duration.hours < 1 || tweetPoll.duration.minutes < 1 ||
                    tweetPoll.duration.days > 7 || tweetPoll.duration.hours > 24 || tweetPoll.duration.minutes > 60) {
                    throw Error("Invalid poll duration")
                }
                const pollExpiration = new Date(Date.now() + (tweetPoll.duration.days * 24 * 60 * 60 * 1000) + (tweetPoll.duration.hours * 60 * 60 * 1000) + (tweetPoll.duration.minutes * 60 * 1000));

                const poll = new pollModel({ options: poll_options, poll_end: pollExpiration });
                tweet.poll = poll._id;
                poll.tweet_id = tweet._id;
                await poll.save({ session });

            }

            
                    if (!originalTweet) {
                        tweet.reference_id = reference_id;
                    }
                
                    await tweet.save({ session }); // enum will throw tweet type error or maybe set explicitly idk

        });

        const user = await getUserFullDetails(req.user.id, 'id');
        
        let tweetData = tweet.toObject();
        // Adding since front end is different query
        tweetData.user = user
        tweetData.totalLikes = 0,
        tweetData.totalBookmarks=0,
        tweetData.totalVotes=0,
        tweetData.userLiked=0,
        tweetData.userRetweeted = 0,
        tweetData.userBookmarked=0,
        tweetData.userVoted=0,
        tweetData.totalReplies = 0;
        tweetData.totalRetweets = 0;
        tweetData.userRetweeted = 0;
        if (originalTweet) {
            tweetData.reference = originalTweet;
        }

        res.status(statusCode.success).json({
            tweet: tweetData,
            data: {
                is_retweeted: tweetType === 'retweet',
            }
        });

    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            res.status(statusCode.badRequest).json({
                status: "fail",
                message: "Invalid data provided",
                errors: err.errors,
            });
        } else {
            res.status(statusCode.serverError).json({
                status: "error",
                message: err.message || "Some error occurred while creating the tweet.",
            });
        }
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
    res.status(statusCode.serverError).json({
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
        res.status(statusCode.serverError).json({
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
        for (let i = 0; i < replies.length; i++) {
         const user = await getUserFullDetails(replies[i].userId, 'id');
        // const user = await pool.query(
        //     `SELECT id, username, name, profile_pic FROM users WHERE id = ${replies[i].userId}`
        // );
            replies[i].user = user;
        }
        return res.status(statusCode.success).json({
                replies
        });

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
        res.status(statusCode.serverError).json({
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
        res.status(statusCode.serverError).json({
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
        res.status(statusCode.serverError).json({ error: error.message });
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
        res.status(statusCode.serverError).json({
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
