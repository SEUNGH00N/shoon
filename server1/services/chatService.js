// services/chatService.js
const chatModel = require('../models/chatModel');

module.exports = {
  getChatRooms: async (userId, productId) => {
    return await chatModel.getChatRooms(userId, productId);
  },

  createChatRoom: async (productId, userId) => {
    return await chatModel.createChatRoom(productId, userId);
  },

  getMyChatRooms: async (userId) => {
    return await chatModel.getMyChatRooms(userId);
  }
};
