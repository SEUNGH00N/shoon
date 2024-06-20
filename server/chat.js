// 필요한 모듈을 불러옵니다.
const { app, pool } = require('./db');
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

// 미들웨어 설정: JSON 파싱 및 CORS 허용
app.use(express.json());
app.use(cors());

// HTTP 서버와 소켓 서버를 생성합니다.
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
  },
});

// 소켓 연결 설정
io.on('connection', (socket) => {
  console.log('Client connected');

  // 클라이언트가 메시지를 보낼 때
  socket.on('sendMessage', async (message) => {
    try {
      // 데이터베이스에 메시지를 저장
      const connection = await pool.getConnection();
      await connection.query('INSERT INTO messages (productId, text, sender, receiver, createdAt) VALUES (?, ?, ?, ?, NOW())', [message.productId, message.text, message.sender, message.receiver]);
      connection.release();

      // 모든 클라이언트에 새로운 메시지를 전송
      io.emit('newMessage', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // 클라이언트가 연결을 끊을 때
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// 특정 상품에 대한 채팅 메시지를 가져오는 엔드포인트
app.get('/messages/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    // 데이터베이스에서 해당 상품의 채팅 메시지를 가져오는 쿼리 실행
    const query = `
      SELECT * 
      FROM messages 
      WHERE productId = ?;
    `;
    const [messages] = await pool.query(query, [productId]);

    // 클라이언트에 메시지 응답
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 사용자 유형을 가져오는 엔드포인트
app.get('/userType', async (req, res) => {
  const userId = req.query.user_id;
  try {
    // 데이터베이스 연결을 획득
    const connection = await pool.getConnection();
    // 사용자 유형을 가져오는 쿼리 실행
    const [rows] = await connection.execute('SELECT userType FROM users WHERE id = ?', [userId]);
    connection.release(); // 연결 반환
    // 결과 반환
    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json({ userType: rows[0].userType });
    }
  } catch (error) {
    console.error('Error fetching user type:', error);
    res.status(500).json({ error: 'Failed to fetch user type' });
  }
});

// 특정 사용자의 채팅방 목록을 가져오는 엔드포인트
app.get('/chatRooms', async (req, res) => {
  const { userId, productId } = req.headers;
  try {
    const connection = await pool.getConnection();
    // 데이터베이스에서 채팅방 목록을 가져오는 쿼리 실행
    const [rows] = await connection.query(
      'SELECT * FROM chat_rooms WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 새로운 채팅방을 생성하거나 이미 존재하는 채팅방을 반환하는 엔드포인트
app.post('/api/chat-rooms', async (req, res) => {
  const { productId, userId } = req.body;

  try {
    // 이미 존재하는 채팅방인지 확인
    const [existingRows] = await pool.query('SELECT * FROM chat_rooms WHERE product_id = ? AND user_id = ?', [productId, userId]);
    if (existingRows.length > 0) {
      // 이미 존재하는 채팅방이면 해당 채팅방 정보를 응답
      res.status(200).json(existingRows[0]);
      return;
    }

    // 새로운 채팅방 생성 쿼리
    const insertQuery = 'INSERT INTO chat_rooms (product_id, user_id) VALUES (?, ?)';
    const [result] = await pool.query(insertQuery, [productId, userId]);

    const newChatRoomId = result.insertId; // 새로 생성된 채팅방의 ID
    res.status(201).json({ id: newChatRoomId }); // JSON 형식으로 새로운 채팅방 정보를 응답
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 사용자가 입장한 채팅방 목록을 가져오는 엔드포인트
app.get('/myChatRooms', async (req, res) => {
  const userId = req.headers['user_id']; // 클라이언트에서 전달한 사용자 ID를 헤더로부터 가져옵니다.
  
  try {
    // 데이터베이스에서 사용자가 입장한 채팅방 목록과 해당 채팅방의 상품명을 가져오는 쿼리 실행
    const [rows] = await pool.query(
      'SELECT chat_rooms.id, chat_rooms.product_id, products.name AS product_name FROM chat_rooms JOIN products ON chat_rooms.product_id = products.id WHERE chat_rooms.user_id = ?',
      [userId]
    );

    // 채팅방 데이터를 객체 형태로 변환하여 클라이언트에 응답
    const chatRooms = rows.map(row => ({
      id: row.id,
      productId: row.product_id,
      productName: row.product_name // 상품명 추가
    }));

    res.json(chatRooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 특정 상품의 판매자 ID를 가져오는 엔드포인트
app.get('/product/sellerId/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    // 데이터베이스 연결을 획득
    const connection = await pool.getConnection();

    // 쿼리 실행
    const query = 'SELECT user_id FROM products WHERE id = ?';
    const [rows] = await connection.execute(query, [productId]);

    connection.release(); // 연결 반환

    if (rows.length === 0) {
      // 해당 상품이 없는 경우
      res.status(404).json({ error: 'Product not found' });
    } else {
      // 결과 반환 (판매자 ID)
      const sellerId = rows[0].user_id;
      res.json({ sellerId });
    }
  } catch (error) {
    console.error('Error fetching user_id:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 서버를 설정된 포트에서 실행합니다.
const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
