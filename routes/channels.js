const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');

// Get channel details
router.get('/details', channelController.getChannels);

// Follow channel
router.post('/follow', channelController.followChannel);

// Get channel stats
router.get('/stats', channelController.getChannelStats);

module.exports = router;
