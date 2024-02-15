const messageModel = require('../models/messageModel');
const statusCode = require('../constants/statusCode');
const MESSAGE_PAGE_SIZE = 20;

const getAllMessages = async (req, res) => {

    try {
        let skip = req.query.page ? parseInt(req.query.page) : 0;
        // TODO: get current user id
        // test with user id 7
        const messages = await messageModel.find({ 
            room_id: req.params.room, 
            is_deleted_for: { $nin: [7] }, 
            is_room_deleted_for: { $nin: [7] }
        })
        .sort({ date: -1 })
        .skip(skip * MESSAGE_PAGE_SIZE)
        .limit(MESSAGE_PAGE_SIZE)
        res.status(statusCode.success).json({ messages })
    } catch (err) {
        console.log(err);
        res.status(statusCode.badRequest).json({
            message: err,
        });
    }
}

const deleteMessage = async (req, res) => {

    try {
        let { msg_id } = req.body
        console.log(msg_id, req.body)

        if (!msg_id) {
            throw new Error('msg_id is required')
        }
    
        // TODO: get current user id
       const deleted = await messageModel.updateOne({_id: msg_id}, {$addToSet: {is_deleted_for: 7}})
       
       if (deleted.modifiedCount === 1){
        console.log('sending success')
        return res.status(statusCode.success).send()
       }else{
        return res.status(statusCode.notModified).send()
       }

    }catch(err) {
        console.log(err)
        return res.status(statusCode.badRequest).json({
            message: err
        })
    }

}

const deleteRoom = async(req, res) => {
    try {
        let { room_id }= req.body

        if (!room_id) {
            throw new Error('room_id is required')
        }

       const deleted = await messageModel.updateMany({
                    room_id: room_id,
                    date: { $lt: new Date() } 
                }, 
                // TODO: get current user id
                {
                    $addToSet: {is_room_deleted_for: 7}
                }
        )
    
       if (deleted.modifiedCount > 0){
        res.status(statusCode.success).send()
       }else{
        res.statusCode(statusCode.notModified).send()
       }

    }catch(err) {
        res.status(statusCode.badRequest).json({
            message:err
        })
    }
}

module.exports = {
    getAllMessages,
    deleteMessage, 
    deleteRoom
}