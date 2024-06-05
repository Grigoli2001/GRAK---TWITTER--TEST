const jwt = require('jsonwebtoken');
const redisClient = require('../database/redis_setup');
const { unauthorized } = require('../constants/statusCode');
const logger = require('./winston');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(unauthorized).json({ error: 'Unauthorized' });
    }

    const tokenValue = token.split(' ')[1];

    try {
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET_KEY);
        req.user = decoded;

        redisClient.get(req.user.userId.toString(), (err, result) => {
            if (err || result !== tokenValue) {
                return res.status(unauthorized).json({ error: 'Invalid token' });
            }
            next();
        });
    } catch (error) {
        logger.error(error);
        return res.status(unauthorized).json({ error: 'Invalid token' });
    }
};

module.exports = verifyToken;
