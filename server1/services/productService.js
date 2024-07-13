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
    },

    /**
     * 상품 조회수를 업데이트하는 메서드
     * @param {number} productId 상품 ID
     */
    updateProductViews: async (productId) => {
        await productModel.updateViews(productId);
    },

    /**
     * 조회수 순으로 상품을 가져오는 메서드
     * @returns {Promise<Array>} 조회수 순으로 정렬된 상품 목록
     */
    getProductsByViews: async () => {
        return await productModel.getByViews();
    },

    /**
     * 특정 상품의 상태를 '판매 완료'로 변경하는 메서드
     * @param {number} productId 상품 ID
     * @returns {Promise<Object>} 업데이트 결과
     */
    updateStatusToSold: async (productId) => {
        return await productModel.updateStatusToSold(productId);
    },

    /**
     * 상품 정보를 업데이트하는 메서드 (이미지 포함)
     * @param {number} productId 상품 ID
     * @param {number} userId 사용자 ID
     * @param {string} name 상품 이름
     * @param {string} description 상품 설명
     * @param {number} price 상품 가격
     * @param {string} imageUrl 상품 이미지 URL
     * @returns {Promise<Object>} 업데이트 결과
     */
    updateProduct: async (productId, userId, name, description, price, imageUrl) => {
        return await productModel.updateProduct(productId, userId, name, description, price, imageUrl);
    },

    /**
     * 특정 사용자가 특정 상품을 찜했는지 여부를 확인하는 메서드
     * @param {number} userId 사용자 ID
     * @param {number} productId 상품 ID
     * @returns {Promise<boolean>} 찜 여부
     */
    checkFavorite: async (userId, productId) => {
        return await productModel.checkFavorite(userId, productId);
    },

    /**
     * 특정 사용자가 특정 상품의 찜 상태를 토글하는 메서드
     * @param {number} userId 사용자 ID
     * @param {number} productId 상품 ID
     * @returns {Promise<boolean>} 토글된 찜 상태
     */
    toggleFavorite: async (userId, productId) => {
        return await productModel.toggleFavorite(userId, productId);
    },

    /**
     * 특정 상품의 찜 개수를 가져오는 메서드
     * @param {number} productId 상품 ID
     * @returns {Promise<number>} 찜 개수
     */
    getFavoriteCount: async (productId) => {
        return await productModel.getFavoriteCount(productId);
    },

    /**
     * 특정 상품의 찜 개수를 업데이트하는 메서드
     * @param {number} productId 상품 ID
     * @param {number} favoritesCount 찜 개수
     */
    updateFavoritesCount: async (productId, favoritesCount) => {
        await productModel.updateFavoritesCount(productId, favoritesCount);
    },

    /**
     * 특정 사용자의 찜 목록을 가져오는 메서드
     * @param {number} userId 사용자 ID
     * @returns {Promise<Array>} 찜 목록
     */
    getFavoritesByUserId: async (userId) => {
        return await productModel.getFavoritesByUserId(userId);
    },

    /**
     * 특정 상품의 판매자 ID를 가져오는 메서드
     * @param {number} productId 상품 ID
     * @returns {Promise<number>} 판매자 ID
     */
    getSellerId: async (productId) => {
        return await productModel.getSellerId(productId);
    },

    /**
     * 특정 상품에 대한 평점을 추가하는 메서드
     * @param {number} userId 사용자 ID
     * @param {number} productId 상품 ID
     * @param {number} rating 평점
     */
    addRating: async (userId, productId, rating) => {
        await productModel.addRating(userId, productId, rating);
    },

    /**
     * 특정 사용자가 특정 상품을 찜했는지 여부를 확인하는 메서드
     * @param {number} userId 사용자 ID
     * @param {number} productId 상품 ID
     * @returns {Promise<boolean>} 찜 여부
     */
    isFavorite: async (userId, productId) => {
        return await productModel.isFavorite(userId, productId);
    },

    /**
     * 추가 상품 목록을 가져오는 메서드
     * @param {number} currentProductId 현재 상품 ID
     * @returns {Promise<Array>} 추가 상품 목록
     */
    getMoreProducts: async (currentProductId) => {
        return await productModel.getMoreProducts(currentProductId);
    },

    /**
     * 특정 상품의 상세 정보를 가져오는 메서드
     * @param {number} productId 상품 ID
     * @returns {Promise<Object|null>} 상품 정보 혹은 null
     */
    getProductById: async (productId) => {
        return await productModel.getProductById(productId);
    },

    /**
     * 인기 검색어 목록을 가져오는 메서드
     * @returns {Promise<Array>} 인기 검색어 목록
     */
    getTopSearchKeywords: async () => {
        return await productModel.getTopSearchKeywords();
    },

    /**
     * 상품에 대한 신고를 추가하는 메서드
     * @param {number} productId 상품 ID
     * @param {number} userId 사용자 ID
     * @param {number} sellerId 판매자 ID
     * @param {string} reason 신고 사유
     * @param {string} details 신고 상세 정보
     * @returns {Promise<Object>} 신고 결과
     */
    addReport: async (productId, userId, sellerId, reason, details) => {
        return await productModel.addReport(productId, userId, sellerId, reason, details);
    },

    /**
     * 모든 신고 목록을 가져오는 메서드
     * @returns {Promise<Array>} 모든 신고 목록
     */
    getAllReports: async () => {
        return await productModel.getAllReports();
    },
};

module.exports = productService;
