require('dotenv').config(); // .env 파일의 환경 변수를 로드
const express = require('express');
const cors = require('cors'); // CORS 패키지 추가
const app = express();
const userRoutes = require('./routes/userRoutes');

app.use(cors()); // 모든 도메인에서의 요청을 허용
app.use(express.json());

// 사용자 관련 라우터
app.use('/users', userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});
