require('dotenv').config(); // 환경 변수 로드
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');
const got = require("got");

const { performOCR, calculateSimilarity } = require('./ocr');
const { handleNaverCallback } = require('./naverOAuth');
const { handleKakaoCallback } = require('./kakaoOAuthW');

const router = express.Router();

// OCR 및 유사도 검증을 위한 POST 엔드포인트 정의
router.post('/verify', async (req, res) => {
    try {
        const { imageUrl, userId } = req.body;
        const ocrResult = await performOCR(imageUrl);
        const similarity = calculateSimilarity(userId, ocrResult);
        res.status(200).json({ ocrResult, similarity });
    } catch (error) {
        console.error('OCR 및 유사도 검증 오류:', error);
        res.status(500).json({ error: 'OCR 및 유사도 검증 중에 오류가 발생했습니다.' });
    }
});

// 랜덤 시크릿 키 생성 함수
const generateRandomSecret = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// 세션 설정
router.use(
    session({
        secret: process.env.SESSION_SECRET || generateRandomSecret(32), // 환경 변수로 시크릿 키 설정
        resave: false,
        saveUninitialized: true
    })
);

// 네이버 로그인 엔드포인트
router.get('/oauth/naver/callback', async (req, res) => {
    const { code, state } = req.query;
    try {
        await handleNaverCallback(code, state);
        res.redirect(process.env.NAVER_REDIRECT_URL); // 환경 변수로 리다이렉트 URL 설정
    } catch (error) {
        console.error('Naver OAuth Error:', error);
        res.status(500).send('Naver OAuth Error');
    }
});

// 카카오 로그인 엔드포인트
router.get('/oauth/kakao/callback', async (req, res) => {
    const { code } = req.query;
    try {
        await handleKakaoCallback(code);
        res.redirect(process.env.KAKAO_REDIRECT_URL); // 환경 변수로 리다이렉트 URL 설정
    } catch (error) {
        console.error('Kakao OAuth Error:', error);
        res.status(500).send('Kakao OAuth Error');
    }
});

module.exports = router;
