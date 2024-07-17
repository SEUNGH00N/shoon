const productService = require('../services/productService');

const productController = {
    /**
     * @route GET /latest
     * @desc 최신 상품 목록 조회
     * @access Public
     */
    getAllProducts: async (req, res) => {
        try {
            const products = await productService.getAllProducts();
            res.json(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    },

    /**
     * @route GET /search
     * @desc 상품 검색
     * @access Public
     */
    searchProducts: async (req, res) => {
        const { searchTerm } = req.query;
        try {
            const products = await productService.searchProducts(searchTerm);
            res.json(products);
        } catch (error) {
            console.error('Error searching products:', error);
            res.status(500).json({ error: 'Failed to search products' });
        }
    },

    /**
     * @route GET /user/:userId
     * @desc 특정 사용자의 상품 목록 조회
     * @access Public
     */
    getProductsByUser: async (req, res) => {
        const userId = req.headers.user_id; // 사용자 ID는 요청 헤더에서 가져옵니다.
        try {
            const products = await productService.getUserProducts(userId);
            res.json(products);
        } catch (error) {
            console.error('Error fetching products by user ID:', error);
            res.status(500).json({ error: 'Failed to fetch products by user ID' });
        }
    },

    /**
     * @route GET /detail/:productId
     * @desc 특정 상품 상세 조회
     * @access Public
     */
    getProductById: async (req, res) => {
        const productId = req.params.productId;
        try {
            const product = await productService.getProductById(productId);
            if (product) {
                res.json(product);
            } else {
                res.status(404).json({ error: 'Product not found' });
            }
        } catch (error) {
            console.error('Error fetching product by ID:', error);
            res.status(500).json({ error: 'Failed to fetch product by ID' });
        }
    },

    /**
     * @route DELETE /:productId
     * @desc 특정 상품 삭제
     * @access Public
     */
    deleteProductById: async (req, res) => {
        const productId = req.params.productId;
        const userId = req.header('user_id');

        try {
            await productService.deleteUserProduct(productId, userId);
            res.sendStatus(200);
        } catch (error) {
            console.error('Error deleting product by ID:', error);
            res.status(500).json({ error: 'Failed to delete product by ID' });
        }
    },

    /**
     * @route POST /
     * @desc 새로운 상품 추가
     * @access Public
     */
    addProduct: async (req, res) => {
        const userId = req.headers.user_id;
        const { name, description, price } = req.body;

        if (!name || !price || isNaN(price)) {
            return res.status(400).send('상품 이름과 가격을 올바르게 입력해주세요.');
        }

        let imageUrl = req.file ? req.file.filename : null;

        try {
            await productService.addProduct(userId, name, description, price, imageUrl);
            res.status(200).send('상품이 성공적으로 추가되었습니다.');
        } catch (error) {
            console.error('상품 추가 중 오류 발생:', error);
            res.status(500).send('상품 추가를 진행하는 도중 오류가 발생했습니다.');
        }
    },

    /**
     * @route POST /updateViews/:productId
     * @desc 특정 상품 조회수 업데이트
     * @access Public
     */
    updateProductViews: async (req, res) => {
        const productId = req.params.productId;
        try {
            await productService.updateProductViews(productId);
            res.json({ message: 'Views updated successfully' });
        } catch (error) {
            console.error('Error updating views:', error);
            res.status(500).json({ error: 'Failed to update views' });
        }
    },

    /**
     * @route GET /views
     * @desc 조회수 순으로 상품 조회
     * @access Public
     */
    getProductsByViews: async (req, res) => {
        try {
            const products = await productService.getProductsByViews();
            res.json(products);
        } catch (error) {
            console.error('Error fetching products by views:', error);
            res.status(500).json({ error: 'Failed to fetch products by views' });
        }
    },

    /**
     * @route PUT /productsmanage/sold/:productId
     * @desc 특정 상품 상태를 '판매 완료'로 변경
     * @access Public
     */
    updateStatusToSold: async (req, res) => {
        const { productId } = req.params;
        try {
            const result = await productService.updateStatusToSold(productId);
            if (result.affectedRows > 0) {
                res.json({ message: '상품 판매완료 처리 완료' });
            } else {
                res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
            }
        } catch (error) {
            console.error('상품 판매완료 처리 오류:', error);
            res.status(500).json({ error: '서버 오류 발생' });
        }
    },

    /**
     * @route PUT /productsmanage/:productId
     * @desc 특정 상품 정보 업데이트 (이미지 포함)
     * @access Public
     */
    updateProduct: async (req, res) => {
        const productId = req.params.productId;
        const userId = req.headers.user_id;
        const { name, description, price } = req.body;
        let imageUrl = req.file ? req.file.filename : null;

        if (!userId) {
            return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
        }

        if (!name || !price || isNaN(price) || price < 0) {
            return res.status(400).json({ error: '상품 이름과 올바른 가격을 입력해주세요.' });
        }

        try {
            const success = await productService.updateProduct(productId, userId, name, description, price, imageUrl);
            if (success) {
                res.status(200).json({ message: '상품이 성공적으로 수정되었습니다.' });
            } else {
                res.status(404).json({ error: '해당 상품을 찾을 수 없거나 수정할 권한이 없습니다.' });
            }
        } catch (error) {
            console.error('상품 수정 오류:', error);
            res.status(500).json({ error: '상품 수정 중 오류가 발생했습니다.' });
        }
    },

    /**
     * @route GET /checkFavorite/:productId
     * @desc 특정 상품 찜 여부 확인
     * @access Public
     */
    checkFavorite: async (req, res) => {
        const { productId } = req.params;
        const { userId } = req.query;
        try {
            const isFavorite = await productService.checkFavorite(userId, productId);
            res.status(200).json({ isFavorite });
        } catch (error) {
            console.error('찜 상태 확인 오류:', error);
            res.status(500).json({ error: '서버 오류로 인해 찜 상태를 확인할 수 없습니다.' });
        }
    },

    /**
     * @route PUT /toggleFavorite/:productId
     * @desc 특정 상품 찜 상태 토글
     * @access Public
     */
    toggleFavorite: async (req, res) => {
        const { productId } = req.params;
        const { userId } = req.body;
        try {
            const product = await productService.getProductById(productId);
            if (!product) {
                return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
            }
            if (product.user_id === userId) {
                return res.status(403).json({ error: '본인의 게시물에는 찜을 할 수 없습니다.', isOwner: true });
            }
            const isFavorite = await productService.toggleFavorite(userId, productId);
            const favoritesCount = await productService.getFavoriteCount(productId);
            await productService.updateFavoritesCount(productId, favoritesCount);
            res.status(200).json({ success: true, isFavorite, isOwner: false, favoritesCount });
        } catch (error) {
            console.error('찜 상태 토글 오류:', error);
            res.status(500).json({ error: '서버 오류로 인해 찜 상태를 변경할 수 없습니다.' });
        }
    },

    /**
     * @route GET /favorites
     * @desc 특정 사용자의 찜 목록 조회
     * @access Public
     */
    getFavorites: async (req, res) => {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        try {
            const favorites = await productService.getFavoritesByUserId(userId);
            res.json(favorites);
        } catch (error) {
            console.error('Error querying favorites:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    /**
     * @route POST /ratings
     * @desc 상품 평점 추가
     * @access Public
     */
    addRating: async (req, res) => {
        const { productId, rating } = req.body;
        try {
            const userId = await productService.getSellerId(productId);
            if (!userId) {
                return res.status(404).json({ success: false, error: 'Seller not found.' });
            }
            await productService.addRating(userId, productId, rating);
            res.status(200).json({ success: true, message: 'Seller rating updated successfully.' });
        } catch (error) {
            console.error('Error updating seller rating:', error);
            res.status(500).json({ success: false, error: 'Failed to update seller rating.' });
        }
    },

    /**
     * @route GET /isFavorite/:userId/:productId
     * @desc 특정 사용자의 찜 상태 확인
     * @access Public
     */
    isFavorite: async (req, res) => {
        const { userId, productId } = req.params;
        try {
            const isFavorite = await productService.isFavorite(userId, productId);
            res.json({ isFavorite });
        } catch (error) {
            console.error('Error fetching favorite status:', error);
            res.status(500).json({ error: 'Failed to fetch favorite status' });
        }
    },

    /**
     * @route GET /morelist
     * @desc 추가 상품 목록 조회
     * @access Public
     */
    getMoreProducts: async (req, res) => {
        const currentProductId = req.query.currentProductId;
        try {
            const products = await productService.getMoreProducts(currentProductId);
            res.json(products);
        } catch (error) {
            console.error('Error fetching more products:', error);
            res.status(500).send('Server error');
        }
    },

    /**
     * @route GET /api/products/:productId
     * @desc 특정 상품 상세 정보 조회
     * @access Public
     */
    getProductDetails: async (req, res) => {
        const { productId } = req.params;
        try {
            const product = await productService.getProductById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            console.error('Error fetching product details:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    /**
     * @route GET /topSearchKeywords
     * @desc 인기 검색어 조회
     * @access Public
     */
    getTopSearchKeywords: async (req, res) => {
        try {
            const keywords = await productService.getTopSearchKeywords();
            res.json(keywords);
        } catch (error) {
            console.error('가장 많이 검색된 검색어를 가져오는 중 오류가 발생했습니다:', error);
            res.sendStatus(500);
        }
    },

    /**
     * @route POST /reports
     * @desc 신고 추가
     * @access Public
     */
    addReport: async (req, res) => {
        const { productId, userId, reason, details } = req.body;
        if (!productId || !userId || !reason) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        try {
            const sellerId = await productService.getSellerId(productId);
            if (!sellerId) {
                return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
            }
            await productService.addReport(productId, userId, sellerId, reason, details);
            res.status(201).json({ message: '신고가 성공적으로 접수되었습니다.' });
        } catch (error) {
            console.error('신고 접수 오류:', error);
            res.status(500).json({ error: '서버 오류로 신고를 접수할 수 없습니다.' });
        }
    },

    /**
     * @route GET /reportsList
     * @desc 모든 신고 목록 조회
     * @access Public
     */
    getAllReports: async (req, res) => {
        try {
            const reports = await productService.getAllReports();
            res.json(reports);
        } catch (error) {
            console.error('Error fetching reports:', error);
            res.status(500).json({ error: 'Server error' });
        }
    },
};

module.exports = productController;
