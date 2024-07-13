const pool = require('../config/db'); // DB 연결 설정

/**
 * 특정 사용자와 상품에 대한 채팅방을 가져옵니다.
 * @param {number} userId - 사용자 ID.
 * @param {number} productId - 상품 ID.
 * @returns {Promise<Array>} - 채팅방 객체 배열을 반환.
 */
async function getChatRoomsByUserIdAndProductId(userId, productId) {
  try {
    const query = 'SELECT * FROM chat_rooms WHERE user_id = ? AND product_id = ?';
    const [rows] = await pool.query(query, [userId, productId]);
    return rows;
  } catch (error) {
    console.error('Error fetching chat rooms by userId and productId:', error);
    throw error;
  }
}

/**
 * 새로운 채팅방을 생성합니다.
 * @param {number} productId - 상품 ID.
 * @param {number} userId - 사용자 ID.
 * @returns {Promise<number>} - 새로 생성된 채팅방의 ID를 반환.
 */
async function createChatRoom(productId, userId) {
  const connection = await pool.getConnection();
  try {
    const query = 'INSERT INTO chat_rooms (product_id, user_id) VALUES (?, ?)';
    const [result] = await connection.query(query, [productId, userId]);
    return result.insertId;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 사용자가 참여하고 있는 모든 채팅방을 가져옵니다.
 * @param {number} userId - 사용자 ID.
 * @returns {Promise<Array>} - 채팅방 객체 배열을 반환.
 */
async function getUserChatRooms(userId) {
  try {
    const query = `
      SELECT chat_rooms.id, chat_rooms.product_id, products.name AS product_name
      FROM chat_rooms
      JOIN products ON chat_rooms.product_id = products.id
      WHERE chat_rooms.user_id = ?
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows.map(row => ({
      id: row.id,
      productId: row.product_id,
      productName: row.product_name,
    }));
  } catch (error) {
    console.error('Error fetching user chat rooms:', error);
    throw error;
  }
}

module.exports = { getChatRoomsByUserIdAndProductId, createChatRoom, getUserChatRooms };
