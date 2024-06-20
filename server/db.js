require('dotenv').config(); // 환경 변수 로드
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// MySQL 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 이미지를 저장할 디렉토리
  },
  filename: function (req, file, cb) {
    const extname = path.extname(file.originalname); // 파일 확장자
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // 현재 시간과 랜덤 숫자로 유니크한 파일 이름 생성
    const filename = 'image-' + uniqueSuffix + extname; // 일관된 파일 이름 생성
    cb(null, filename);
  }
});

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

// Log database connection status
console.log('Connected to the MySQL database.');

// Middleware setup
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

const upload = multer({ storage: storage });
const uploadId = multer({ storage: storageId });

// Export necessary modules
module.exports = { app, pool, upload, uploadId };

// HTTPS 서버 설정
const https = require('https');
const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};

const server = https.createServer(options, app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
