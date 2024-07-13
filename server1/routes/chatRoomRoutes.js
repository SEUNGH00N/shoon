const express = require('express');
const router = express.Router();
const chatRoomController = require('../controllers/chatRoomController');

// 채팅방 관련 라우트 설정
router.get('/', chatRoomController.getChatRooms);
router.post('/', chatRoomController.createChatRoom);
router.get('/user', chatRoomController.getUserChatRooms);

module.exports = router;
