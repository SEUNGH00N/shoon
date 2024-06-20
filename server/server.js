require('dotenv').config(); // 환경 변수 로드
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');
const got = require("got");

const { app, pool, PORT, upload, uploadId } = require('./db');
const { performOCR, calculateSimilarity } = require('./ocr');
const { handleNaverCallback } = require('./naverOAuth');
const { handleKakaoCallback, handleKakaoCallbackmob } = require('./kakaoOAuth');

require('./chat');
require('./user');
require('./product');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/uploads_id', express.static('uploads_id'));

// CORS 처리를 위한 미들웨어 추가
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 공통 함수: 소셜 로그인 처리
const handleSocialLogin = async (provider, userId, accessToken, redirectUrl, res) => {
  const sqlFindUser = 'SELECT * FROM social_logins WHERE user_id = ?';
  const [rows] = await pool.query(sqlFindUser, [userId]);

  if (rows.length > 0) {
    console.log('User already exists. Perform login actions...');
  } else {
    const userData = {
      user_id: userId,
      social_token: accessToken,
      token_type: provider,
      expires_at: null,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    const sqlInsertUser = 'INSERT INTO social_logins SET ?';
    await pool.query(sqlInsertUser, userData);
    console.log(`New ${provider} User Profile saved to database:`, userData);
  }

  return res.redirect(redirectUrl);
};

// 네이버 로그인 엔드포인트
app.get('/oauth/naver/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    const { userId, accessToken } = await handleNaverCallback(code, state);
    await handleSocialLogin('naver', userId, accessToken, '/Main', res);
  } catch (error) {
    console.error('Naver OAuth Error:', error);
    res.status(500).send('Naver OAuth Error');
  }
});

// 카카오 로그인 엔드포인트
app.get('/oauth/kakao/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { userId, accessToken } = await handleKakaoCallback(code);
    await handleSocialLogin('kakao', userId, accessToken, '/Main', res);
  } catch (error) {
    console.error('Kakao OAuth Error:', error);
    res.status(500).send('Kakao OAuth Error');
  }
});

// 네이버 모바일 로그인 엔드포인트
app.get('/oauth/naver/callback/mob', async (req, res) => {
  const { code, state } = req.query;
  try {
    const { userId, accessToken } = await handleNaverCallback(code, state);
    await handleSocialLogin('naver', userId, accessToken, '/Main', res);
  } catch (error) {
    console.error('Naver OAuth Error:', error);
    res.status(500).send('Naver OAuth Error');
  }
});

// 카카오 모바일 로그인 엔드포인트
app.get('/oauth/kakao/callback/mob', async (req, res) => {
  const { code } = req.query;
  try {
    const { userId, accessToken } = await handleKakaoCallbackmob(code);
    await handleSocialLogin('kakao', userId, accessToken, '/Main', res);
  } catch (error) {
    console.error('Kakao OAuth Error:', error);
    res.status(500).send('Kakao OAuth Error');
  }
});

// OCR 및 유사도 검증을 위한 POST 엔드포인트 정의
app.post('/api/verify', async (req, res) => {
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

// 결제 완료 후 요청 처리 엔드포인트
app.post("/confirm", async (req, res) => {
  const { paymentKey, orderId, amount, userId, productId } = req.body;
  const encryptedSecretKey = "Basic " + Buffer.from(process.env.TOSS_WIDGET_SECRET_KEY + ":").toString("base64");

  try {
    const response = await got.post("https://api.tosspayments.com/v1/payments/confirm", {
      headers: {
        Authorization: encryptedSecretKey,
        "Content-Type": "application/json",
      },
      json: { orderId, amount, paymentKey },
      responseType: "json",
    });

    const { statusCode, body } = response;
    await savePaymentInfo(orderId, amount, paymentKey, userId, productId);
    res.status(statusCode).json(body);
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    res.status(error.response?.statusCode || 500).json(error.response?.body || { error: 'Payment failed' });
  }
});

// 결제 내역 조회 엔드포인트
app.get('/payments/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await pool.query('SELECT * FROM payments WHERE buyer_id = ?', [userId]);
    const paymentsWithProductNames = await Promise.all(
      rows.map(async (payment) => {
        const productName = await getProductNameByPaymentId(payment.id);
        return { ...payment, productName };
      })
    );

    res.json(paymentsWithProductNames);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get product name by payment ID
const getProductNameByPaymentId = async (paymentId) => {
  try {
    const [rows] = await pool.query('SELECT p.name AS productName FROM payments py JOIN products p ON py.product_id = p.id WHERE py.id = ?', [paymentId]);
    return rows.length > 0 ? rows[0].productName : null;
  } catch (error) {
    console.error('Error fetching product name by payment ID:', error);
    throw error;
  }
};

// Save payment info to database
const savePaymentInfo = async (orderId, amount, paymentKey, buyerId, productId) => {
  const connection = await pool.getConnection();

  try {
    const getSellerQuery = 'SELECT user_id FROM products WHERE id = ?';
    const [sellerResult] = await connection.execute(getSellerQuery, [productId]);

    if (sellerResult.length === 0) {
      throw new Error('Product not found');
    }

    const sellerId = sellerResult[0].user_id;
    const insertQuery = 'INSERT INTO payments (orderId, amount, paymentKey, createdAt, buyer_id, seller_id, product_id) VALUES (?, ?, ?, NOW(), ?, ?, ?)';
    const [result] = await connection.execute(insertQuery, [orderId, amount, paymentKey, buyerId, sellerId, productId]);
    connection.release();
    return result.insertId;
  } catch (error) {
    console.error('Error saving payment information:', error);
    connection.release();
    throw error;
  }
};

// Get seller information by product ID
app.get('/products/seller/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const connection = await pool.getConnection();
    const [productRows] = await connection.execute('SELECT p.user_id, u.name, u.rates FROM products p INNER JOIN users u ON p.user_id = u.id WHERE p.id = ?', [productId]);
    connection.release();

    if (productRows.length === 0) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    }

    const sellerInfo = {
      sellerId: productRows[0].user_id,
      sellerName: productRows[0].name,
      rates: productRows[0].rates
    };

    res.status(200).json(sellerInfo);
  } catch (error) {
    console.error('상품 정보 조회 오류:', error);
    res.status(500).json({ error: '서버 오류: 상품 정보를 가져올 수 없습니다.' });
  }
});

// 서버 시작
function startServer() {
  app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  });
}

startServer();
