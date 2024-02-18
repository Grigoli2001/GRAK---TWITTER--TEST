const tweetModel = require('../models/tweetModel');
const pollModel = require('../models/pollModel');
const Interaction = require('../models/interactionModel');
const statusCode = require('../constants/statusCode');
const mongoose = require('mongoose');
const pool = require("../database/db_setup");
// todo add page size for scroll and filters t
const getAllTweets = async (req, res) => {
    try {
        const tweets =  await tweetModel.aggregate([
            {
                $match: { tweetType: 'tweet' },
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
                                cond: { $and: [{ $eq: ["$$interaction.interactionType", "like"] },  { $eq: ["$$interaction.is_deleted", false] },]}
                            },
                        },
                    },
                    totalBookmarks: {
                        $size: {
                            $filter: {
                                input: "$interactions",
                                as: "interaction",
                                cond: { $and: [{ $eq: ["$$interaction.interactionType", "bookmark"] },  { $eq: ["$$interaction.is_deleted", false] },]}

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
                                cond: { $and: [{ $eq: ["$$interaction.interactionType", "like"] },  { $eq: ["$$interaction.is_deleted", false] }, { $eq: ["$$interaction.userId", 3] }] },
                            },
                        },
                    },
                    userBookmarked: {  
                        $size: {
                            $filter: {
                                input: "$interactions",
                                as: "interaction",
                                cond: { $and: [{ $eq: ["$$interaction.interactionType", "bookmarked"] }, { $eq: ["$$interaction.is_deleted", false] }, { $eq: ["$$interaction.userId", 3] }] },
                            },
                        } 
                    },
                    userVoted:{
                        $arrayElemAt : [{
                            $filter: {
                                input: "$interactions",
                                as: "interaction",
                                cond: { $and: [{ $eq: ["$$interaction.interactionType", "vote"] }, { $eq: ["$$interaction.userId", 3] }] },
                        
                        },
                    }, 0]
                    },
                
                },
            },
            {
                $project: {
                    tweetType: 1,
                    tweetText: 1,
                    tweetMedia: 1,
                    userId: 1,
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
            const userRetweeted = await tweetModel.countDocuments({ reference_id: tweet._id, tweetType: 'retweet', userId: 3 });

            
            tweet.totalComments = totalComments;
            tweet.totalRetweets = totalRetweets;
            tweet.userRetweeted = userRetweeted;

            if (!tweet.user){
                const user = await pool.query(`SELECT id, username, name, profile_pic FROM users WHERE id = ${tweet.userId}`);
                tweet.user = user.rows[0];
            }

        })
        );
        // const tweets = await tweetModel.find({referencing_by: { $exists: false }}, null, { sort: { createdAt: -1 }});

        // for (let i = 0; i < tweets.length; i++) {
        //     const user = await pool.query(`SELECT id, username, name FROM users WHERE id = ${tweets[i].userId}`);
        //     tweets[i].user = user.rows[0];
        // }
        res.status(statusCode.success).json({
            status: "success",
            data: {
                tweets,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(statusCode.badRequest).json({
            status: "fail",
            message: err,
        });
    }
};

const getTweetById = async (req, res) => {
    const tweet = await tweetModel.findOne({ _id: req.params.id });

    if (!tweet) {
        return res.status(statusCode.badRequest).json({
            status: "fail",
            message: "No tweet found with that ID",
        });
    }

    const user = await pool.query(`SELECT id, username, name, profile_pic FROM users WHERE id = ${tweet.userId}`);
    tweet.user = user.rows[0];

    if (!tweet) {
        return res.status(statusCode.badRequest).json({
            status: "fail",
            message: "No tweet found with that ID",
        });
    }

    if(user.rowCount === 0) {
       return res.status(statusCode.badRequest).json({
            status: "fail",
            message: "No user found with that ID",
        });
    } else{
    return res.status(statusCode.success).json({
        status: "success",
        data: {
            tweet,
        },
    });
}
};

const createTweet = async (req, res) => {
    try {

        const { data } = req.body;
        console.log(data);
        const newTweetData = JSON.parse(data);
        console.log(newTweetData)
        

        // filter out any undefined o|r null values
        Object.entries(newTweetData).forEach(([key, value]) => {  
            if (value === undefined || value === null) {
                delete newTweetData[key];
            }
        });

        const { tweetType, tweetText, tweetPoll,  reference_id } = newTweetData;


        if (!tweetType) {
            return res.status(statusCode.badRequest).json({
                message: "tweetType is required",
            });
        }

        const originalTweet = tweetType === 'tweet'
        if (!originalTweet && !reference_id) {
            return res.status(statusCode.badRequest).json({
                message: "if not original tweet, reference is required",
            });
        }

        if (originalTweet && reference_id) {
            return res.status(statusCode.badRequest).json({
                message: "should not pass a reference if original tweet",
            });
        }

        if ((!tweetText && !req.file) || (req.file && tweetPoll)) {
            return res.status(statusCode.badRequest).json({
                status: "fail",
                message: "tweetText or tweetMedia is required",
            });
        }
    
        if (req.file){

            await import('file-type').then(async ({ fileTypeFromBuffer }) => {
                const { mime }  = await fileTypeFromBuffer(req.file.buffer)
                if (!mime.startsWith('image') && !mime.startsWith('video')) {
                    throw (new Error('Invalid file type, only JPEG, PNG and MP4 is allowed!'));
                }
              
            })
            newTweetData.tweetMedia = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            };
        }

        // create transaction to ensure if poll fails, tweet is not created -- must convert to replica set to use transactions
        newTweetData.userId = req.user.id;
        const tweet = new tweetModel(newTweetData);

        const session = await mongoose.startSession();
        await session.withTransaction(async () => {

        // filter out any undefined or null values
        if (tweetPoll) {
            const poll_options = tweetPoll?.choices.filter(option => !!option);
            if (poll_options?.length < 2 || poll_options?.length > 4) {
                throw Error("Poll must have between 2 and 4 options");
            }else if(poll_options.some(option => !option.text || option.text.length > 25 )){
               throw Error("Invalid poll data")
            }else if(!tweetPoll.duration || tweetPoll.duration.days < 1 || tweetPoll.duration.hours < 1 || tweetPoll.duration.minutes < 1 || 
                tweetPoll.duration.days > 7 || tweetPoll.duration.hours > 24 || tweetPoll.duration.minutes > 60){
                throw Error("Invalid poll duration")
            }
            const pollExpiration = new Date(Date.now() + (tweetPoll.duration.days * 24 * 60 * 60 * 1000) + (tweetPoll.duration.hours * 60 * 60 * 1000) + (tweetPoll.duration.minutes * 60 * 1000));
           
            const poll = new pollModel({options:poll_options, poll_end: pollExpiration});
            console.log(poll, tweet);
            tweet.poll = poll._id;
            poll.tweet_id = tweet._id;
            console.log(tweet);
            await poll.save({ session });

        }
        
         });

         if (!originalTweet){
            tweet.reference_id = reference_id
         }

         await tweet.save(); // enum will throw tweet type error or maybe set explicitly idk

        

        if (tweetType === 'tweet') {
            // emit socket to push notify feed

        }

        // TODO add: to redux feed on front
        res.status(statusCode.success).json({
                tweet,
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
            res.status(statusCode.queryError).json({
                status: "error",
                message: err.message || "Some error occurred while creating the tweet.",
            });
        }
    }
};

const updateTweet = async (req, res) => {
    try {
        const tweets = await tweetModel.findOneAndUpdate({ tweet_id: req.params.id }, req.body, {
            new: true,
            runValidators: true,
        });

        if (!tweets) {
            res.status(statusCode.badRequest).json({
                status: "fail",
                message: "No tweet found with that ID",
            });
        }

        res.status(204).send();
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err,
        });
    }
};

