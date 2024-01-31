const tweetModel = require('../models/tweetModel');
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
        const newTweet = await tweetModel.create({
            tweet_id: req.body.tweet_id,
            tweet_type: req.body.tweet_type,
            user_id: req.body.user_id,
            tweet_text: req.body.tweet_text,
            tweet_schedule: req.body.tweet_schedule,
            tweet_media: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            }
        });

        res.status(statusCode.success).json({
            status: "success",
            data: {
                tweet: newTweet,
            },
        });
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
                message: "Internal server error",
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

module.exports = {
    getAllTweets,
    getTweetById,
    createTweet,
    updateTweet,
    deleteTweet,
};

