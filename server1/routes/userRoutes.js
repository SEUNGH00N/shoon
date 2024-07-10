const express = require('express');
const multer = require('multer');

const userController = require('../controllers/userController');
const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // 파일 업로드 디렉토리 설정

/**
 * @route POST /signup
 * @desc 사용자 등록 엔드포인트
 * @access Public
 */
router.post('/signup', upload.single('studentIdImage'), userController.signup);

/**
 * @route POST /login
 * @desc 사용자 로그인 엔드포인트
 * @access Public
 */
router.post('/login', userController.login);

/**
 * @route GET /checkUser
 * @desc 사용자 ID 중복 확인 엔드포인트
 * @access Public
 */
router.get('/checkUser', userController.checkUser);

// 모든 승인되지 않은 사용자 정보를 가져오는 엔드포인트
router.get('/pending', userController.getPendingUsers);

// 사용자의 승인 상태를 업데이트하는 API 엔드포인트
router.put('/:userId/approval', userController.updateApprovalStatus);

// 승인 완료된 사용자 정보 가져오는 엔드포인트
router.get('/approved', userController.getApprovedUsers);

module.exports = router;
