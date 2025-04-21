const express = require('express');
const { protect } = require('../Middleware/authMiddleware');
const { sendMessage, allMessages, markMessageAsRead } = require('../Controllers/messageControllers');

const router = express.Router();

// Define message routes here
router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessages);
router.route('/mark-read/:chatId').put(protect, markMessageAsRead);

module.exports = router;
