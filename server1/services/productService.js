const productModel = require('../models/productModel');

const productService = {
    /**
     * 모든 상품을 가져오는 메서드
     * @param {string} searchTerm 검색어 (선택 사항)
     * @returns {Promise<Array>} 모든 상품 목록 혹은 검색된 상품 목록
     */
    getAllProducts: async (searchTerm) => {
        if (searchTerm) {
            return await productModel.search(searchTerm);
        } else {
            return await productModel.getAll();
        }
    },

    /**
     * 특정 사용자의 상품을 가져오는 메서드
     * @param {number} userId 사용자 ID
     * @returns {Promise<Array>} 해당 사용자의 상품 목록
     */
    getUserProducts: async (userId) => {
        return await productModel.getByUserId(userId);
    },

    /**
     * 특정 상품 ID로 상품을 가져오는 메서드
     * @param {number} productId 상품 ID
     * @returns {Promise<Object|null>} 상품 객체 (하나) 혹은 null
     */
    getProductById: async (productId) => {
        return await productModel.getById(productId);
    },

    /**
     * 특정 사용자가 소유한 상품을 삭제하는 메서드
     * @param {number} productId 상품 ID
     * @param {number} userId 사용자 ID
     * @throws {Error} 권한이 없을 경우 'Unauthorized' 에러 발생
     */
    deleteProduct: async (productId, userId) => {
        const product = await productModel.getById(productId);
        if (product.user_id !== userId) {
            throw new Error('Unauthorized');
        }
        await productModel.deleteById(productId);
    },

    /**
     * 상품을 추가하는 메서드
     * @param {number} userId 사용자 ID
     * @param {string} name 상품 이름
     * @param {string} description 상품 설명
     * @param {number} price 상품 가격
     * @param {string} imageUrl 상품 이미지 URL
     */
    addProduct: async (userId, name, description, price, imageUrl) => {
        await productModel.insert(userId, name, description, price, imageUrl);
    }
};

module.exports = productService;
