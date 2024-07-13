const express = require('express');
const multer = require('multer');
const router = express.Router();
const productController = require('../controllers/productController');
const path = require('path');

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 이미지를 저장할 디렉토리 설정
  },
  filename: function (req, file, cb) {
    const extname = path.extname(file.originalname); // 파일 확장자
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // 현재 시간과 랜덤 숫자로 유니크한 파일 이름 생성
    const filename = 'image-' + uniqueSuffix + extname; // 일관된 파일 이름 생성
    cb(null, filename);
  }
});
const upload = multer({ storage: storage });

// 상품 관련 라우트 정의

/**
 * @route GET /products
 * @desc 모든 상품을 가져오는 엔드포인트
 * @access Public
 */
router.get('/', productController.getProducts);

/**
 * @route GET /products/productsmanage
 * @desc 사용자가 등록한 상품을 가져오는 엔드포인트
 * @access Public
 */
router.get('/productsmanage', productController.getProductsByUser);

/**
 * @route GET /products/detail/:productId
 * @desc 특정 상품을 가져오는 엔드포인트
 * @access Public
 */
router.get('/detail/:productId', productController.getProductById);

/**
 * @route DELETE /products/productsmanage/:productId
 * @desc 사용자가 등록한 특정 상품을 삭제하는 엔드포인트
 * @access Public
 */
router.delete('/productsmanage/:productId', productController.deleteProduct);

/**
 * @route POST /products/addProduct
 * @desc 새로운 상품을 추가하는 엔드포인트
 * @access Public
 */
router.post('/addProduct', upload.single('image'), productController.addProduct);

module.exports = router;