const deleteTweet = async (req, res) => {
    try {
        const tweets = await tweetModel.findOneAndDelete({ tweet_id: req.params.id });

        if (!tweets) {
            res.status(404).json({
                status: "fail",
                message: "No tweet found with that ID",
            });
        }

        res.status(204).send();

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err,
        });
    }
};

const getReplies = async (req, res) => {
    console.log(req.params.id);
    try {
        const replies = await tweetModel.find({tweetType : "reply", reference_id : req.params.id});
        if (!replies) {
            return (
                res.status(404).json({
                    status: "fail",
                    message: "No tweet found with that ID",
                })
            );
        }

        for (let i = 0; i < replies.length; i++) {
            const user = await pool.query(`SELECT id, username, name, profile_pic FROM users WHERE id = ${replies[i].userId}`);
            replies[i].user = user.rows[0];
        }

        console.log(replies);
        return res.status(statusCode.success).json({
            status: "success",
            data: {
                replies,
            },
        });

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: "error finding the tweet", err,
        });
    }
}


const likeTweet = async (req, res) => {
    try {
        const { tweetId, isLiked, userId } = req.body
        console.log(tweetId, isLiked)
        const tweet = await tweetModel.findById(tweetId);
        if (!tweet) {
            return (
                res.status(statusCode.notFound).json({
                    status: "fail",
                    message: "No tweet found with that ID",
                })
            );
        }

        const currentLikeInteraction = await Interaction.findOne({ tweet_id: tweetId, userId: userId, interactionType: 'like' });
        let likeInteraction;
        if (currentLikeInteraction){
            const outOfSync = ((isLiked && currentLikeInteraction.is_deleted ) || (!isLiked && !currentLikeInteraction.is_deleted))
            // if the user has liked and but it is already is_deleted only need to trigger a color not number to reflect that it is deleted and vice versa --usedb to sync -- ithink
            
            if (outOfSync){
                return res.status(statusCode.success).json({
                    is_liked: !currentLikeInteraction.is_deleted,
                })
            }else {
                likeInteraction = await Interaction.findOneAndUpdate({ tweet_id: req.body.tweetId, userId: req.body.userId, interactionType: 'like' }, { is_deleted: !currentLikeInteraction.is_deleted }, { new: true });
        }
        }else{
            likeInteraction = new Interaction({ tweet_id: req.body.tweetId, userId: req.body.userId, interactionType: 'like' });
        }

        await likeInteraction.save();
        res.status(statusCode.success).json({
            is_liked: !likeInteraction.is_deleted,
        });

    } catch (err) {
        res.status(statusCode.badRequest).json({
            status: "fail",
            message: "error liking the tweet" +  err.message
        });
    }
}

