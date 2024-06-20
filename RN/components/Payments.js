import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import serverHost from './host';

function Payments({ navigation }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId !== null) {
        loadPayments(userId);
      } else {
        console.error('User ID not found in AsyncStorage');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user ID from AsyncStorage', error);
      setLoading(false);
    }
  };

  const loadPayments = async (userId) => {
    try {
      const response = await fetch(`${serverHost}:4000/payments/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      const sortedPayments = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 결제 날짜를 기준으로 내림차순 정렬
      setPayments(sortedPayments);
      setLoading(false);
    } catch (error) {
      console.error('Error loading payments', error);
      setLoading(false);
    }
  };

  const handleProductClick = async (productId) => {
    try {
      const viewedProductKey = `viewed_product_${productId}`;

      // 세션 스토리지에서 해당 상품의 조회 기록 확인
      const isProductViewed = AsyncStorage.getItem(viewedProductKey);

      if (!isProductViewed) {
        try {
          // 서버에 조회수 업데이트 요청
          await fetch(`${serverHost}:4000/updateViews/${productId}`, {
            method: 'POST',
          });

          // 세션 스토리지에 조회 기록 저장
          AsyncStorage.setItem(viewedProductKey, 'true');
        } catch (error) {
          console.error('Error updating views:', error);
        }
      }

      // 상품 상세 페이지로 이동
      navigation.navigate('ProductDetail', { productId });
    } catch (error) {
      console.error('Error handling product click:', error);
    }
  };

  const renderPaymentItem = ({ item }) => {
    // 결제 날짜를 YYYY년 MM월 DD일 hh:mm:ss 포맷으로 변환
    const formattedDate = new Date(item.createdAt).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });

    const formattedAmount = parseInt(item.amount).toLocaleString();

    return (
      <TouchableOpacity onPress={() => handleProductClick(item.product_id)}>
        <View style={styles.paymentItem}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.paymentDate}>구매일: {formattedDate}</Text>
          <Text style={styles.paymentAmount}>주문번호: {item.orderId}</Text>
          <Text style={styles.paymentAmount}>금액: {formattedAmount}원</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>결제 내역</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 30
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paymentItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  paymentDate: {
    marginTop: 5,
    color: '#666',
  },
  paymentAmount: {
    marginTop: 5,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Payments;