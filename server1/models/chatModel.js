// models/chatModel.js
const pool = require('../config/db'); // DB 연결 설정

module.exports = {
  getChatRooms: async (userId, productId) => {
    const [rows] = await pool.query('SELECT * FROM chat_rooms WHERE user_id = ? AND product_id = ?', [userId, productId]);
    return rows;
  },

  createChatRoom: async (productId, userId) => {
    const insertQuery = 'INSERT INTO chat_rooms (product_id, user_id) VALUES (?, ?)';
    const [result] = await pool.query(insertQuery, [productId, userId]);
    return result.insertId;
  },

  getMyChatRooms: async (userId) => {
    const [rows] = await pool.query('SELECT chat_rooms.id, chat_rooms.product_id, products.name AS product_name FROM chat_rooms JOIN products ON chat_rooms.product_id = products.id WHERE chat_rooms.user_id = ?', [userId]);
    return rows;
  }
};