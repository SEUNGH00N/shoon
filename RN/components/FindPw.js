
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import serverHost from './host';
function FindPw() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleResetPassword = async () => {
    try {
      const response = await fetch(`${serverHost}:4000/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
      } else {
        setMessage('가입하지 않은 이메일입니다.');
      }
    } catch (error) {
      console.error('비밀번호 찾기 오류:', error);
      setMessage('서버 오류로 인해 비밀번호를 찾을 수 없습니다.');
    } finally {
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>비밀번호 찾기</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="이메일"
        keyboardType="email-address"
        required
      />
      <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
        <Text style={styles.resetButtonText}>임시 비밀번호 발급받기</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{message}</Text>
            <TouchableOpacity style={styles.loginButton} onPress={() => {
              navigation.navigate('Login');
              setModalVisible(!modalVisible);
            }}>
              <Text style={styles.loginButtonText}>로그인하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 30,
    marginBottom: 50,
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
  resetButton: {
    backgroundColor: '#103260',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: 'bold',
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
    width: '70%',
  },
  modalText: {
    fontSize: 17,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#5080c5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  loginButtonText: {
    fontSize: 13,
    color: '#ffffff'
  }
});

export default FindPw;
