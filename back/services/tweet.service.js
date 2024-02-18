const tweetModel = require('../models/tweetModel');
const pollModel = require('../models/pollModel');
const Interaction = require('../models/interactionModel');
const statusCode = require('../constants/statusCode');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const pool = require("../database/db_setup");
const { tweetQuery, allFollowers } = require('../utils/tweet.utils');



const getAllTweets = async (req, res) => {
    try {
        const tweets = await tweetQuery({tweetType: 'tweet'},req.user.id)

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
    const tweets = await tweetQuery({ _id: new ObjectId(req.params.id) },req.user.id)
    const tweet = tweets[0]
    if (!tweet) {
        return res.status(statusCode.badRequest).json({
            status: "fail",
            message: "No tweet found with that ID",
        });
    }

    console.log('tweet by id', tweet)


    return res.status(statusCode.success).json({
        status: "success",
        data: {
            tweet,
        },
    })
};

const getTweetsByCategory = async (req, res) => {
    const { category } = req.params;
    console.log(req.user)


    const categoryConditions = {
        'foryou': { userId: { $ne: req.user.id } },
        'following': {},
        'likes': { userLiked: 1 },
        'bookmarks': { userBookmarked: 1 },
        'retweets': { tweetType: 'retweet', userId: req.user.id },
        'mytweets': { userId: req.user.id },
    }

        if(!categoryConditions[category]) return res.status(statusCode.badRequest).json({
            status: "fail",
            message: "Invalid category",
        });
        let tweets;
        try{

        if(category  === 'following'){
            const following = await allFollowers(req.user.id);
            const followingIds = following.map(follower => follower.following);
            console.log(followingIds)
            tweets = await tweetQuery({userId : { $in: followingIds} },req.user.id)
        } else {
            tweets = await tweetQuery(categoryConditions[category],req.user.id);
        }
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

        const { tweetType, tweetText, tweetPoll, reference_id } = newTweetData;


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

        if (req.file) {

            await import('file-type').then(async ({ fileTypeFromBuffer }) => {
                const { mime } = await fileTypeFromBuffer(req.file.buffer)
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
                } else if (poll_options.some(option => !option.text || option.text.length > 25)) {
                    throw Error("Invalid poll data")
                } else if (!tweetPoll.duration || tweetPoll.duration.days < 1 || tweetPoll.duration.hours < 1 || tweetPoll.duration.minutes < 1 ||
                    tweetPoll.duration.days > 7 || tweetPoll.duration.hours > 24 || tweetPoll.duration.minutes > 60) {
                    throw Error("Invalid poll duration")
                }
                const pollExpiration = new Date(Date.now() + (tweetPoll.duration.days * 24 * 60 * 60 * 1000) + (tweetPoll.duration.hours * 60 * 60 * 1000) + (tweetPoll.duration.minutes * 60 * 1000));

                const poll = new pollModel({ options: poll_options, poll_end: pollExpiration });
                console.log(poll, tweet);
                tweet.poll = poll._id;
                poll.tweet_id = tweet._id;
                console.log(tweet);
                await poll.save({ session });

            }

        });

        if (!originalTweet) {
            tweet.reference_id = reference_id
        }

        await tweet.save(); // enum will throw tweet type error or maybe set explicitly idk

        const user = await pool.query(`SELECT id, username, name, profile_pic FROM users WHERE id = $1`, [ req.user.id ]);
        let tweetData = tweet.toObject();
        // Adding since front end is different query
        tweetData.user = user.rows[0];
        tweetData.totalLikes = 0,
        tweetData.totalBookmarks=0,
        tweetData.totalComments=0,
        tweetData.totalVotes=0,
        tweetData.userLiked=0,
        tweetData.userRetweeted=0,
        tweetData.userBookmarked=0,
        tweetData.userVoted=0,
        tweetData.totalComments = 0;
        tweetData.totalRetweets = 0;
        tweetData.userRetweeted = 0;



        if (tweetType === 'tweet') {
            // emit socket to push notify feed

        }

        // TODO add: to redux feed on front
        res.status(statusCode.success).json({
            tweet: tweetData,
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
    try {
        const replies = await tweetQuery({ reference_id: new ObjectId(req.params.id), tweetType: 'reply' },req.user.id);
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
    console.log(req.user.id)
    try {
        const { tweetId, isLiked } = req.body
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

        const currentLikeInteraction = await Interaction.findOne({ tweet_id: tweetId, userId: req.user.id, interactionType: 'like' });
        let likeInteraction;
        if (currentLikeInteraction) {
            const outOfSync = ((isLiked && currentLikeInteraction.is_deleted) || (!isLiked && !currentLikeInteraction.is_deleted))
            // if the user has liked and but it is already is_deleted only need to trigger a color not number to reflect that it is deleted and vice versa --usedb to sync -- ithink

            if (outOfSync) {
                return res.status(statusCode.success).json({
                    is_liked: !currentLikeInteraction.is_deleted,
                })
            } else {
                likeInteraction = await Interaction.findOneAndUpdate({ tweet_id: req.body.tweetId, userId: req.user.id, interactionType: 'like' }, { is_deleted: !currentLikeInteraction.is_deleted }, { new: true });
            }
        } else {
            likeInteraction = new Interaction({ tweet_id: req.body.tweetId, userId: req.body.userId, interactionType: 'like' });
        }

        await likeInteraction.save();
        res.status(statusCode.success).json({
            is_liked: !likeInteraction.is_deleted,
        });

    } catch (err) {
        res.status(statusCode.badRequest).json({
            status: "fail",
            message: "error liking the tweet" + err.message
        });
    }
}

const bookmarkTweet = async (req, res) => {
    try {
        const { tweetId, isBookmarked } = req.body
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

        const currentBoomarkInteraction = await Interaction.findOne({ tweet_id: tweetId, userId: req.user.id, interactionType: 'bookmark' });
        let bookmarkedInteraction;
        if (currentBoomarkInteraction) {
            const outOfSync = ((isBookmarked && currentBoomarkInteraction.is_deleted) || (!isBookmarked && !currentBoomarkInteraction.is_deleted))

            if (outOfSync) {
                return res.status(statusCode.success).json({
                    is_bookmarked: !currentBoomarkInteraction.is_deleted,
                })
            } else {
                bookmarkedInteraction = await Interaction.findOneAndUpdate({ tweet_id: tweetId, userId: req.user.id, interactionType: 'bookmark' }, { is_deleted: !currentBoomarkInteraction.is_deleted }, { new: true });
            }
        } else {
            bookmarkedInteraction = new Interaction({ tweet_id: tweetId, userId: req.user.id, interactionType: 'bookmark' });
        }

        await bookmarkedInteraction.save();

        res.status(statusCode.success).json({
            is_bookmarked: !bookmarkedInteraction.is_deleted,
        });

    } catch (err) {
        res.status(statusCode.badRequest).json({
            status: "fail",
            message: "error bookmarking the tweet" + err.message
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
    getTweetsByCategory,
    // retweetTweet,
    bookmarkTweet,
    getReplies,
};

