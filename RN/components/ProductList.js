import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import serverHost from './host';
import Icon from 'react-native-vector-icons/MaterialIcons'; // 아이콘 임포트

function ProductList({ filteredProducts }) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formattedProducts, setFormattedProducts] = useState([]);

  useEffect(() => {
    const formatDate = (createdAt) => {
      const currentTime = new Date();
      const productTime = new Date(createdAt);
      const timeDifference = Math.floor((currentTime - productTime) / (1000 * 60)); // milliseconds to minutes

      if (timeDifference < 30) {
        return '방금 전';
      } else if (timeDifference < 60 * 24) {
        return `${Math.floor(timeDifference / 60)}시간 전`;
      } else if (timeDifference < 60 * 24 * 7) {
        return `${Math.floor(timeDifference / (60 * 24))}일 전`;
      } else if (timeDifference < 60 * 24 * 30) {
        return `${Math.floor(timeDifference / (60 * 24 * 7))}주 전`;
      } else {
        return '한달 ↑';
      }
    };

    const formatted = filteredProducts.map(product => ({
      ...product,
      formattedCreatedAt: formatDate(product.createdAt),
    }));
    setFormattedProducts(formatted);
  }, [filteredProducts]);

  const handleProductClick = async (productId) => {
    const viewedProductKey = `viewed_product_${productId}`;

    try {
      setLoading(true);

      const isProductViewed = await AsyncStorage.getItem(viewedProductKey);

      if (!isProductViewed) {
        await fetch(`${serverHost}:4000/updateViews/${productId}`, {
          method: 'POST',
        });

        await AsyncStorage.setItem(viewedProductKey, 'true');
      }

      await AsyncStorage.setItem('productId', productId.toString()); // Ensure productId is stored as string

      navigation.navigate('ProductDetail', { productId });
    } catch (error) {
      console.error('Error updating views:', error);
    } finally {
      setLoading(false);
    }
  };


  if (!filteredProducts || filteredProducts.length === 0) {
    return <Text style={styles.emptyText}>No products found</Text>;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {formattedProducts.map((product, index) => (
        <TouchableOpacity
          key={product.id}
          style={[
            styles.productItem,
            index === 0 && { marginTop: 3 },
          ]}
          onPress={() => handleProductClick(product.id)}
          disabled={loading}
        >
          <View style={styles.productCard}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: `${serverHost}:4000/uploads/${product.image}` }}
                style={styles.productImage}
              />
            </View>
            <View style={styles.infoContainer}>
              <Text numberOfLines={2} style={styles.productName}>
                {product.name}
              </Text>
              <Text style={styles.productPrice}>{product.price}원</Text>
              <View style={styles.infoRow}>
                <Text style={styles.cardTime}>{product.formattedCreatedAt}</Text>
                <View style={styles.cardViews}>
                  <Icon name="visibility" size={12} style={styles.icon} />
                  <Text>{product.views}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {loading && <ActivityIndicator size="large" color="#000" style={styles.loadingIndicator} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
    marginBottom: 10,
  },
  productItem: {
    marginBottom: 10,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,

    borderColor: '#ddd',
    borderBottomWidth: 2, // 추가된 하단 보더

  },
  imageContainer: {
    width: 120,
    height: 120,
    padding: 4,

  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10
  },
  infoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: -30,
  },
  productPrice: {
    fontSize: 17,
    color: '#888',
    marginBottom: 5,
    marginLeft: 1
  },
  infoRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },
  cardTime: {
    fontSize: 12,
    color: '#aaa',
    marginRight: 15, // 첫 번째 아이템의 오른쪽 여백 조절

  },
  cardViews: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    marginRight: 5,
    color: '#888',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
});

export default ProductList;