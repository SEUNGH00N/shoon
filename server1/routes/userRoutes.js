const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');
const router = express.Router();

// Multer 설정
const storageId = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads_id/'); // 업로드된 파일이 저장될 디렉토리
  },
  filename: function (req, file, cb) {
    const extname = '.jpg'; // 확장자를 .jpg로 고정
    cb(null, `${file.originalname.split('.')[0]}${extname}`);
  }
});

// 파일 업로드 디렉토리 설정
const uploadId = multer({ storage: storageId });


/**
 * @route POST /users/signup
 * @desc 사용자 등록 엔드포인트
 * @access Public
 */
router.post('/signup', uploadId.single('studentIdImage'), userController.signup);

/**
 * @route POST /users/login
 * @desc 사용자 로그인 엔드포인트
 * @access Public
 */
router.post('/login', userController.login);

/**
 * @route GET /users/checkUser
 * @desc 사용자 ID 중복 확인 엔드포인트
 * @access Public
 */
router.get('/checkUser', userController.checkUser);

/**
 * @route GET /users/pending
 * @desc 승인 대기 중인 모든 사용자 정보를 가져오는 엔드포인트
 * @access Public
 */
router.get('/pending', userController.getPendingUsers);

/**
 * @route PUT /users/:userId/approval
 * @desc 특정 사용자의 승인 상태를 업데이트하는 엔드포인트
 * @access Public
 */
router.put('/:userId/approval', userController.updateApprovalStatus);

/**
 * @route GET /users/approved
 * @desc 승인 완료된 모든 사용자 정보를 가져오는 엔드포인트
 * @access Public
 */
router.get('/approved', userController.getApprovedUsers);

/**
 * @route GET /users/type
 * @desc 특정 사용자의 유형 정보를 가져오는 엔드포인트
 * @access Public
 */
router.get('/type', userController.getUserType);

/**
 * @route POST /users/myinfo
 * @desc 본인의 정보를 조회하는 엔드포인트
 * @access Public
 */
router.post('/myinfo', userController.getMyInfo);

/**
 * @route GET /users/getUserInfo
 * @desc 세션에 저장된 사용자 ID를 기반으로 사용자 정보를 가져오는 엔드포인트
 * @access Public
 */
router.get('/getUserInfo', userController.getUserInfo);

/**
 * @route POST /users/changepassword
 * @desc 비밀번호 변경 엔드포인트
 * @access Public
 */
router.post('/changepassword', userController.changePassword);

/**
 * @route POST /users/edituserinfo
 * @desc 사용자 정보 수정 엔드포인트
 * @access Public
 */
router.post('/edituserinfo', userController.editUserInfo);


/**
 * @route GET /products/seller/:productId
 * @desc 특정 상품의 판매자 정보를 가져오는 엔드포인트
 * @access Public
 */
router.get('/seller/:productId', userController.getSellerInfo);

module.exports = router;
