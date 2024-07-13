const express = require('express');
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');

const router = express.Router();

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 이미지를 저장할 디렉토리 설정
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname); // 파일 확장자 추출
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // 유니크한 파일 이름 생성
    const filename = 'image-' + uniqueSuffix + extname; // 일관된 파일 이름 생성
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

/**
 * @route GET /latest
 * @desc 최신 상품 목록 조회
 * @access Public
 */
router.get('/latest', productController.getAllProducts);

/**
 * @route GET /detail/:productId
 * @desc 특정 상품 상세 조회
 * @access Public
 */
router.get('/detail/:productId', productController.getProductById);

/**
 * @route GET /views
 * @desc 조회수 순으로 상품 조회
 * @access Public
 */
router.get('/views', productController.getProductsByViews);

/**
 * @route POST /
 * @desc 새로운 상품 추가
 * @access Public
 */
router.post('/addProduct', upload.single('image'), productController.addProduct);

/**
 * @route DELETE /:productId
 * @desc 특정 상품 삭제
 * @access Public
 */
router.delete('/:productId', productController.deleteProductById);

/**
 * @route POST /updateViews/:productId
 * @desc 특정 상품 조회수 업데이트
 * @access Public
 */
router.post('/updateViews/:productId', productController.updateProductViews);

/**
 * @route PUT /productsmanage/sold/:productId
 * @desc 특정 상품 상태를 '판매 완료'로 변경
 * @access Public
 */
router.put('/productsmanage/sold/:productId', productController.updateStatusToSold);

/**
 * @route PUT /productsmanage/:productId
 * @desc 특정 상품 정보 업데이트 (이미지 포함)
 * @access Public
 */
router.put('/productsmanage/:productId', upload.single('image'), productController.updateProduct);

/**
 * @route GET /checkFavorite/:productId
 * @desc 특정 상품 찜 여부 확인
 * @access Public
 */
router.get('/checkFavorite/:productId', productController.checkFavorite);

/**
 * @route PUT /toggleFavorite/:productId
 * @desc 특정 상품 찜 상태 토글
 * @access Public
 */
router.put('/toggleFavorite/:productId', productController.toggleFavorite);

/**
 * @route GET /favorites/:userId/:productId
 * @desc 특정 사용자의 찜 목록 조회
 * @access Public
 */
router.get('/favorites/:userId/:productId', productController.getFavorites);

/**
 * @route POST /ratings
 * @desc 상품 평점 추가
 * @access Public
 */
router.post('/ratings', productController.addRating);

/**
 * @route GET /isFavorite/:userId/:productId
 * @desc 특정 사용자의 찜 상태 확인
 * @access Public
 */
router.get('/isFavorite/:userId/:productId', productController.isFavorite);

/**
 * @route GET /morelist
 * @desc 추가 상품 목록 조회
 * @access Public
 */
router.get('/morelist', productController.getMoreProducts);

/**
 * @route GET /api/products/:productId
 * @desc 특정 상품 상세 정보 조회
 * @access Public
 */
router.get('/api/products/:productId', productController.getProductDetails);

/**
 * @route GET /topSearchKeywords
 * @desc 인기 검색어 조회
 * @access Public
 */
router.get('/topSearchKeywords', productController.getTopSearchKeywords);

/**
 * @route POST /reports
 * @desc 신고 추가
 * @access Public
 */
router.post('/reports', productController.addReport);

/**
 * @route GET /reportsList
 * @desc 모든 신고 목록 조회
 * @access Public
 */
router.get('/reportsList', productController.getAllReports);

module.exports = router;
