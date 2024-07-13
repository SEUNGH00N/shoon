const chatRoomModel = require('../models/chatRoomModel');

async function getChatRoomsByUserIdAndProductId(userId, productId) {
  return await chatRoomModel.getChatRoomsByUserIdAndProductId(userId, productId);
}

async function createChatRoom(productId, userId) {
  const existingRows = await chatRoomModel.getChatRoomsByUserIdAndProductId(userId, productId);
  if (existingRows.length > 0) {
    return existingRows[0];
  }
  const newChatRoomId = await chatRoomModel.createChatRoom(productId, userId);
  return { id: newChatRoomId };
}

async function getUserChatRooms(userId) {
  return await chatRoomModel.getUserChatRooms(userId);
}

module.exports = { getChatRoomsByUserIdAndProductId, createChatRoom, getUserChatRooms };
