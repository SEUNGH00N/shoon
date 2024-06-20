import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import serverHost from './host';

function Signup() {
  const navigation = useNavigation();
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
    department: '',
    grade: '',
    studentIdImage: null
  });
  const [idAvailability, setIdAvailability] = useState(null);
  const [itemPrice, setItemPrice] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const getImageFileName = (userId, file) => {
    const extension = file.split('.').pop();
    return `${userId}.${extension}`;
  };

  const handleSubmit = async () => {
    if (!formData.studentIdImage) {
      setErrorMessage('이미지를 선택해주세요.');
      setModalVisible(true);
      return;
    }
    if (signupSuccess) {
      navigation.navigate('Login');
    }
    const imageFileName = getImageFileName(formData.id, formData.studentIdImage);
    const formDataWithImage = new FormData();
    formDataWithImage.append('id', formData.id);
    formDataWithImage.append('name', formData.name);
    formDataWithImage.append('password', formData.password);
    formDataWithImage.append('confirmPassword', formData.confirmPassword);
    formDataWithImage.append('email', formData.email);
    formDataWithImage.append('department', formData.department);
    formDataWithImage.append('grade', formData.grade);

    formDataWithImage.append('studentIdImage', {
      uri: formData.studentIdImage,
      type: 'image/jpeg',
      name: imageFileName,
    });

    try {
      const response = await fetch(`${serverHost}:4000/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'user_id': formData.id,
        },
        body: formDataWithImage,
      });

      if (response.ok) {
        const data = await response.json();
        setSignupSuccess(true);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('클라이언트 오류:', error);
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
      setModalVisible(true);
    }
  };

  const handleCheckAvailability = async () => {
    try {
      const response = await fetch(`${serverHost}:4000/checkUser?id=${formData.id}`);

      if (response.ok) {
        const data = await response.json();
        setIdAvailability(data.available);
        setErrorMessage(data.available ? '사용 가능한 아이디입니다!' : '이미 존재하는 아이디입니다!');
        setModalVisible(true);
      } else {
        setErrorMessage('아이디 중복 확인 중 오류가 발생했습니다.');
        setModalVisible(true);
      }
    } catch (error) {
      console.error('클라이언트 오류:', error);
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
      setModalVisible(true);
    }
  };

  const handleImageSelect = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("갤러리에 접근할 수 있는 권한이 필요합니다.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0 && pickerResult.assets[0].uri) {
      const selectedImageUri = pickerResult.assets[0].uri;
      setFormData(prevState => ({
        ...prevState,
        studentIdImage: selectedImageUri,
      }));
      Alert.alert('이미지가 선택되었습니다.');
    } else {
      console.error('Selected image URI is undefined');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>회원가입</Text>
      {signupSuccess && <Text style={styles.successMessage}>회원가입 성공</Text>}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TextInput
        placeholder="이름"
        value={formData.name}
        onChangeText={text => handleChange('name', text)}
        style={styles.input}
      />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="학번"
          value={formData.id}
          onChangeText={text => handleChange('id', text)}
          style={[styles.input, { flex: 0.73 }]}
        />
        <TouchableOpacity onPress={handleCheckAvailability} style={styles.checkButton}>
          <Text style={styles.checkButtonText}>중복 확인</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        placeholder="비밀번호"
        value={formData.password}
        onChangeText={text => handleChange('password', text)}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="비밀번호 확인"
        value={formData.confirmPassword}
        onChangeText={text => handleChange('confirmPassword', text)}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="이메일"
        value={formData.email}
        onChangeText={text => handleChange('email', text)}
        keyboardType="email-address"
        style={styles.input}
      />
      <View style={styles.departmentContainer}>
        <Picker
          selectedValue={formData.department}
          onValueChange={(itemValue, itemIndex) => handleChange('department', itemValue)}
          style={[styles.picker]}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="학과 선택" value="" style={styles.pickerItem} />
          <Picker.Item label="컴퓨터 공학과" value="computer_science" style={styles.pick} />
          <Picker.Item label="소프트웨어 공학과" value="software_engineering" style={styles.pick} />
          <Picker.Item label="디자인학과" value="design" style={styles.pick} />
          <Picker.Item label="경영학과" value="business-administration" style={styles.pick} />
        </Picker>
      </View>
      <View style={styles.gradeContainer}>
        <Picker
          selectedValue={formData.grade}
          onValueChange={(itemValue, itemIndex) => handleChange('grade', itemValue)}
          style={[styles.picker]}
        >
          <Picker.Item label="학년 선택" value="" style={styles.pickerItem} />
          <Picker.Item label="1학년" value="1" style={styles.pick} />
          <Picker.Item label="2학년" value="2" style={styles.pick} />
          <Picker.Item label="3학년" value="3" style={styles.pick} />
          <Picker.Item label="4학년" value="4" style={styles.pick} />
        </Picker>
      </View>
      <TouchableOpacity onPress={handleImageSelect} style={styles.imageButton}>
        <Text style={styles.imageButtonText}>이미지 선택</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSubmit} style={styles.signupButton}>
        <Text style={styles.signupButtonText}>가입하기</Text>
      </TouchableOpacity>
      <View style={styles.loginContainer}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.loginText}>이미 계정이 있으신가요?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginText, { textDecorationLine: 'underline' }]}>로그인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 30,
    marginBottom: 30,
  },
  input: {
    width: '80%',
    height: 45,
    borderWidth: 1,
    borderColor: '#b0c4de',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkButton: {
    backgroundColor: '#5080c5',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: -15,
    marginLeft: 10,
  },
  checkButtonText: {
    fontSize: 13,
    color: 'white',
  },
  departmentContainer: {
    width: '38%',
    height: 45,
    borderWidth: 1,
    borderColor: '#b0c4de',
    borderRadius: 5,
    marginLeft: -173,
    marginBottom: 10,
  },
  gradeContainer: {
    width: '38%',
    height: 45,
    borderWidth: 1,
    borderColor: '#b0c4de',
    borderRadius: 5,
    marginTop: -55,
    marginLeft: 173,
    marginBottom: 20,
  },
  picker: {
    flex: 1,
    marginTop: -5,
    marginStart: -7,
    marginEnd: -7,
  },
  pickerItem: {
    fontSize: 13,
    color: '#555555',
  },
  pick: {
    fontSize: 13,
    color: '#000000',
  },
  imageButton: {
    backgroundColor: '#5080c5',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  imageButtonText: {
    fontSize: 13,
    color: '#ffffff',
  },
  signupButton: {
    backgroundColor: '#103260',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  loginText: {
    marginRight: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#5080c5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: -7,
  },
  modalButtonText: {
    fontSize: 13,
    color: '#ffffff',
  },
  successMessage: {
    color: 'green',
    marginBottom: 10,
  },
});

export default Signup;