const bookmarkTweet = async (req, res) => {
    try {
        const { tweetId, isBookmarked  } = req.body
        console.log(tweetId, isBookmarked)
        const tweet = await tweetModel.findById(tweetId);
        if (!tweet) {
            return (
                res.status(statusCode.notFound).json({
                    status: "fail",
                    message: "No tweet found with that ID",
                })
            );
        }

        const userId = 3; // replace with user id from token
        const currentBoomarkInteraction = await Interaction.findOne({ tweet_id: tweetId, userId: userId, interactionType: 'bookmark' });
        let bookmarkedInteraction;
        if (currentBoomarkInteraction){
            const outOfSync = ((isBookmarked && currentBoomarkInteraction.is_deleted ) || (!isBookmarked && !currentBoomarkInteraction.is_deleted))
            
            if (outOfSync){
                return res.status(statusCode.success).json({
                    is_bookmarked: !currentBoomarkInteraction.is_deleted,
                })
            }else {
                bookmarkedInteraction = await Interaction.findOneAndUpdate({ tweet_id: tweetId, userId: userId, interactionType: 'bookmark' }, { is_deleted: !currentBoomarkInteraction.is_deleted }, { new: true });
        }
        }else{
            bookmarkedInteraction = new Interaction({ tweet_id: tweetId, userId: userId, interactionType: 'bookmark' });
        }

        await bookmarkedInteraction.save();

        res.status(statusCode.success).json({
            is_bookmarked: !bookmarkedInteraction.is_deleted,
        });

    } catch (err) {
        res.status(statusCode.badRequest).json({
            status: "fail",
            message: "error bookmarking the tweet" +  err.message
        });
    }
}

