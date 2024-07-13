const pool = require('../config/db');

const Product = {
    /**
     * 모든 상품을 가져오는 메서드
     * @returns {Promise<Array>} 모든 상품 목록
     */
    getAll: async () => {
        const [rows] = await pool.execute('SELECT * FROM products');
        return rows;
    },

    /**
     * 검색어를 기준으로 상품을 검색하는 메서드
     * @param {string} searchTerm 검색어
     * @returns {Promise<Array>} 검색된 상품 목록
     */
    search: async (searchTerm) => {
        const [rows] = await pool.execute('SELECT * FROM products WHERE name LIKE ?', [`%${searchTerm}%`]);
        return rows;
    },

    /**
     * 특정 사용자의 상품을 가져오는 메서드
     * @param {number} userId 사용자 ID
     * @returns {Promise<Array>} 해당 사용자의 상품 목록
     */
    getByUserId: async (userId) => {
        const [rows] = await pool.query('SELECT * FROM products WHERE user_id = ?', [userId]);
        return rows;
    },

    /**
     * 특정 상품 ID로 상품을 가져오는 메서드
     * @param {number} productId 상품 ID
     * @returns {Promise<Object|null>} 상품 객체 (하나) 혹은 null
     */
    getById: async (productId) => {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
        return rows[0];
    },

    /**
     * 특정 상품 ID로 상품을 삭제하는 메서드
     * @param {number} productId 상품 ID
     */
    deleteById: async (productId) => {
        await pool.query('DELETE FROM favorites WHERE product_id = ?', [productId]);
        await pool.query('DELETE FROM messages WHERE productId = ?', [productId]);
        await pool.query('DELETE FROM product_ratings WHERE product_id = ?', [productId]);
        await pool.query('DELETE FROM products WHERE id = ?', [productId]);
    },

    /**
     * 상품을 추가하는 메서드
     * @param {number} userId 사용자 ID
     * @param {string} name 상품 이름
     * @param {string} description 상품 설명
     * @param {number} price 상품 가격
     * @param {string} imageUrl 상품 이미지 URL
     * @returns {Promise<Object>} 추가된 상품의 결과 객체
     */
    insert: async (userId, name, description, price, imageUrl) => {
        const INSERT_PRODUCT_QUERY = `INSERT INTO products (user_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await pool.execute(INSERT_PRODUCT_QUERY, [userId, name, description, price, imageUrl]);
        return result;
    }
};

module.exports = Product;
