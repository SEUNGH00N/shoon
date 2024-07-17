// routes/messageRoutes.js
const express = require('express');
const messageController = require('../controllers/messageController');
const router = express.Router();

router.get('/messages/:productId', messageController.getMessagesByProductId);

module.exports = router;