// const bookmarkTweet = async (req, res) => {
//     try {
//         const tweet = await tweetModel.findById(req.body.tweetId);
//         // console.log(typeof(req.body.tweetId));
//         const userArray = await userModel.find({ userId: req.body.userId});
//         const user = userArray[0];

//         if (!user) {
//             const newUser = await userModel.create({
//                 userId: req.body.userId,
//                 bookMarks: [
//                     { tweetId: req.body.tweetId },
//                 ],
//                 retweets: [],
//             });

//             tweet.tweet_bookmarks.push({ userId: Number(req.body.userId) });
//             await tweet.save();

//             return (
//                 res.status(statusCode.success).json({
//                     status: "success",
//                     data: {
//                         "user": newUser,
//                     },
//                 })
//             );
//         }

//         if (!tweet) {
//             return (
//                 res.status(404).json({
//                     status: "fail",
//                     message: "No found with that ID",
//                 })
//             );
//         }

//         if (tweet.tweet_bookmarks.some(bookmark => bookmark.userId === req.body.userId)) {
//             tweet.tweet_bookmarks = tweet.tweet_bookmarks.filter(bookmark => bookmark.userId !== req.body.userId);
//             user.bookMarks = user.bookMarks.filter(bookmark => bookmark.tweetId !== req.body.tweetId);
//         } else {
//             tweet.tweet_bookmarks.push({ userId: Number(req.body.userId) });
//             user.bookMarks.push({ tweetId: req.body.tweetId });
//         }

//         await tweet.save();
//         await user.save();
//         res.status(204).send();

//     } catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: "error finding the tweet", err,
//         });
//     }
// }

const replyTweet = async (req, res) => {
    try {
        const tweet = await tweetModel.findById(req.body.tweetId);

        if (!tweet) {
            return (
                res.status(404).json({
                    status: "fail",
                    message: "No tweet found with that ID",
                })
            );
        }

        tweet.tweet_comments.push({ user_id: Number(req.body.userId), comment_text: req.body.commentText });
        await tweet.save();
        res.status(204).send();

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: "error finding the tweet", err,
        });
    }
}

// const retweetTweet = async (req, res) => {
//     try {
//         const tweet = await tweetModel.findById(req.body.tweetId);

//         if (!tweet) {
//             return (
//                 res.status(404).json({
//                     status: "fail",
//                     message: "No tweet found with that ID",
//                 })
//             );
//         }

//         if (tweet.tweet_retweets.some(retweet => retweet.userId === req.body.userId)) {
//             tweet.tweet_retweets = tweet.tweet_retweets.filter(retweet => retweet.userId !== req.body.userId);
//             user.retweets = user.retweets.filter(retweet => retweet.tweetId !== req.body.tweetId);
//         } else {
//             tweet.tweet_retweets.push({ userId: Number(req.body.userId) });
//             user.retweets.push({ tweetId: req.body.tweetId });
//         }

//         await tweet.save();
//         await user.save();
//         res.status(204).send();

//     } catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: "error finding the tweet", err,
//         });
//     }
// }

// const bookmarkTweet = async (req, res) => {
//     try {
//         const tweet = await tweetModel.findById(req.body.tweetId);
//         // console.log(typeof(req.body.tweetId));
//         const userArray = await userModel.find({ userId: req.body.userId});
//         const user = userArray[0];

//         if (!user) {
//             const newUser = await userModel.create({
//                 userId: req.body.userId,
//                 bookMarks: [
//                     { tweetId: req.body.tweetId },
//                 ],
//                 retweets: [],
//             });

//             tweet.tweet_bookmarks.push({ userId: Number(req.body.userId) });
//             await tweet.save();

