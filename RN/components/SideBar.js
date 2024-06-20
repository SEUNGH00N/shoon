import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons'; // Expo에서 제공하는 아이콘 라이브러리
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import serverHost from './host';

const Sidebar = ({ onClose }) => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);
  const [barLength, setBarLength] = useState(0);
  const [rates, setRates] = useState(null);

  useEffect(() => {
    // rates 값이 변경될 때마다 막대기 길이 업데이트
    if (rates !== null) {
      const ratesValue = parseFloat(rates);
      const newBarLength = (ratesValue / 4.5) * 100;
      setBarLength(newBarLength);
    }
  }, [rates]);

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
    // Fetch user info from the server
    const fetchUserInfo = async () => {
      try {
        // Get user ID from the session or wherever it's stored
        const userId = await AsyncStorage.getItem('userId');
        const response = await fetch(`${serverHost}:4000/getUserInfo`, {

          headers: {
            'user_id': userId // Send user ID in the request headers
          }

        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
          setRates(data.rates);
        } else {
          console.error('Failed to fetch user info');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);
  const handleProductManagement = () => {
    onClose(); // 사이드바 닫기
    navigation.navigate('ProductManagement'); // ProductManagement 화면으로 이동
  };


  const handleMyinfo = () => {
    onClose(); // 사이드바 닫기
    navigation.navigate('MyInfo'); // ProductManagement 화면으로 이동
  };

  const handleWishList = () => {
    onClose(); // 사이드바 닫기
    navigation.navigate('WishList'); // ProductManagement 화면으로 이동
  };

  const handleSelling = () => {
    onClose(); // 사이드바 닫기
    navigation.navigate('Payments'); // ProductManagement 화면으로 이동
  };
  const handleLogout = () => {
    navigation.navigate('Login');
  }

  return (
    <View style={styles.sidebar}>
      {userInfo && (
        <>
          <View style={styles.profileContainer}>
            <Image source={{ uri: userInfo.profileImage || 'https://d1unjqcospf8gs.cloudfront.net/assets/users/default_profile_80-c649f052a34ebc4eee35048815d8e4f73061bf74552558bb70e07133f25524f9.png' }} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userInfo.name}</Text>
              <Text>{`학번 : ${userInfo.id}`}</Text>
              <Text>{`학과 : ${userInfo.department}`}</Text>
              <Text>{`학년 : ${userInfo.grade}`}</Text>
            </View>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>{`잔액: ${userInfo && parseInt(userInfo.total_sales).toLocaleString()}원`}</Text>
            <Text style={styles.ratingText}>{`매너 학점: ${userInfo.rates}`}</Text>
            
            <View style={styles.barContainer}>
              <View style={[styles.bar, { width: `${barLength}%`, backgroundColor: getBarColor(rates) }]}></View>
            </View>
          </View>

        </>
      )}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color="black" />
      </TouchableOpacity>
      <ScrollView>
        <TouchableOpacity onPress={handleMyinfo} style={styles.menuItem}>
          <Ionicons name="person-outline" size={20} color="black" />
          <Text>내 정보</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleWishList}>
          <FontAwesome name="heart-o" size={20} color="black" />
          <Text>찜한 상품</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleProductManagement}>
          <Ionicons name="create-outline" size={20} color="black" />
          <Text>내 상품 관리</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleSelling}>
          <Ionicons name="card-outline" size={20} color="black" />
          <Text>구매 및 판매 내역</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="black" />
          <Text>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#FFFFFF',
    width: 300,
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    elevation: 5,
    paddingTop: 50,
    paddingLeft: 20,
    borderTopEndRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',

  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 27,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  menuItem: {
    marginTop: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.8,
    borderBottomColor: '#CCCCCC',
  },
  balanceContainer: {
    width: 250,
    
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  balanceText: {
    fontSize: 16,
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 16,
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
  meters: {
    height: 10,
    backgroundColor: '#DCDCDC',
    borderRadius: 5,
    marginTop: 5,
    width: 100,
  },
  barContainer: {
    height: 8,
    backgroundColor: '#DCDCDC',
    borderRadius: 5,
    marginTop: 5,
    width: 80,
  },

  bar: {
    height: '100%',
    backgroundColor: '#FF4500',
    borderRadius: 5,
  },
});


export default Sidebar;