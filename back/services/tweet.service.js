const tweetModel = require('../models/tweetModel');
const userModel = require('../models/userModel');
const statusCode = require('../constants/statusCode');

const getAllTweets = async (req, res) => {
    try {
        const tweets = await tweetModel.find();
        res.status(statusCode.success).json({
            status: "success",
            data: {
                tweets,
            },
        });
    } catch (err) {
        res.status(statusCode.badRequest).json({
            status: "fail",
            message: err,
        });
    }
};

const getTweetById = async (req, res) => {
    const tweets = await tweetModel.findOne({ tweet_id: req.params.id });

    if (!tweets) {
        res.status(statusCode.badRequest).json({
            status: "fail",
            message: "No tweet found with that ID",
        });
    }

    res.status(statusCode.success).json({
        status: "success",
        data: {
            tweets,
        },
    });
};

const createTweet = async (req, res) => {
    try {
        const tweetMediaData = {
            data: req.file.buffer,
            contentType: req.file.mimetype,
        };

        if( req.body.tweetSchedule ) {
            const newTweet = await tweetModel.create({
                tweetType: req.body.tweetType,
                userId: req.body.userId,
                tweetText: req.body.tweetText,
                tweetSchedule: req.body.tweetSchedule,
                tweetMedia: tweetMediaData,
            });

            res.status(statusCode.success).json({
                status: "success",
                data: {
                    "tweet": newTweet,
                },
            });
        } else {

            const newTweet = await tweetModel.create({
                tweetType: req.body.tweetType,
                userId: req.body.userId,
                tweetText: req.body.tweetText,
                tweetMedia: tweetMediaData,
            });
            
            res.status(statusCode.success).json({
                status: "success",
                data: {
                    "tweet": newTweet,
                },
            });
        }

    } catch (err) {
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

const likeTweet = async (req, res) => {
    try {
        const tweet = await tweetModel.findById(req.body.tweetId);

        console.log(tweet);
        if (!tweet) {
            return (
                res.status(404).json({
                    status: "fail",
                    message: "No tweet found with that ID",
                })
            );
        }

        if (tweet.tweet_likes.some(like => like.userId === req.body.userId)) {
            console.log("the problem is in if");
            tweet.tweet_likes = tweet.tweet_likes.filter(like => like.userId !== req.body.userId);
            await tweet.save();
            return res.status(204).send();
        }

        console.log("the problem is here");
        tweet.tweet_likes.push({ userId: Number(req.body.userId) });
        await tweet.save();
        res.status(204).send();

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: "error finding the tweet", err,
        });
    }
}

const retweetTweet = async (req, res) => {
    try {
        const tweet = await tweetModel.findById(req.body.tweetId);
        const userArray = await userModel.find({ userId: req.body.userId});
        const user = userArray[0];

        if (!user) {
            const newUser = await userModel.create({
                userId: req.body.userId,
                bookMarks: [],
                retweets: [
                    { tweetId: req.body.tweetId },
                ],
            });

            tweet.tweet_retweets.push({ userId: Number(req.body.userId) });
            await tweet.save();

            return (
                res.status(statusCode.success).json({
                    status: "success",
                    data: {
                        "user": newUser,
                    },
                })
            );
        }

        if (!tweet) {
            return (
                res.status(404).json({
                    status: "fail",
                    message: "No tweet found with that ID",
                })
            );
        }

        if (tweet.tweet_retweets.some(retweet => retweet.userId === req.body.userId)) {
            tweet.tweet_retweets = tweet.tweet_retweets.filter(retweet => retweet.userId !== req.body.userId);
            user.retweets = user.retweets.filter(retweet => retweet.tweetId !== req.body.tweetId);
        } else {
            tweet.tweet_retweets.push({ userId: Number(req.body.userId) });
            user.retweets.push({ tweetId: req.body.tweetId });
        }

        await tweet.save();
        await user.save();
        res.status(204).send();

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: "error finding the tweet", err,
        });
    }
}

const bookmarkTweet = async (req, res) => {
    try {
        const tweet = await tweetModel.findById(req.body.tweetId);
        // console.log(typeof(req.body.tweetId));
        const userArray = await userModel.find({ userId: req.body.userId});
        const user = userArray[0];

        if (!user) {
            const newUser = await userModel.create({
                userId: req.body.userId,
                bookMarks: [
                    { tweetId: req.body.tweetId },
                ],
                retweets: [],
            });

            tweet.tweet_bookmarks.push({ userId: Number(req.body.userId) });
            await tweet.save();

            return (
                res.status(statusCode.success).json({
                    status: "success",
                    data: {
                        "user": newUser,
                    },
                })
            );
        }

        if (!tweet) {
            return (
                res.status(404).json({
                    status: "fail",
                    message: "No found with that ID",
                })
            );
        }

        if (tweet.tweet_bookmarks.some(bookmark => bookmark.userId === req.body.userId)) {
            tweet.tweet_bookmarks = tweet.tweet_bookmarks.filter(bookmark => bookmark.userId !== req.body.userId);
            user.bookMarks = user.bookMarks.filter(bookmark => bookmark.tweetId !== req.body.tweetId);
        } else {
            tweet.tweet_bookmarks.push({ userId: Number(req.body.userId) });
            user.bookMarks.push({ tweetId: req.body.tweetId });
        }

        await tweet.save();
        await user.save();
        res.status(204).send();

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: "error finding the tweet", err,
        });
    }
}

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



module.exports = {
    getAllTweets,
    getTweetById,
    createTweet,
    updateTweet,
    deleteTweet,
    likeTweet,
    retweetTweet,
    bookmarkTweet,
    replyTweet,
};