//             return (
//                 res.status(statusCode.success).json({
//                     status: "success",
//                     data: {
//                         "user": newUser,
//                     },
//                 })
//             );
//         }

//         if (!tweet) {
//             return (
//                 res.status(404).json({
//                     status: "fail",
//                     message: "No found with that ID",
//                 })
//             );
//         }

//         if (tweet.tweet_bookmarks.some(bookmark => bookmark.userId === req.body.userId)) {
//             tweet.tweet_bookmarks = tweet.tweet_bookmarks.filter(bookmark => bookmark.userId !== req.body.userId);
//             user.bookMarks = user.bookMarks.filter(bookmark => bookmark.tweetId !== req.body.tweetId);
//         } else {
//             tweet.tweet_bookmarks.push({ userId: Number(req.body.userId) });
//             user.bookMarks.push({ tweetId: req.body.tweetId });
//         }

//         await tweet.save();
//         await user.save();
//         res.status(204).send();

//     } catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: "error finding the tweet", err,
//         });
//     }
// }

// const replyTweet = async (req, res) => {
//     try {
//         const tweet = await tweetModel.findById(req.body.tweetId);

//         if (!tweet) {
//             return (
//                 res.status(404).json({
//                     status: "fail",
//                     message: "No tweet found with that ID",
//                 })
//             );
//         }

//         tweet.tweet_comments.push({ user_id: Number(req.body.userId), comment_text: req.body.commentText });
//         await tweet.save();
//         res.status(204).send();

//     } catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: "error finding the tweet", err,
//         });
//     }
// }

// const retweetTweet = async (req, res) => {
//     try {
//         const tweet = await tweetModel.findById(req.body.tweetId);

//         if (!tweet) {
//             return (
//                 res.status(404).json({
//                     status: "fail",
//                     message: "No tweet found with that ID",
//                 })
//             );
//         }

//         if (tweet.tweet_retweets.some(retweet => retweet.userId === req.body.userId)) {
//             tweet.tweet_retweets = tweet.tweet_retweets.filter(retweet => retweet.userId !== req.body.userId);
//             user.retweets = user.retweets.filter(retweet => retweet.tweetId !== req.body.tweetId);
//         } else {
//             tweet.tweet_retweets.push({ userId: Number(req.body.userId) });
//             user.retweets.push({ tweetId: req.body.tweetId });
//         }

//         await tweet.save();
//         await user.save();
//         res.status(204).send();

//     } catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: "error finding the tweet", err,
//         });
//     }
// }

// const bookmarkTweet = async (req, res) => {
//     try {
//         const tweet = await tweetModel.findById(req.body.tweetId);
//         // console.log(typeof(req.body.tweetId));
//         const userArray = await userModel.find({ userId: req.body.userId});
//         const user = userArray[0];

//         if (!user) {
//             const newUser = await userModel.create({
//                 userId: req.body.userId,
//                 bookMarks: [
//                     { tweetId: req.body.tweetId },
//                 ],
//                 retweets: [],
//             });

//             tweet.tweet_bookmarks.push({ userId: Number(req.body.userId) });
//             await tweet.save();

//             return (
//                 res.status(statusCode.success).json({
//                     status: "success",
//                     data: {
//                         "user": newUser,
//                     },
//                 })
//             );
//         }

//         if (!tweet) {
//             return (
//                 res.status(404).json({
//                     status: "fail",
//                     message: "No found with that ID",
//                 })
//             );
//         }

//         if (tweet.tweet_bookmarks.some(bookmark => bookmark.userId === req.body.userId)) {
//             tweet.tweet_bookmarks = tweet.tweet_bookmarks.filter(bookmark => bookmark.userId !== req.body.userId);
//             user.bookMarks = user.bookMarks.filter(bookmark => bookmark.tweetId !== req.body.tweetId);
//         } else {
//             tweet.tweet_bookmarks.push({ userId: Number(req.body.userId) });
//             user.bookMarks.push({ tweetId: req.body.tweetId });
//         }

