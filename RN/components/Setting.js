import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import serverHost from './host';

function Setting() {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);

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
    navigation.navigate('ProductManagement');
  };

  const handleMyinfo = () => {
    navigation.navigate('MyInfo');
  };

  return (
    <View style={styles.container}>
      {userInfo && (
        <>
          <View style={styles.profileContainer}>
            <Image source={{ uri: userInfo.profileImage || 'https://d1unjqcospf8gs.cloudfront.net/assets/users/default_profile_80-c649f052a34ebc4eee35048815d8e4f73061bf74552558bb70e07133f25524f9.png' }} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userInfo.name}</Text>
              <Text>{`학번: ${userInfo.studentId}`}</Text>
              <Text>{`학과: ${userInfo.department}`}</Text>
              <Text>{`학년: ${userInfo.grade}`}</Text>
            </View>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>{`잔액: ${userInfo && parseInt(userInfo.balance).toLocaleString()}원`}</Text>
            <Text style={styles.ratingText}>{`평점: ${userInfo.rates}`}</Text>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.menuItem} onPress={handleProductManagement}>
        <Text>상품 관리</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleMyinfo}>
        <Text>내 정보</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    padding: 20,
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  balanceContainer: {
    borderWidth: 2,
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  balanceText: {
    fontSize: 16,
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 16,
  },
});


export default Setting;
