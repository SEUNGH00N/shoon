// .env 파일의 환경 변수를 로드
require('dotenv').config();

const express = require('express');
const cors = require('cors'); // CORS 패키지 추가
const http = require('http'); // http 패키지 추가
const socketio = require('socket.io');
const fs = require('fs'); // 파일 시스템 패키지 추가 (오류 로그 저장을 위해)

const app = express();
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const chatRoomRoutes = require('./routes/chatRoomRoutes');
const productRoutes = require('./routes/productRoutes');
const messageController = require('./controllers/messageController');
const searchHistoryRoutes = require('./routes/searchHistoryRoutes');



// 미들웨어 설정
app.use(cors()); // 모든 도메인에서의 요청을 허용
app.use(express.json()); // JSON 요청 파싱

// 라우트 설정
app.use('/users', userRoutes);
app.use('/messages', messageRoutes);
app.use('/chatRooms', chatRoomRoutes);
app.use('/product', productRoutes);
app.use('/searchHistory', searchHistoryRoutes);

// 서버 포트 설정
const PORT = process.env.PORT || 4000;

// HTTP 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});

// 오류 로그 파일 작성 함수
function logErrorToFile(error) {
  const logMessage = `${new Date().toISOString()} - ${error.stack}\n`;
  fs.appendFile('error.log', logMessage, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

// 소켓 서버 설정
const socketServer = express();
const socketServerHttp = http.createServer(socketServer);
const io = socketio(socketServerHttp, {
  cors: {
    origin: '*',
  },
});

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
      logErrorToFile(error); // 오류를 로그 파일에 기록
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