//         await tweet.save();
//         await user.save();
//         res.status(204).send();

//     } catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: "error finding the tweet", err,
//         });
//     }
// }

// const replyTweet = async (req, res) => {
//     try {
//         const tweet = await tweetModel.findById(req.body.tweetId);

//         if (!tweet) {
//             return (
//                 res.status(404).json({
//                     status: "fail",
//                     message: "No tweet found with that ID",
//                 })
//             );
//         }

//         tweet.tweet_comments.push({ user_id: Number(req.body.userId), comment_text: req.body.commentText });
//         await tweet.save();
//         res.status(204).send();

//     } catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: "error finding the tweet", err,
//         });
//     }
// }

// const retweetTweet = async (req, res) => {
//     try {
//         const tweet = await tweetModel.findById(req.body.tweetId);

//         if (!tweet) {
//             return (
//                 res.status(404).json({
//                     status: "fail",
//                     message: "No tweet found with that ID",
//                 })
//             );
//         }

//         if (tweet.tweet_retweets.some(retweet => retweet.userId === req.body.userId)) {
//             tweet.tweet_retweets = tweet.tweet_retweets.filter(retweet => retweet.userId !== req.body.userId);
//             user.retweets = user.retweets.filter(retweet => retweet.tweetId !== req.body.tweetId);
//         } else {
//             tweet.tweet_retweets.push({ userId: Number(req.body.userId) });
//             user.retweets.push({ tweetId: req.body.tweetId });
//         }

//         await tweet.save();
//         await user.save();
//         res.status(204).send();

//     } catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: "error finding the tweet", err,
//         });
//     }
// }

// const bookmarkTweet = async (req, res) => {
//     try {
//         const tweet = await tweetModel.findById(req.body.tweetId);
//         // console.log(typeof(req.body.tweetId));
//         const userArray = await userModel.find({ userId: req.body.userId});
//         const user = userArray[0];

//         if (!user) {
//             const newUser = await userModel.create({
//                 userId: req.body.userId,
//                 bookMarks: [
//                     { tweetId: req.body.tweetId },
//                 ],
//                 retweets: [],
//             });

//             tweet.tweet_bookmarks.push({ userId: Number(req.body.userId) });
//             await tweet.save();

//             return (
//                 res.status(statusCode.success).json({
//                     status: "success",
//                     data: {
//                         "user": newUser,
//                     },
//                 })
//             );
//         }

//         if (!tweet) {
//             return (
//                 res.status(404).json({
//                     status: "fail",
//                     message: "No found with that ID",
//                 })
//             );
//         }

//         if (tweet.tweet_bookmarks.some(bookmark => bookmark.userId === req.body.userId)) {
//             tweet.tweet_bookmarks = tweet.tweet_bookmarks.filter(bookmark => bookmark.userId !== req.body.userId);
//             user.bookMarks = user.bookMarks.filter(bookmark => bookmark.tweetId !== req.body.tweetId);
//         } else {
//             tweet.tweet_bookmarks.push({ userId: Number(req.body.userId) });
//             user.bookMarks.push({ tweetId: req.body.tweetId });
//         }

//         await tweet.save();
//         await user.save();
//         res.status(204).send();

//     } catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: "error finding the tweet", err,
//         });
//     }
// }

// const replyTweet = async (req, res) => {
//     try {
//         const tweet = await tweetModel.findById(req.body.tweetId);

//         if (!tweet) {
//             return (
//                 res.status(404).json({
//                     status: "fail",
//                     message: "No tweet found with that ID",
//                 })
//             );
//         }

//         tweet.tweet_comments.push({ user_id: Number(req.body.userId), comment_text: req.body.commentText });
//         await tweet.save();
//         res.status(204).send();

//     } catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: "error finding the tweet", err,
//         });
//     }
// }



module.exports = {
    getAllTweets,
    getTweetById,
    createTweet,
    updateTweet,
    deleteTweet,
    likeTweet,
    // retweetTweet,
    bookmarkTweet,
    getReplies,
};

