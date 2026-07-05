const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');

// Check if should show ad
router.get('/should-show-ad', adController.shouldShowAd);

// Get ads list
router.get('/list', adController.getAds);

// Mark ad as seen
router.post('/seen', adController.markAdSeen);

module.exports = router;