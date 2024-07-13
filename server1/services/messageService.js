const messageModel = require('../models/messageModel');

async function saveMessage(message) {
  await messageModel.saveMessage(message);
}

async function getMessagesByProductId(productId) {
  return await messageModel.getMessagesByProductId(productId);
}

module.exports = { saveMessage, getMessagesByProductId };
