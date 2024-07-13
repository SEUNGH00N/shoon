const pool = require('../config/db');

const productModel = {
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
        return rows.length ? rows[0] : null;
    },

    /**
     * 특정 상품 ID로 상품을 삭제하는 메서드
     * @param {number} productId 상품 ID
     */
    deleteById: async (productId) => {
        // 관련된 데이터를 모두 삭제
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
    },

    /**
     * 조회수 순으로 상품을 가져오는 메서드
     * @returns {Promise<Array>} 조회수 순으로 정렬된 상품 목록
     */
    getByViews: async () => {
        let [rows] = await pool.execute(`
            SELECT * FROM products
            WHERE status = 'available'
            ORDER BY views DESC
            LIMIT 15
        `);

        if (rows.length < 15) {
            const availableCount = rows.length;
            const limit = 15 - availableCount;
            const [additionalRows] = await pool.query(`
                SELECT * FROM products
                WHERE status = 'sold out'
                ORDER BY views DESC
                LIMIT ${limit}
            `);
            rows = rows.concat(additionalRows);
        }
        return rows;
    },

    /**
     * 특정 상품의 상태를 '판매 완료'로 변경하는 메서드
     * @param {number} productId 상품 ID
     * @returns {Promise<Object>} 업데이트 결과
     */
    updateStatusToSold: async (productId) => {
        const [result] = await pool.query('UPDATE products SET status = ? WHERE id = ?', ['판매완료', productId]);
        return result;
    },

    /**
     * 상품 정보를 업데이트하는 메서드 (이미지 포함)
     * @param {number} productId 상품 ID
     * @param {number} userId 사용자 ID
     * @param {string} name 상품 이름
     * @param {string} description 상품 설명
     * @param {number} price 상품 가격
     * @param {string} imageUrl 상품 이미지 URL
     * @returns {Promise<boolean|null>} 업데이트 성공 여부
     */
    updateProduct: async (productId, userId, name, description, price, imageUrl) => {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ? AND user_id = ?', [productId, userId]);
        if (rows.length === 0) {
            return null; // 사용자가 해당 상품을 소유하지 않음
        }
        if (!imageUrl) {
            imageUrl = rows[0].image; // 이미지가 제공되지 않은 경우 기존 이미지 유지
        }
        await pool.query('UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?', [name, description, price, imageUrl, productId]);
        return true;
    },

    /**
     * 특정 사용자가 특정 상품을 찜했는지 여부를 확인하는 메서드
     * @param {number} userId 사용자 ID
     * @param {number} productId 상품 ID
     * @returns {Promise<boolean>} 찜 여부
     */
    checkFavorite: async (userId, productId) => {
        const [rows] = await pool.query('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
        return rows.length > 0;
    },

    /**
     * 특정 사용자가 특정 상품의 찜 상태를 토글하는 메서드
     * @param {number} userId 사용자 ID
     * @param {number} productId 상품 ID
     * @returns {Promise<boolean>} 토글된 찜 상태
     */
    toggleFavorite: async (userId, productId) => {
        const [existingFavoriteRows] = await pool.query('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
        if (existingFavoriteRows.length > 0) {
            await pool.query('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
            return false; // 찜 취소
        } else {
            await pool.query('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', [userId, productId]);
            return true; // 찜 추가
        }
    },

    /**
     * 특정 상품의 찜 개수를 가져오는 메서드
     * @param {number} productId 상품 ID
     * @returns {Promise<number>} 찜 개수
     */
    getFavoriteCount: async (productId) => {
        const [favoritesCountRows] = await pool.query('SELECT COUNT(*) AS count FROM favorites WHERE product_id = ?', [productId]);
        return favoritesCountRows[0].count;
    },

    /**
     * 특정 상품의 찜 개수를 업데이트하는 메서드
     * @param {number} productId 상품 ID
     * @param {number} favoritesCount 찜 개수
     */
    updateFavoritesCount: async (productId, favoritesCount) => {
        await pool.query('UPDATE products SET favorites_count = ? WHERE id = ?', [favoritesCount, productId]);
    },

    /**
     * 특정 사용자의 찜 목록을 가져오는 메서드
     * @param {number} userId 사용자 ID
     * @returns {Promise<Array>} 찜 목록
     */
    getFavoritesByUserId: async (userId) => {
        const [rows] = await pool.query(`
          SELECT f.id, f.user_id, f.product_id, f.created_at,
                 p.name AS product_name, p.description, p.price, p.createdAt AS product_created_at,
                 p.image
          FROM favorites f
          JOIN products p ON f.product_id = p.id
          WHERE f.user_id = ?`, [userId]);
        return rows;
    },

    /**
     * 특정 상품의 판매자 ID를 가져오는 메서드
     * @param {number} productId 상품 ID
     * @returns {Promise<number|null>} 판매자 ID
     */
    getSellerId: async (productId) => {
        const [rows] = await pool.query('SELECT user_id FROM products WHERE id = ?', [productId]);
        return rows.length ? rows[0].user_id : null;
    },

    /**
     * 특정 사용자가 특정 상품에 평점을 추가하는 메서드
     * @param {number} userId 사용자 ID
     * @param {number} productId 상품 ID
     * @param {number} rating 평점
     */
    addRating: async (userId, productId, rating) => {
        await pool.query('INSERT INTO product_ratings (user_id, product_id, rating) VALUES (?, ?, ?)', [userId, productId, rating]);
        await pool.query('UPDATE users SET rates = (SELECT AVG(rating) FROM product_ratings WHERE user_id = ?) WHERE id = ?', [userId, userId]);
    },

    /**
     * 특정 사용자가 특정 상품을 찜한 상태인지 확인하는 메서드
     * @param {number} userId 사용자 ID
     * @param {number} productId 상품 ID
     * @returns {Promise<boolean>} 찜 상태 여부
     */
    isFavorite: async (userId, productId) => {
        const [rows] = await pool.query('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
        return rows.length > 0;
    },

    /**
     * 현재 상품보다 조회수가 더 높은 상품들을 가져오는 메서드
     * @param {number} currentProductId 현재 상품 ID
     * @returns {Promise<Array>} 조회수가 높은 상품 목록
     */
    getMoreProducts: async (currentProductId) => {
        const [rows] = await pool.query('SELECT * FROM products WHERE id != ? ORDER BY views DESC', [currentProductId]);
        return rows;
    },

    /**
     * 특정 상품의 상세 정보를 가져오는 메서드
     * @param {number} productId 상품 ID
     * @returns {Promise<Object|null>} 상품 객체 (하나) 혹은 null
     */
    getProductById: async (productId) => {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
        return rows.length ? rows[0] : null;
    },

    /**
     * 인기 검색어 목록을 가져오는 메서드
     * @returns {Promise<Array>} 인기 검색어 목록
     */
    getTopSearchKeywords: async () => {
        const [rows] = await pool.query(`
            SELECT search_term, COUNT(search_term) AS search_count
            FROM search_history
            GROUP BY search_term
            ORDER BY search_count DESC
            LIMIT 10
        `);
        return rows;
    },

    /**
     * 특정 상품에 대한 신고를 추가하는 메서드
     * @param {number} productId 상품 ID
     * @param {number} userId 사용자 ID
     * @param {number} sellerId 판매자 ID
     * @param {string} reason 신고 사유
     * @param {string|null} details 신고 상세 내용 (선택 사항)
     * @returns {Promise<Object>} 신고 결과 객체
     */
    addReport: async (productId, userId, sellerId, reason, details) => {
        const [result] = await pool.query('INSERT INTO report (product_id, user_id, seller_id, reason, details) VALUES (?, ?, ?, ?, ?)', [productId, userId, sellerId, reason, details || null]);
        return result;
    },

    /**
     * 모든 신고 목록을 가져오는 메서드
     * @returns {Promise<Array>} 모든 신고 목록
     */
    getAllReports: async () => {
        const [rows] = await pool.query(`
            SELECT r.id, r.product_id, r.user_id, r.reason, r.details, r.created_at, p.user_id AS seller_id
            FROM report r
            JOIN products p ON r.product_id = p.id
        `);
        return rows;
    },
};

module.exports = productModel;
