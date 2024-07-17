// services/messageService.js
const messageModel = require('../models/messageModel');

module.exports = {
  saveMessage: async (message) => {
    await messageModel.saveMessage(message);
  },

  getMessagesByProductId: async (productId) => {
    return await messageModel.getMessagesByProductId(productId);
  }
};
