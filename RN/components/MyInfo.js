import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

import UserEdit from './UserEdit'; // Assuming this component exists
import serverHost from './host';
import { CurrentRenderContext } from '@react-navigation/native';

function MyInfo() {
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);

  const handleConfirm = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId'); // Retrieve userId from AsyncStorage
      const response = await fetch(`${serverHost}:4000/myinfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, password }) // Pass userId from AsyncStorage
      });
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setIsPasswordConfirmed(true);
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('내 정보 확인 오류:', error);
      alert('내 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Main')}>

      </TouchableOpacity>
      <Text style={styles.header}></Text>
      <View style={styles.myInfoContainer}>
        {!isPasswordConfirmed ? (
          <>
            <Text style={styles.inputPassword}>비밀번호를 입력해주세요</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
            />
            <TouchableOpacity onPress={handleConfirm} style={styles.button}>
              <Text style={styles.buttonText}>확인</Text>
            </TouchableOpacity>
          </>
        ) : (
          userInfo && <UserEdit userInfo={userInfo} />
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 200,
    marginBottom: 20,
  },
  myInfoContainer: {
    alignItems: 'center',
  },
  inputPassword: {
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    width: 300,
  },
  button: {
    backgroundColor: '#103260',
    borderRadius: 5,
    padding: 15,
    width: 300,
    marginTop: 20,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MyInfo;