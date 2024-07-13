const messageService = require('../services/messageService');

async function saveMessage(message) {
  await messageService.saveMessage(message);
}

async function getMessages(req, res) {
  const { productId } = req.params;
  try {
    const messages = await messageService.getMessagesByProductId(productId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { saveMessage, getMessages };
