import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import serverHost from './host';
function Login() {
  const [formData, setFormData] = useState({

    id: '',
    password: ''
  });

  const [loginSuccess, setLoginSuccess] = useState(true);
  // 로그인 상태 관리
  // 승인 대기 상태 관리
  const [, setPendingUser] = useState(false);

  const navigation = useNavigation();
  const handleChange = (value, name) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.id || !formData.password) {
      // console.log('Please enter both id and password');
      return;
    }
    try {
      const response = await fetch(`${serverHost}:4000/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const { message, id, isAdmin } = await response.json();
        // console.log(message); // 로그인 메시지 출력
        // console.log('User ID:', id); // 사용자 ID 출력
        // console.log('Is Admin:', isAdmin); // 관리자 여부 출력
        // 사용자 ID를 AsyncStorage에 저장
        await AsyncStorage.setItem('userId', id);
        // 로그인 성공 시 필요한 작업 수행
        navigation.navigate('Main');
      } else {
        console.error('로그인 실패:', response.status);
        setLoginSuccess(false);
        // 반려된 사용자일 경우
        if (response.status === 403) {
          // 승인 대기 중인 사용자인 경우
          const responseData = await response.json();
          if (responseData.error === '승인 대기 중입니다. 관리자의 승인을 기다려주세요.') {
            setPendingUser(true);
            Alert.alert('승인 대기 중입니다. 관리자의 승인을 기다려주세요.');
          } else {
            // 반려된 사용자일 경우
            const rejectionReason = responseData.rejectionReason || '관리자에게 문의하세요.';
            Alert.alert(`승인이 거절되었습니다. 사유: ${rejectionReason}`);
          }
        }
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setLoginSuccess(false);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userId = await AsyncStorage.getItem('userId');
  
      if (userId) {
        navigation.navigate('Main');
      }
    };
  
    checkLoginStatus();
  }, [navigation]);
  

  const handleNaverLogin = () => {
    navigation.navigate('NaverLoginWebView');
  };

  const handleKakaoLogin = () => {
    navigation.navigate('KakaoLoginWebView');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>L O G I N</Text>
      <TextInput
        style={styles.input}
        placeholder="아이디"
        onChangeText={text => handleChange(text, 'id')}
        value={formData.id}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        onChangeText={text => handleChange(text, 'password')}
        value={formData.password}
        secureTextEntry
      />
      {!loginSuccess && (
        <Text style={styles.errorMessage}>아이디 또는 비밀번호가 올바르지 않습니다.</Text>
      )}
      <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
        <Text style={styles.loginbuttonText}>로그인</Text>
      </TouchableOpacity>
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.additionalButton} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.buttonText}>회원가입</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.additionalButton} onPress={() => navigation.navigate('FindId')}>
          <Text style={styles.buttonText}>아이디 찾기</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.additionalButton} onPress={() => navigation.navigate('FindPw')}>
          <Text style={styles.buttonText}>비밀번호 찾기</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.restButtonGroup}>
        <TouchableOpacity style={styles.socialLoginButton} onPress={handleNaverLogin}>
          <Image source={require('../image/naver.png')} style={styles.socialLoginIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialLoginButton} onPress={handleKakaoLogin}>
          <Image source={require('../image/kakao.png')} style={styles.socialLoginIcon} />
        </TouchableOpacity>


      </View>
      {/* 네이버 로그인 웹뷰 */}


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 40,
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
  errorMessage: {
    color: 'red',
    marginTop: -9,
    marginBottom: -11,
  },
  loginButton: {
    backgroundColor: '#103260',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  loginbuttonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 10,
  },
  additionalButton: {
    
    padding: 10,
    width: '30%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 13,

  },
  separator: {
    width: 1,
    height: 25,
    alignSelf: 'center',
    backgroundColor: '#162b9150',
  },
  restButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 10,
  },
  socialLoginButton: {
    width: '30%',
    alignItems: 'center',
  },
  socialLoginIcon: {
    width: 155,
    height: 40,
    borderRadius: 5
  },
});

export default Login;