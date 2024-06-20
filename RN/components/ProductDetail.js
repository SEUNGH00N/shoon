import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatComponent from './ChatComponent'; // Assuming ChatComponent is correctly defined
import Entypo from 'react-native-vector-icons/Entypo';
import { FontAwesome } from '@expo/vector-icons'; // Expo에서 제공하는 아이콘 라이브러리
import { Alert } from 'react-native';
import serverHost from './host';
import socket from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons'; // or import from 'react-native-vector-icons'

const ProductDetail = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [sellerName, setSellerName] = useState(null);
  const [sellerId, setSellerId] = useState(null);
  const [rates, setRates] = useState(null);
  const [barLength, setBarLength] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Initialize state for the image modal

  useEffect(() => {
    // rates 값이 변경될 때마다 막대기 길이 업데이트
    if (rates !== null) {
      const ratesValue = parseFloat(rates);
      const newBarLength = (ratesValue / 4.5) * 100;
      setBarLength(newBarLength);
    }
  }, [rates]);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        // 서버에서 찜 상태 확인
        const favoriteResponse = await fetch(`${serverHost}:4000/products/isFavorite/${userId}/${productId}`);
        if (favoriteResponse.ok) {
          const { isFavorite } = await favoriteResponse.json();
          setIsFavorite(isFavorite);
        } else {
          console.error('찜 상태 확인 실패:', favoriteResponse.status);
        }
      } catch (error) {
        console.error('찜 상태 확인 오류:', error);
      }
    };

    fetchFavoriteStatus();
  }, [productId, userId]);

  const getBarColor = (rates) => {
    const ratesValue = parseFloat(rates);
    if (ratesValue >= 0 && ratesValue < 1.0) {
      return '#de5d06'; // 빨간색
    } else if (ratesValue >= 1.0 && ratesValue < 2.0) {
      return '#df9100'; // 주황색
    } else if (ratesValue >= 2.0 && ratesValue < 3.0) {
      return '#319e45'; // 연두색
    } else if (ratesValue >= 3.0 && ratesValue < 4.0) {
      return '#1561a9'; // 파란색
    } else if (ratesValue >= 4.0 && ratesValue <= 4.5) {
      return '#0d3a65'; // 남색
    } else {
      return '#000000'; // 기본 색상
    }
  };

  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const response = await fetch(`${serverHost}:4000/products/seller/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setSellerId(data.sellerId);
          setSellerName(data.sellerName);
          setRates(data.rates);
        } else {
          console.error('판매자 정보 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('판매자 정보 가져오기 오류:', error);
      }
    };

    fetchSellerInfo();
  }, [productId]);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await fetch(`${serverHost}:4000/products/detail/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          console.error('상품 상세 정보 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('상품 상세 정보 가져오기 오류:', error);
      }
    };

    fetchProductDetail();
  }, [productId]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        setUserId(id);
      } catch (error) {
        console.error('Error fetching user id:', error);
      }
    };

    fetchUserId();
  }, []);

  const handleChatButtonClick = async () => {
    try {
      const response = await fetch(`${serverHost}:4001/api/chat-rooms?productId=${productId}&userId=${userId}`);
      if (response.ok) {
        const existingChatRoom = await response.json();
        if (existingChatRoom) {
          setIsChatModalOpen(true);
          return;
        }
      }

      const createResponse = await fetch(`${serverHost}:4001/api/chat-rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, userId })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create chat room');
      }

      setIsChatModalOpen(true);
    } catch (error) {
      console.error('Error creating or retrieving chat room:', error);
    }
  };

  const handleCloseChatModal = () => {
    setIsChatModalOpen(false);
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null; // 소켓 객체 초기화
    }
  };

  const handleToggleFavorite = async () => {
    try {
      // 서버에 찜 상태 토글 요청
      const response = await fetch(`${serverHost}:4000/products/toggleFavorite/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite); // 서버에서 받은 찜 상태로 업데이트
      } else {
        Alert.alert('알림', '본인의 게시물에는 찜을 할 수 없습니다.');

      }
    } catch (error) {
      console.error('찜 상태 토글 오류:', error);
    }
  };

  if (!product) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  const availability = product.status === 'available' ? '구매 가능' : '판매 완료';

  const calculateTimeAgo = (date) => {
    const today = new Date();
    const registrationDate = new Date(date);
    const diffTime = today.getTime() - registrationDate.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60)); // milliseconds to minutes

    if (diffMinutes < 30) {
      return '방금 전';
    } else if (diffMinutes < 60 * 24) {
      return `${Math.floor(diffMinutes / 60)}시간 전`;
    } else if (diffMinutes < 60 * 24 * 7) {
      return `${Math.floor(diffMinutes / (60 * 24))}일 전`;
    } else if (diffMinutes < 60 * 24 * 30) {
      return `${Math.floor(diffMinutes / (60 * 24 * 7))}주 전`;
    } else {
      return '한달 ↑';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.contentContainer}>
        <TouchableOpacity onPress={() => { setIsImageModalOpen(!isImageModalOpen); }}>
          <Image style={styles.productImage} source={{ uri: `${serverHost}:4000/uploads/${product.image}` }} />
        </TouchableOpacity>
        <View style={styles.userInfoContainer}>
          <Image
            style={styles.profileImage}
            source={{ uri: 'https://d1unjqcospf8gs.cloudfront.net/assets/users/default_profile_80-c649f052a34ebc4eee35048815d8e4f73061bf74552558bb70e07133f25524f9.png' }}
          />
          <View style={styles.articleProfileLeft}>
            <View style={styles.spaceBetween}>
              <Text style={styles.userId}>학번: {sellerId}</Text>
            </View>
            <Text style={styles.userName}>이름: {sellerName}</Text>
          </View>
          <View style={styles.articleProfileRight}>
            <View style={styles.temperatureWrap}>
              <Text style={styles.temperatureTitle}>매너학점</Text>
              <Text style={styles.temperatureText}>{rates}</Text>
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { width: `${barLength}%`, backgroundColor: getBarColor(rates) }]}></View>
            </View>
          </View>
        </View>

        <View style={styles.productInfoContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.productTitle}>{product.name}</Text>
            <View style={styles.viewInfo}>
              <Ionicons name="eye" size={20} style={styles.icon} />
              <Text style={styles.infoText}>{product.views}</Text>
            </View>
          </View>
          <Text style={styles.productDescription}>{product.description}</Text>
          <View style={styles.productNote}>
            <Text>{product.note}</Text>
            <View style={styles.additionalInfo}>
              <View style={styles.infoItem}>
                <Ionicons name={availability === '구매 가능' ? 'checkmark-circle-outline' : 'close-circle-outline'} size={20} style={[styles.icon, { color: availability === '구매 가능' ? '#319e45' : '#de5d06' }]} />
                <Text style={styles.infoText}>{availability}</Text>

              </View>
            </View>
          </View>
          <Text style={styles.timestamp}>{calculateTimeAgo(product.createdAt)}</Text>
        </View>

        {/* Modals */}
        <Modal
          visible={isChatModalOpen}
          animationType="slide"
          onRequestClose={handleCloseChatModal}
        >
          <View style={styles.modalContainer}>
            <ChatComponent route={route} />
          </View>
        </Modal>
        <Modal
          visible={isImageModalOpen}
          animationType="slide"
          onRequestClose={() => { setIsImageModalOpen(false); }}
        >
          <View style={styles.imagemodalContainer}>
            <Image
              source={{ uri: `${serverHost}:4000/uploads/${product.image}` }}
              style={{ width: '100%', aspectRatio: 4 / 3 }}
              resizeMode="contain"
            />

            <TouchableOpacity style={styles.closeButton} onPress={() => { setIsImageModalOpen(false); }}>
              <FontAwesome name="times-circle" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
          <FontAwesome name={isFavorite ? 'heart' : 'heart-o'} size={24} color={isFavorite ? 'red' : 'black'} />
        </TouchableOpacity>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{product.price.toLocaleString()}원</Text>
          <TouchableOpacity style={styles.chatButton} onPress={handleChatButtonClick}>
            <Entypo name="chat" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.chatButtonText}>채팅하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 15,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  articleProfileLeft: {
    flex: 1,
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userId: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    color: '#000000',
    fontSize: 16,
  },
  articleProfileRight: {
    alignItems: 'flex-end',
  },
  temperatureWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperatureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  temperatureText: {
    color: '#FF4500',
    fontSize: 16,
    marginLeft: 5,
  },
  barContainer: {
    height: 10,
    backgroundColor: '#DCDCDC',
    borderRadius: 5,
    marginTop: 5,
    width: 100,
  },
  bar: {
    height: '100%',
    borderRadius: 5,
  },
  productInfoContainer: {
    backgroundColor: '#F8F8F8',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    marginBottom: 20,
    position: 'relative', // Added for positioning the timestamp
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productDescription: {
    color: '#000000',
    fontSize: 14,
    marginBottom: 10,
  },
  productNote: {
    color: '#000000',
    fontSize: 14,
    marginBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
    position: 'relative', // Added for positioning the availability status
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginHorizontal: 5,
    color: '#888',
  },
  infoText: {
    color: '#000',
    fontSize: 14,
    marginLeft: 5,
  },
  icon: {
    marginRight: 5,
  },
  timestamp: {
    position: 'absolute',
    bottom: -20,
    right: 5,
    color: '#888',
    fontSize: 14,
  },
  availabilityStatus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',

  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 2, // 상단 테두리 두께
    borderTopColor: '#ccc', // 상단 테두리 색상
  },
  heartButton: {
    marginLeft: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    marginRight: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4500',
    padding: 6.5,
    borderRadius: 5,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex',
    alignItems: 'flex',
    backgroundColor: '#FFFFFF',
  },
  imagemodalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
});
export default ProductDetail;
