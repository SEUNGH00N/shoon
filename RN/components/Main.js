import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import Swiper from 'react-native-swiper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ProductList from './ProductList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddProducts from './Addproducts';
import ChatList from './ChatList';
import Sidebar from './SideBar';
import serverHost from './host';
import { useTheme } from 'react-native-paper';

const Tab = createMaterialBottomTabNavigator();

function MainScreen() {
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchViewsProducts = async () => {
    try {
      const response = await fetch(`${serverHost}:4000/products/viewsMob`);
      if (response.ok) {
        const data = await response.json();
        setFilteredProducts(data);
      } else {
        console.error('Error fetching products by views:', response.status);
      }
    } catch (error) {
      console.error('Error fetching products by views:', error);
    }
  };

  useEffect(() => {
    fetchViewsProducts();
  }, []);
  useFocusEffect(
    useCallback(() => {
      fetchViewsProducts();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchViewsProducts().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchViewsProducts();
  }, []);

  const handleSearchProduct = () => {
    navigation.navigate('SearchPage');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePress = () => {
    navigation.navigate('MyInfo');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#103260" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={handleSearchProduct} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#103260" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePress}>
            <Image
              source={{ uri: 'https://d1unjqcospf8gs.cloudfront.net/assets/users/default_profile_80-c649f052a34ebc4eee35048815d8e4f73061bf74552558bb70e07133f25524f9.png' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bannerContainer}>
        <Swiper
          showsButtons={false}
          paginationStyle={{ bottom: -6 }}
          activeDotColor="#103260"
          dotColor="#ffffff"
          dotStyle={{ width: 8, height: 8, borderRadius: 4 }}
          activeDotStyle={{ width: 8, height: 8, borderRadius: 4 }}
        >
          <View style={styles.slide}>
            <Image source={require('../image/123.png')} style={styles.bannerImage} />
          </View>
          <View style={styles.slide}>
            <Image source={{ uri: 'https://ssl.pstatic.net/melona/libs/1497/1497101/875d9ac6d48065f7a3c1_20240604162511108.png' }} style={styles.bannerImage} />
          </View>
        </Swiper>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.productContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ProductList filteredProducts={filteredProducts} />
      </ScrollView>

      {isSidebarOpen && <Sidebar onClose={toggleSidebar} />}
    </View>
  );
}

const BottomTabNavigator = () => {
  const theme = useTheme();
  theme.colors.secondaryContainer = "transparent";

  return (
    <Tab.Navigator
      shifting={true}
      barStyle={{ backgroundColor: 'white' }}
    >
      <Tab.Screen
        name="메인화면"
        component={MainScreen}
        options={{
          tabBarIcon: () => (
            <Ionicons name="list" size={24} color="#103260" />
          ),
        }}
      />
      <Tab.Screen
        name="상품 등록"
        component={AddProducts}
        options={{
          tabBarIcon: () => (
            <Ionicons name="add-circle" size={24} color="#103260" />
          ),
        }}
      />
      <Tab.Screen
        name="채팅 목록"
        component={ChatList}
        options={{
          tabBarIcon: () => (
            <Ionicons name="chatbubbles" size={24} color="#103260" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    borderBottomWidth: 1, // 상단 테두리 두께
    borderBottomColor: '#ccc', // 상단 테두리 색상

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,

  },
  menuButton: {
    marginTop: -2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    borderRadius: 10,
    padding: 10,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 10,
  },
  bannerContainer: {
    height: 120, // 광고 배너 높이 조절
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  bannerImage: {
    width: '90%',
    height: 100,
    resizeMode: 'cover',
  },
  productContainer: {
    flex: 1,
    marginTop: 10,
  },
});

export default BottomTabNavigator;
