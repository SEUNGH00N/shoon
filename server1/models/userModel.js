const pool = require('../config/db'); // DB 연결 설정

/**
 * 주어진 ID로 사용자를 조회합니다.
 * @param {string} id - 조회할 사용자의 ID.
 * @returns {Promise<object>} 사용자 정보 객체.
 */
const getUserById = async (id) => {
    const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return userRows[0];
};

/**
 * 새로운 사용자를 데이터베이스에 추가합니다.
 * @param {string} id - 사용자 ID.
 * @param {string} password - 해시된 비밀번호.
 * @param {string} email - 사용자 이메일.
 * @param {string} department - 사용자 학과.
 * @param {string} grade - 사용자 학년.
 * @param {string} name - 사용자 이름.
 * @param {string} studentIdImageUrl - 학생증 이미지 URL.
 * @returns {Promise<void>}
 */
const addUser = async (id, password, email, department, grade, name, studentIdImageUrl) => {
    const addUserQuery = `
        INSERT INTO users (id, password, email, department, grade, name, student_id_image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.execute(addUserQuery, [id, password, email, department, grade, name, studentIdImageUrl]);
};

/**
 * 주어진 ID로 사용자를 찾습니다.
 * @param {string} id - 찾고자 하는 사용자의 ID.
 * @returns {Promise<Array>} 사용자 정보 배열.
 */
const findUserById = async (id) => {
    const findUserQuery = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await pool.execute(findUserQuery, [id]);
    return rows;
};

/**
 * 모든 승인되지 않은 사용자 정보를 가져옵니다.
 * @returns {Promise<Array>} 승인되지 않은 사용자 정보 배열.
 */
const getPendingUsers = async () => {
    const query = `SELECT id, name, email, department, grade, student_id_image_url, admin 
                   FROM users 
                   WHERE admin != 'admin' AND admin != 'approved'`;
    const [rows] = await pool.query(query);
    return rows;
};

/**
 * 사용자의 승인 상태를 업데이트합니다.
 * @param {string} userId - 사용자 ID.
 * @param {string} approvalStatus - 승인 상태 ('approved' 또는 'rejected').
 * @param {string} rejectionReason - 거절 사유 (옵션).
 * @returns {Promise<void>}
 */
const updateApprovalStatus = async (userId, approvalStatus, rejectionReason = null) => {
    const query = 'UPDATE users SET admin = ?, rejection_reason = ? WHERE id = ?';
    await pool.query(query, [approvalStatus, rejectionReason, userId]);
};

/**
 * 승인된 사용자 정보를 가져옵니다.
 * @returns {Promise<Array>} 승인된 사용자 정보 배열.
 */
const getApprovedUsers = async () => {
    const query = `SELECT id, name, email, department, grade, student_id_image_url, admin 
                   FROM users 
                   WHERE admin = 'approved'`;
    const [rows] = await pool.query(query);
    return rows;
};

module.exports = {
    getUserById,
    addUser,
    findUserById,
    getPendingUsers,
    updateApprovalStatus,
    getApprovedUsers,
};
