import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import serverHost from './host';

const ProductManagementForm = () => {
  const route = useRoute();
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const navigation = useNavigation();
  const [editedProduct, setEditedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const response = await fetch(`${serverHost}:4000/productsD/${productId}`, {
          headers: {
            'user_id': userId
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setEditedProduct({ ...data });
          setDescriptionCharCount(data.description.length);
          setImagePreview(`${serverHost}:4000/uploads/${data.image}`);
        } else {
          console.error('Error fetching product details:', response.status);
          Alert.alert('Error', 'Failed to fetch product details. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        Alert.alert('Error', 'An error occurred while fetching product details. Please check your network connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    if (imageFile) {
      setImagePreview(imageFile); // 이미지 파일이 변경될 때 바로 미리보기로 설정
    }
  }, [imageFile]); // imageFile 상태가 변경될 때마다 실행

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("사진 접근 권한이 필요합니다!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (pickerResult.canceled === true) {
      return;
    }

    if (pickerResult.assets && pickerResult.assets.length > 0 && pickerResult.assets[0].uri) {
      setImageFile(pickerResult.assets[0].uri);
    } else {
      console.error('Selected image URI is undefined');
      Alert.alert('Error', 'Selected image URI is undefined');
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const userId = await AsyncStorage.getItem('userId');
      const formData = new FormData();

      if (imageFile) {
        formData.append('image', {
          uri: imageFile,
          name: 'image.jpg',
          type: 'image/jpeg'
        });
      }

      formData.append('name', editedProduct.name);
      formData.append('description', editedProduct.description);
      formData.append('price', editedProduct.price);

      const response = await sendRequestWithRetry(`${serverHost}:4000/productsmanage/${editedProduct.id}`, {
        method: 'PUT',
        headers: {
          'user_id': userId,
        },
        body: formData
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProduct(updatedProduct);
        Alert.alert('상품 수정 성공!', '수정이 완료되었습니다.');
        navigation.navigate('Main');
      } else {
        console.error('Error saving product changes:', response.status);
        Alert.alert('Error', 'Failed to save product changes. Please try again.');
      }
    } catch (error) {
      console.error('Error saving product changes:', error);
      Alert.alert('Error', 'An error occurred while saving product changes. Please check your network connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const sendRequestWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed: ${error.message}`);
        if (i === retries - 1) throw error;
      }
    }
  };

  const handleInputChange = (name, value) => {
    if (name === "price") {
      if (/^\d*$/.test(value) && value.length <= 8) {
        setEditedProduct({ ...editedProduct, [name]: value });
      }
    } else if (name === "description") {
      if (value.length <= 1000) {
        setEditedProduct({ ...editedProduct, [name]: value });
        setDescriptionCharCount(value.length);
      }
    } else {
      setEditedProduct({ ...editedProduct, [name]: value });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.flexContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.imageUpload}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              style={styles.image}
              source={{ uri: imagePreview }}
            />
          </TouchableOpacity>
          <Text style={styles.imageLabel}>이미지를 수정하려면 이미지를 터치 해주세요!</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>상품명</Text>
          <TextInput
            style={styles.input}
            value={editedProduct.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="상품명을 입력해 주세요."
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>상품 설명</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={editedProduct.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="브랜드, 모델명, 구매시기, 하자 유무 등 상품 설명을 적어주세요."
            multiline
          />
          <Text style={styles.charCount}>{descriptionCharCount} / 1000</Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>가격</Text>
          <View style={styles.priceInput}>
            <TextInput
              style={styles.input}
              value={editedProduct.price}
              onChangeText={(value) => handleInputChange('price', value)}
              placeholder="가격을 입력해 주세요."
              keyboardType="numeric"
            />
            <Text style={styles.priceUnit}>원</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button
          title={isSaving ? 'Saving...' : '수정'}
          onPress={handleSaveChanges}
          disabled={isSaving}
          color={'#103260'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 16,
    flexGrow: 1,
    marginTop: 40
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUpload: {
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    marginRight: 235
  },
  imageLabel: {
    fontSize: 14,
    color: '#888',
    marginRight: 220
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#888',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceUnit: {
    fontSize: 16,
    marginLeft: 8,
  },

  buttonContainer: {
    padding: 16,
  },
});
export default ProductManagementForm;