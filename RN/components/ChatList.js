import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatModal from './Chatmodalscreen'; // ChatModal 컴포넌트 import
import serverHost from './host';

const ChatList = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRoomProductId, setSelectedRoomProductId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${serverHost}:4001/myChatRooms`, {
        headers: {
          'user_id': userId
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms');
      }
      const data = await response.json();
      setChatRooms(data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  const openChat = (chatRoomId, productId) => {
    setSelectedRoomId(chatRoomId);
    setSelectedRoomProductId(productId);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setSelectedRoomId(null);
    setSelectedRoomProductId(null);
    setIsChatOpen(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.chatListContainer}>
        <Text style={styles.heading}>참여중인 채팅</Text>
        <View style={styles.separator} />
        {chatRooms.length === 0 ? (
          <Text style={styles.loadingText}>채팅방을 로딩하는 중입니다...</Text>
        ) : (
          <View style={styles.chatRoomList}>
            {chatRooms.map((chatRoom, index) => (
              <View key={chatRoom.id}>
                <TouchableOpacity
                  onPress={() => openChat(chatRoom.id, chatRoom.productId)} // 수정된 부분
                  style={[
                    styles.chatRoomItem,
                    { backgroundColor: selectedRoomId === chatRoom.id ? '#EFEFEF' : 'transparent' }
                  ]}
                >
                  <View style={styles.chatRoomInfo}>
                    <Text style={styles.chatRoomName}>상품명: {chatRoom.productName}</Text>
                    {/* 마지막 메시지 추가 */}
                    <Text style={styles.lastMessage}>{chatRoom.lastMessage}</Text>
                  </View>
                </TouchableOpacity>
                {index < chatRooms.length - 1 && <View style={styles.itemSeparator} />}
              </View>
            ))}
          </View>
        )}
      </View>
      {/* 챗모달 컴포넌트 조건부 렌더링 */}
      {isChatOpen && (
        <ChatModal
          chatRoomId={selectedRoomId}
          productId={selectedRoomProductId}
          onClose={closeChat}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 60
  },
  chatListContainer: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  chatRoomList: {
    marginTop: 10,
  },
  chatRoomItem: {
    padding: 10,
    borderRadius: 5,
  },
  chatRoomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatRoomName: {
    fontSize: 16,
  },
  lastMessage: {
    fontSize: 14,
    color: 'gray',
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
});

export default ChatList;