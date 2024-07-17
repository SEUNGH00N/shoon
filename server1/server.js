// .env 파일의 환경 변수를 로드
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const fs = require('fs').promises;

const app = express();
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const productRoutes = require('./routes/productRoutes');
const searchHistoryRoutes = require('./routes/searchHistoryRoutes');
const ocrRoutes = require('./routes/ocrRoutes');
const messageController = require('./controllers/messageController');

// 미들웨어 설정
app.use(cors()); // 모든 도메인에서의 요청을 허용
app.use(express.json()); // JSON 요청 파싱

// 라우트 설정
app.use('/users', userRoutes);
app.use('/product', productRoutes);
app.use('/searchHistory', searchHistoryRoutes);
app.use('/api', ocrRoutes);

// CORS 처리를 위한 미들웨어 추가
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 정적 파일 제공
app.use('/uploads', express.static('uploads'));
app.use('/uploads_id', express.static('uploads_id'));

// 서버 포트 설정
const PORT = process.env.PORT || 4000;

// HTTP 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});

// 오류 로그 파일 작성 함수
async function logErrorToFile(error) {
  // const logMessage = `${new Date().toISOString()} - ${error.stack}\n`;
  const logMessage = `${new Date().toISOString()} - ${error.message}\n`; // 오류 메시지만 기록하도록 수정

  try {
    await fs.appendFile('error.log', logMessage);
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}


// 소켓 서버 설정
const socketServer = express();
const socketServerHttp = http.createServer(socketServer);
const io = socketio(socketServerHttp, {
  cors: {
    origin: '*',
  },
});
socketServer.use(cors()); // 모든 도메인에서의 요청을 허용
socketServer.use(express.json()); // JSON 요청 파싱
socketServer.use('/chats', messageRoutes);
socketServer.use('/chats', chatRoutes);

io.on('connection', (socket) => {
  console.log('Client connected');

  // 클라이언트가 메시지를 보낼 때
  socket.on('sendMessage', async (message) => {
    try {
      await messageController.saveMessage(message);
      // 모든 클라이언트에 새로운 메시지를 전송
      io.emit('newMessage', message);
    } catch (error) {
      console.error('Error sending message:', error);
      logErrorToFile(error);

    }
  });

  // 클라이언트가 연결을 끊을 때
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// 소켓 서버 포트 설정
const SOCKET_PORT = process.env.SOCKET_PORT || 4001;

socketServerHttp.listen(SOCKET_PORT, () => {
  console.log(`Socket server is running on port ${SOCKET_PORT}`);
});