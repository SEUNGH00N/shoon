import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import serverHost from './host';

const SearchResults = ({ route, navigation }) => {
  const { searchResults, searchTerm } = route.params;

  const handleProductClick = (productId) => {
    // 상세 페이지로 이동하는 함수
    navigation.navigate('ProductDetail', { productId });
  };
  const extractImageFilename = (imageUrl) => {
    const parts = imageUrl.split('/');
    return parts[parts.length - 1];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>검색 결과 : "{searchTerm}"</Text>
      {searchResults.length === 0 ? (
        <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productItem}
              onPress={() => handleProductClick(item.id)}
            >
              <View style={styles.productCard}>
                <Image
                  source={{ uri: `${serverHost}:4000/uploads/${extractImageFilename(item.image)}` }}
                  style={styles.productImage}
                />
                <View style={styles.infoContainer}>
                  <Text numberOfLines={2} style={styles.productName}>
                    {item.name}
                  </Text>
                  <Text style={styles.productPrice}>{item.price}원</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 70,
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  productItem: {
    marginBottom: 15,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
  },
});

export default SearchResults;
