const pool = require('../config/db'); // DB 연결 설정

const userModel = {
    /**
     * 주어진 ID로 사용자를 조회합니다.
     * @param {string} id - 조회할 사용자의 ID.
     * @returns {Promise<object>} 사용자 정보 객체.
     */
    getUserById: async (id) => {
        try {
            const query = 'SELECT * FROM users WHERE id = ?';
            const [userRows] = await pool.execute(query, [id]);
            return userRows[0];
        } catch (error) {
            console.error('ID로 사용자 조회 중 오류 발생:', error);
            throw error;
        }
    },

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
    addUser: async (id, password, email, department, grade, name, studentIdImageUrl) => {
        try {
            const query = `
                INSERT INTO users (id, password, email, department, grade, name, student_id_image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            await pool.execute(query, [id, password, email, department, grade, name, studentIdImageUrl]);
        } catch (error) {
            console.error('사용자 추가 중 오류 발생:', error);
            throw error;
        }
    },

    /**
     * 주어진 ID로 사용자를 찾습니다.
     * @param {string} id - 찾고자 하는 사용자의 ID.
     * @returns {Promise<Array>} 사용자 정보 배열.
     */
    findUserById: async (id) => {
        try {
            const query = 'SELECT * FROM users WHERE id = ?';
            const [rows] = await pool.execute(query, [id]);
            return rows;
        } catch (error) {
            console.error('ID로 사용자 조회 중 오류 발생:', error);
            throw error;
        }
    },

    /**
     * 모든 승인되지 않은 사용자 정보를 가져옵니다.
     * @returns {Promise<Array>} 승인되지 않은 사용자 정보 배열.
     */
    getPendingUsers: async () => {
        try {
            const query = `
                SELECT id, name, email, department, grade, student_id_image_url, admin 
                FROM users 
                WHERE admin != 'admin' AND admin != 'approved'
            `;
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('미승인 사용자 정보 가져오기 오류:', error);
            throw error;
        }
    },

    /**
     * 사용자의 승인 상태를 업데이트합니다.
     * @param {string} userId - 사용자 ID.
     * @param {string} approvalStatus - 승인 상태 ('approved' 또는 'rejected').
     * @param {string} rejectionReason - 거절 사유 (옵션).
     * @returns {Promise<void>}
     */
    updateApprovalStatus: async (userId, approvalStatus, rejectionReason = null) => {
        try {
            const query = 'UPDATE users SET admin = ?, rejection_reason = ? WHERE id = ?';
            await pool.query(query, [approvalStatus, rejectionReason, userId]);
        } catch (error) {
            console.error('승인 상태 업데이트 중 오류 발생:', error);
            throw error;
        }
    },

    /**
     * 승인된 사용자 정보를 가져옵니다.
     * @returns {Promise<Array>} 승인된 사용자 정보 배열.
     */
    getApprovedUsers: async () => {
        try {
            const query = `
                SELECT id, name, email, department, grade, student_id_image_url, admin 
                FROM users 
                WHERE admin = 'approved'
            `;
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('승인된 사용자 정보 가져오기 오류:', error);
            throw error;
        }
    },

    /**
     * 주어진 사용자 ID로 사용자 유형을 가져옵니다.
     * @param {string} userId - 사용자 ID.
     * @returns {Promise<string|null>} 사용자 유형 (없으면 null).
     */
    getUserTypeById: async (userId) => {
        try {
            const query = 'SELECT userType FROM users WHERE id = ?';
            const [rows] = await pool.query(query, [userId]);
            return rows.length ? rows[0].userType : null;
        } catch (error) {
            console.error('사용자 유형 조회 중 오류 발생:', error);
            throw error;
        }
    },

    /**
     * 사용자의 비밀번호를 변경합니다.
     * @param {string} userId - 사용자 ID.
     * @param {string} hashedPassword - 해시된 새로운 비밀번호.
     * @returns {Promise<void>}
     */
    updatePassword: async (userId, hashedPassword) => {
        const query = 'UPDATE users SET password = ? WHERE id = ?';
        await pool.execute(query, [hashedPassword, userId]);
    },

    /**
     * 사용자 정보 업데이트
     * @param {string} userId - 사용자 ID.
     * @param {object} updatedUserInfo - 업데이트할 사용자 정보 객체.
     * @param {string} updatedUserInfo.name - 사용자 이름.
     * @param {string} updatedUserInfo.grade - 사용자 학년.
     * @param {string} updatedUserInfo.department - 사용자 학과.
     * @param {string} updatedUserInfo.email - 사용자 이메일.
     * @returns {Promise<void>}
     */
    updateUserInfo: async (userId, updatedUserInfo) => {
        const { name, grade, department, email } = updatedUserInfo;
        await pool.execute(
            'UPDATE users SET name = ?, grade = ?, department = ?, email = ? WHERE id = ?',
            [name, grade, department, email, userId]
        );
    },

    /**
     * 주어진 ID로 사용자를 조회합니다.
     * @param {string} userId - 조회할 사용자의 ID.
     * @returns {Promise<object>} 사용자 정보 객체.
     */
    getById: async (userId) => {
        try {
            const query = `SELECT id, name, department, grade, rates FROM users WHERE id = ?`;
            const [rows] = await pool.query(query, [userId]);
            return rows[0];
        } catch (error) {
            console.error('ID로 사용자 조회 중 오류 발생:', error);
            throw error;
        }
    },

    /**
     * 주어진 사용자 ID로 총 판매 금액을 가져옵니다.
     * @param {string} userId - 사용자 ID.
     * @returns {Promise<number>} 총 판매 금액.
     */
    getTotalSales: async (userId) => {
        try {
            const [sales] = await pool.execute('SELECT IFNULL(SUM(p.amount), 0) AS total_sales FROM payments p WHERE p.seller_id = ?', [userId]);
            return sales[0].total_sales;
        } catch (error) {
            console.error('총 판매 금액 조회 중 오류 발생:', error);
            throw error;
        }
    },

    /**
     * 주어진 사용자 ID로 판매된 상품의 총 가격을 가져옵니다.
     * @param {string} userId - 사용자 ID.
     * @returns {Promise<number>} 판매된 상품의 총 가격.
     */
    getTotalPriceOfSoldProducts: async (userId) => {
        try {
            const [soldProducts] = await pool.execute('SELECT IFNULL(SUM(pr.price), 0) AS total_price FROM products pr JOIN payments p ON pr.id = p.product_id WHERE pr.user_id = ?', [userId]);
            return soldProducts[0].total_price;
        } catch (error) {
            console.error('판매된 상품 총 가격 조회 중 오류 발생:', error);
            throw error;
        }
    }
};

module.exports = userModel;
