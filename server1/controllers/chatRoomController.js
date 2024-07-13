const chatRoomService = require('../services/chatRoomService');

/**
 * 사용자의 특정 제품에 대한 채팅방 목록을 가져옵니다.
 * @param {Object} req - Express 요청 객체.
 * @param {Object} res - Express 응답 객체.
 */
const getChatRooms = async (req, res) => {
  const { userId, productId } = req.headers;
  try {
    const rows = await chatRoomService.getChatRoomsByUserIdAndProductId(userId, productId);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * 새로운 채팅방을 생성합니다.
 * @param {Object} req - Express 요청 객체.
 * @param {Object} res - Express 응답 객체.
 */
const createChatRoom = async (req, res) => {
  const { productId, userId } = req.body;
  try {
    const chatRoom = await chatRoomService.createChatRoom(productId, userId);
    res.status(chatRoom.id ? 201 : 200).json(chatRoom);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * 특정 사용자의 채팅방 목록을 가져옵니다.
 * @param {Object} req - Express 요청 객체.
 * @param {Object} res - Express 응답 객체.
 */
const getUserChatRooms = async (req, res) => {
  const userId = req.headers['user_id'];
  try {
    const chatRooms = await chatRoomService.getUserChatRooms(userId);
    res.status(200).json(chatRooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getChatRooms, createChatRoom, getUserChatRooms };
