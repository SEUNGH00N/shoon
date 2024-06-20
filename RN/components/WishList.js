import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native'; // ScrollView 추가
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons'; // Expo에서 제공하는 아이콘 라이브러리
import AsyncStorage from '@react-native-async-storage/async-storage';
import serverHost from './host';

const ShowWishlist = () => {
  const [userId, setUserId] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId);
      } catch (error) {
        console.error('Error fetching user id:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchWishlistItems = async () => {
        try {
          const response = await fetch(`${serverHost}:4000/favorites?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            setWishlistItems(data);
          } else {
            console.error('Error fetching wishlist items:', response.status);
          }
        } catch (error) {
          console.error('Error fetching wishlist items:', error);
        }
      };

      fetchWishlistItems();
    }
  }, [userId]);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const updatedItems = await Promise.all(
          wishlistItems.map(async (product) => {
            const favoriteResponse = await fetch(`${serverHost}:4000/products/isFavorite/${userId}/${product.product_id}`);
            if (favoriteResponse.ok) {
              const { isFavorite } = await favoriteResponse.json();
              return { ...product, isFavorite };
            } else {
              console.error('찜 상태 확인 실패:', favoriteResponse.status);
              return product;
            }
          })
        );
        setWishlistItems(updatedItems);
      } catch (error) {
        console.error('찜 상태 확인 오류:', error);
      }
    };

    if (wishlistItems.length > 0) {
      fetchFavoriteStatus();
    }
  }, [wishlistItems, userId]);

  const handleProductClick = (productId) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleToggleFavorite = async (productId) => {
    try {
      const response = await fetch(`${serverHost}:4000/products/toggleFavorite/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems((prevItems) =>
          prevItems.map((item) =>
            item.product_id === productId ? { ...item, isFavorite: data.isFavorite } : item
          )
        );
      } else {
        console.error('찜 상태 토글 실패:', response.status);
      }
    } catch (error) {
      console.error('찜 상태 토글 오류:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.wishlistTitle}>찜 목록</Text>
      <ScrollView
        showsVerticalScrollIndicator={false} // 스크롤바 숨기기
      >
        <View style={styles.wishlistContainer}>
          {wishlistItems.map((product) => (
            <TouchableOpacity key={product.id} style={styles.wishlistItem} onPress={() => handleProductClick(product.product_id)}>
              <TouchableOpacity style={styles.wishlistBadge} onPress={() => handleToggleFavorite(product.product_id)}>
                {product.isFavorite ? <FontAwesome name="heart" size={24} color="red" /> : <FontAwesome name="heart-o" size={24} color="black" />}
              </TouchableOpacity>
              <Image
                source={{ uri: `${serverHost}:4000/uploads/${product.image}` }}
                style={styles.wishImage}
                onPress={() => handleProductClick(product.product_id)}
              />
              <View style={styles.wishDetails}>
                <Text style={styles.wishName}>{product.product_name}</Text>
                <Text style={styles.wishPrice}>{product.price.toLocaleString()}원</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 30
  },
  wishlistTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  wishlistContainer: {
    flexDirection: 'column',
  },
  wishlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1, // 테두리 두께
    borderColor: '#ddd', // 테두리 색상
    borderRadius: 5, // 테두리의 모서리를 둥글게 설정
    padding: 5, // 패딩 추가
    backgroundColor: '#fff', // 배경색 추가
  },
  wishlistBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  wishImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius:5,
  },
  wishDetails: {
    flex: 1,
  },
  wishName: {
    fontSize: 18,
    marginBottom: 5,
  },
  wishPrice: {
    fontSize: 16,
  },
});

export default ShowWishlist;