const tweetModel = require('../models/tweetModel');

const getAllTweets = async (req, res) => {
    try {
        const tweets = await tweetModel.find();
        res.status(200).json({
            status: "success",
            data: {
                tweets,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err,
        });
    }
};

const getTweetById = async (req, res) => {
    const tweets = await tweetModel.findOne({ tweet_id: req.params.id });

    if (!tweets) {
        res.status(404).json({
            status: "fail",
            message: "No tweet found with that ID",
        });
    }

    res.status(200).json({
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
            tweet_media: req.body.tweet_media,
        });

        res.status(201).json({
            status: "success",
            data: {
                tweet: newTweet,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err,
        });
    }

};

const updateTweet = async (req, res) => {
    try {
        const tweets = await tweetModel.findOneAndUpdate({ tweet_id: req.params.id }, req.body, {
            new: true,
            runValidators: true,
        });

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

