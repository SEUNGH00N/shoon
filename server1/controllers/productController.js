const productService = require('../services/productService');

const productController = {
    /**
     * 모든 상품을 가져오는 메서드
     * @param {object} req - 요청 객체
     * @param {object} res - 응답 객체
     */
    getProducts: async (req, res) => {
        const searchTerm = req.query.search;
        const userId = req.headers.user_id;

        try {
            const products = await productService.getAllProducts(searchTerm);

            // 이미지 경로를 포함한 상품 목록으로 변환
            const productsWithImagePath = products.map(product => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                createdAt: product.createdAt,
                user_id: product.user_id,
                views: product.views,
                status: product.status,
                image: product.image ? `http://${req.get('host')}/uploads/${product.image}` : null
            }));

            // 검색어와 사용자 ID가 모두 제공된 경우 검색어 저장
            if (searchTerm && userId) {
                await saveSearchTerm(searchTerm, userId);
            }

            res.json(productsWithImagePath);
        } catch (error) {
            console.error('상품 목록을 가져오는 중 오류 발생:', error);
            res.status(500).json({ error: '상품 목록을 불러오는 도중 오류가 발생했습니다.' });
        }
    },

    /**
     * 사용자가 등록한 상품 목록을 가져오는 메서드
     * @param {object} req - 요청 객체
     * @param {object} res - 응답 객체
     */
    getProductsByUser: async (req, res) => {
        const userId = req.headers.user_id;

        if (!userId) {
            return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
        }

        try {
            const products = await productService.getUserProducts(userId);
            res.status(200).json(products);
        } catch (error) {
            console.error('사용자 상품 목록을 가져오는 중 오류 발생:', error);
            res.status(500).json({ error: '사용자 상품 목록을 불러오는 도중 오류가 발생했습니다.' });
        }
    },

    /**
     * 특정 상품 ID로 상품을 가져오는 메서드
     * @param {object} req - 요청 객체
     * @param {object} res - 응답 객체
     */
    getProductById: async (req, res) => {
        const productId = req.params.productId;

        try {
            const product = await productService.getProductById(productId);
            res.json(product);
        } catch (error) {
            console.error('상품 정보를 가져오는 중 오류 발생:', error);
            res.status(500).json({ error: '상품 정보를 불러오는 도중 오류가 발생했습니다.' });
        }
    },

    /**
     * 특정 사용자가 소유한 상품을 삭제하는 메서드
     * @param {object} req - 요청 객체
     * @param {object} res - 응답 객체
     */
    deleteProduct: async (req, res) => {
        const productId = req.params.productId;
        const userId = req.header('user_id');

        if (!userId) {
            return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
        }

        try {
            await productService.deleteProduct(productId, userId);
            res.status(200).json({ message: '상품이 성공적으로 삭제되었습니다.' });
        } catch (error) {
            console.error('상품 삭제 중 오류 발생:', error);
            res.status(500).json({ error: '상품 삭제를 진행하는 도중 오류가 발생했습니다.' });
        }
    },

    /**
     * 새로운 상품을 추가하는 메서드
     * @param {object} req - 요청 객체
     * @param {object} res - 응답 객체
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
    }
};

module.exports = productController;
