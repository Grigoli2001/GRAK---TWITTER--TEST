const express = require('express');
const router = express.Router();
const userServices = require('../services/user.service');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { checkBlocked } = require('../middleware/user.middleware');
router.get('/explore-users', userServices.getExploreUsers);
router.get('/username/:username', userServices.getUserByUsername);
router.get('/user', userServices.getUserSimple);
router.get('/follow-data', userServices.getFollowData);

router.patch('/update', upload.fields([
    { name: 'profile_pic', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
    
]), userServices.updateUser);

router.post("/follow", checkBlocked, userServices.addFollower);
router.post("/unfollow", checkBlocked, userServices.removeFollower);
router.post("/block", checkBlocked, userServices.blockUser);
router.post("/unblock", checkBlocked, userServices.unblockUser);
router.post("/set-post-notifications", checkBlocked, userServices.setPostNotification);
router.post("/remove-post-notifications", checkBlocked, userServices.removePostNotification);


router.get('', userServices.getUsers);

module.exports = router;
