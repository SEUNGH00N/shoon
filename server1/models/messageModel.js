const pool = require('../config/db'); // DB 연결 설정

/**
 * 메시지를 데이터베이스에 저장합니다.
 * @param {Object} message - 저장할 메시지 객체.
 * @param {number} message.productId - 관련 상품의 ID.
 * @param {string} message.text - 메시지 내용.
 * @param {string} message.sender - 발신자 ID.
 * @param {string} message.receiver - 수신자 ID.
 */
async function saveMessage(message) {
  const connection = await pool.getConnection();
  try {
    const query = `
      INSERT INTO messages (productId, text, sender, receiver, createdAt)
      VALUES (?, ?, ?, ?, NOW())
    `;
    const values = [message.productId, message.text, message.sender, message.receiver];
    await connection.query(query, values);
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 특정 상품에 대한 모든 메시지를 가져옵니다.
 * @param {number} productId - 메시지를 가져올 상품의 ID.
 * @returns {Promise<Array>} - 메시지 객체 배열을 반환.
 */
async function getMessagesByProductId(productId) {
  try {
    const query = 'SELECT * FROM messages WHERE productId = ?';
    const [messages] = await pool.query(query, [productId]);
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

module.exports = { saveMessage, getMessagesByProductId };
