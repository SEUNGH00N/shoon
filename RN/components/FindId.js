
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { useNavigation } from '@react-navigation/native';
import serverHost from './host';
const FindId = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    email: '',
    department: '',
    grade: ''
  });
  const [id, setId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [gradeModalVisible, setGradeModalVisible] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${serverHost}:4000/find-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const data = await response.json();
        setId(data.id);
        setErrorMessage('');
        setModalVisible(true);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error);
        setId('');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
      setId('');
    }
  };

  const openGradeModal = () => {
    setGradeModalVisible(true);
  };

  const closeGradeModal = () => {
    setGradeModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>아이디 찾기</Text>
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
      <TouchableOpacity style={styles.findIdButton} onPress={handleSubmit}>
        <Text style={styles.findIdButtonText}>아이디 찾기</Text>
      </TouchableOpacity>
      <Text style={styles.errorMessage}>{errorMessage}</Text>

      {/* 모달 */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>찾은 아이디 : {id}</Text>
            <TouchableOpacity style={styles.loginButton} onPress={() => {
              navigation.navigate('Login');
              setModalVisible(false);
            }}>
              <Text style={styles.loginButtonText}>로그인하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.findPwButton} onPress={() => {
              navigation.navigate('FindPw');
              setModalVisible(false);
            }}>
              <Text style={styles.findPwButtonText}>비밀번호 찾기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  findIdButton: {
    backgroundColor: '#103260',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  findIdButtonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  errorMessage: {
    marginTop: -80,
    color: 'red',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center'
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
    marginRight: 110,
    marginTop: 10,
  },
  loginButtonText: {
    fontSize: 13,
    color: '#ffffff'
  },
  findPwButton: {
    backgroundColor: '#5080c5',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 110,
    marginTop: -37,
  },
  findPwButtonText: {
    fontSize: 13,
    color: '#ffffff'
  },
});

export default FindId;
