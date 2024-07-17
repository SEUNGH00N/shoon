// controllers/messageController.js
const messageService = require('../services/messageService');

module.exports = {
  getMessagesByProductId: async (req, res) => {
    const { productId } = req.params;
    try {
      const messages = await messageService.getMessagesByProductId(productId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  saveMessage: async (message) => {
    try {
      await messageService.saveMessage(message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }
};
