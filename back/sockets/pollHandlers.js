const interactionModel = require('../models/interactionModel')
const Poll = require('../models/pollModel')

module.exports = (io, socket) =>  {


    socket.on('tweet:poll:join-room', (data) => {
        // console.log('tweet:poll:joining room', data)
        socket.join(data.room)
    })

    socket.on('tweet:poll:vote', async (data) => {

        try {
        console.log('tweet:poll:vote', data, socket.id)
        const { room, userId, option  } = data
        if (!room || !userId || !option) {
            throw new Error('room, userId, option are required')
        }
        const checkVote = await interactionModel.findOne({interactionType: 'vote', tweet_id: room, userId})
        if (checkVote) {
            throw new Error('Already voted')
        }

        const pollCheck = await Poll.findOne({ tweet_id: data.room })
        if (!pollCheck || pollCheck.poll_end < new Date()) {
            throw new Error('Poll not found or has ended')
        }
        const newVote = new interactionModel({
            interactionType: 'vote',
            tweet_id: room,
            userId: userId,
            pollOption: option
        })

        await newVote.save()

        // get the poll
        let interactionCount = await interactionModel.countDocuments({interactionType: 'vote', tweet_id: room, pollOption: option})
        let totalVotes = await interactionModel.countDocuments({interactionType: 'vote', tweet_id: room})
        // console.log('interactionCount', interactionCount, 'totalVotes', totalVotes, 'newVote', newVote)
        io.to(room).emit('tweet:poll:handle-live-vote', {interactionCount, totalVotes, newVote, voterId: userId})
        


    } catch (error) {

        io.to(socket.id).emit('tweet:poll:handle-live-vote', { error: error.message })
    }
    })

}