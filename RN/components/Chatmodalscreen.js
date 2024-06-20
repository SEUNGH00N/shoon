import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import serverHost from './host';
const ChatModal = ({ chatRoomId, productId, onClose }) => {
  const [userId, setUserId] = useState(null);
  const [userType, setUserType] = useState(null);
  const receiver = userType === 'seller' ? 'buyer' : 'seller';

  const messageContainerRef = useRef(null);
  const socket = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        setUserId(id);
      } catch (error) {
        console.error('사용자 ID를 가져오는 중 오류 발생:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const type = await AsyncStorage.getItem('userType');
        setUserType(type);
      } catch (error) {
        console.error('사용자 유형을 가져오는 중 오류 발생:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    socket.current = io(`${serverHost}:4001/`, {
      query: { productId, receiver }
    });

    socket.current.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    });

    socket.current.on('connect', () => {
      console.log('클라이언트 재연결');
      fetchMessages();
    });

    return () => {
      socket.current.disconnect();
    };
  }, [productId, receiver]);

  useEffect(() => {
    adjustMessageContainer();
  }, [messages]);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollToEnd({ animated: true });
    }
  };

  const adjustMessageContainer = () => {
    scrollToBottom();
  };

  useEffect(() => {
    socket.current.on('chatHistory', (chatHistory) => {
      setMessages(chatHistory);
      scrollToBottom();
    });
  }, [productId, receiver]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${serverHost}:4001/messages/${productId}`, {
        headers: {
          'receiver': receiver
        }
      });
      if (!response.ok) {
        throw new Error('메시지를 불러오지 못했습니다.');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('채팅 기록을 불러오는 중 오류 발생:', error);
    }
  };

  const handleMessageSubmit = () => {
    if (newMessage.trim() !== '') {
      socket.current.emit('sendMessage', { text: newMessage, sender: userId, receiver, productId });
      setNewMessage('');
    }
  };

  const isCurrentUser = (senderId) => senderId === userId;

  return (
    <Modal visible={true} animationType="slide">
      <KeyboardAvoidingView behavior="padding" style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.heading}>채팅방 번호: {chatRoomId}</Text>
          <ScrollView
            showsVerticalScrollIndicator={false} // 스크롤바 숨기기
            ref={messageContainerRef} style={styles.chatContainer}
          >
            {messages.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  isCurrentUser(message.sender) ? styles.sentMessage : styles.receivedMessage,
                  !isCurrentUser(message.sender) && { backgroundColor: '#e6e6e6' } // 받은 메시지일 때 파란 배경색 적용
                ]}
              >
                {/* 메시지 텍스트 */}
                <Text
                  style={[
                    styles.messageText,
                    isCurrentUser(message.sender) && { color: 'white' }, // 보낸 메시지일 때 검은 글자색 적용
                    !isCurrentUser(message.sender) && { color: 'black' } // 받은 메시지일 때 흰색 글자색 적용
                  ]}
                >
                  {message.text}
                </Text>
              </View>

            ))}
          </ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="메시지를 입력하세요..."
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity onPress={handleMessageSubmit} style={styles.sendButton}>
              <Ionicons name="send" size={24} color="#103260" />
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 10,
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chatContainer: {
    flex: 1,
    marginBottom: 10,
  },
  messageContainer: {
    maxWidth: '40%',
    padding: 13,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  messageText: {
    fontSize: 16,
    color: 'black'
  },
  senderText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,


  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#204b80',
    color: 'black',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6e6e6',
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {

    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatModal;