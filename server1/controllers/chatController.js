// controllers/chatController.js
const chatService = require('../services/chatService');

module.exports = {
  getChatRooms: async (req, res) => {
    const { userId, productId } = req.headers;
    try {
      const chatRooms = await chatService.getChatRooms(userId, productId);
      res.json(chatRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  createChatRoom: async (req, res) => {
    const { productId, userId } = req.body;
    try {
      const existingRooms = await chatService.getChatRooms(userId, productId);
      if (existingRooms.length > 0) {
        res.status(200).json(existingRooms[0]);
        return;
      }
  
      const newChatRoomId = await chatService.createChatRoom(productId, userId);
      res.status(201).json({ id: newChatRoomId });
    } catch (error) {
      console.error('Error creating chat room:', error);
      res.status(500).send('Internal Server Error');
    }
  },
  

  getMyChatRooms: async (req, res) => {
    const userId = req.headers['user_id'];
    try {
      const chatRooms = await chatService.getMyChatRooms(userId);
      res.json(chatRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
