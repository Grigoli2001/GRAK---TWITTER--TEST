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
        const checkVote = await interactionModel.findOne({interactionType: 'vote', tweet_id: data.room, user: 3})
        if (checkVote) {
            throw new Error('Already voted')
        }

        const pollCheck = await Poll.findOne({ tweet_id: data.room })
        if (!pollCheck || pollCheck.poll_end < new Date()) {
            throw new Error('Poll not found or has ended')
        }
        // create a new vote TODO: update to current user
        const newVote = new interactionModel({
            interactionType: 'vote',
            tweet_id: data.room,
            userId: 3,
            pollOption: data.option
        })

        await newVote.save()

        // get the poll
        let interactionCount = await interactionModel.countDocuments({interactionType: 'vote', tweet_id: data.room, pollOption: data.optionId})
        let totalVotes = await interactionModel.countDocuments({interactionType: 'vote', tweet_id: data.room})
       
        io.to(data.room).emit('tweet:poll:handle-live-vote', {...data, interactionCount, totalVotes, userVoted: newVote})
        


    } catch (error) {

        io.to(socket.id).emit('tweet:poll:handle-live-vote', { error })
    }
    })

}