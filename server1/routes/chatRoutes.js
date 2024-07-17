// routes/chatRoutes.js
const express = require('express');
const chatController = require('../controllers/chatController');
const router = express.Router();

router.get('/chatRooms', chatController.getChatRooms);
router.post('/chatRooms', chatController.createChatRoom);
router.get('/myChatRooms', chatController.getMyChatRooms);

module.exports = router;