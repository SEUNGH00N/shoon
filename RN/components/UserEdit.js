import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import serverHost from './host';

function UserEdit({ userInfo }) {
  const [editedUserInfo, setEditedUserInfo] = useState({ ...userInfo });
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigation = useNavigation();

  const departmentMap = {
    'software_engineering': '소프트웨어학과',
    'computer_science': '컴퓨터공학과',
    'design': '디자인학과',
    'business-administration': '경영학과'
    // 필요에 따라 추가적인 부서를 매핑할 수 있습니다.
  };


  const handleChange = (field, value) => {
    setEditedUserInfo({ ...editedUserInfo, [field]: value });
  };

  const handleSave = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${serverHost}:4000/edituserinfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, editedUserInfo })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // 수정이 완료되었습니다. 메시지 표시
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        console.error('사용자 정보 수정 실패');
      }
    } catch (error) {
      console.error('사용자 정보 수정 오류:', error);
    }
  };

  const handleDeleteAccount = async () => {
    setIsModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      const response = await fetch(`${serverHost}:4000/deleteaccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userInfo.id, editedUserInfo })
      });

      if (response.ok) {
        alert('회원 탈퇴되었습니다.');
        sessionStorage.removeItem('userId');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      alert('회원 탈퇴 중 오류가 발생했습니다.');
    }
  };

  const handleChangePassword = () => {
    navigation.reset({ index: 0, routes: [{ name: 'ChangePw' }] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={{ uri: userInfo.profileImage || 'https://d1unjqcospf8gs.cloudfront.net/assets/users/default_profile_80-c649f052a34ebc4eee35048815d8e4f73061bf74552558bb70e07133f25524f9.png' }} style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userInfo.name}</Text>
          <Text>{`학번 : ${userInfo.id}`}</Text>
          <Text>{`학과 : ${departmentMap[userInfo.department]}`}</Text>
          <Text>{`학년 : ${userInfo.grade}`}</Text>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          value={editedUserInfo.name}
          placeholder="이름"
          onChangeText={(value) => handleChange('name', value)}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          value={editedUserInfo.email}
          placeholder="이메일"
          onChangeText={(value) => handleChange('email', value)}
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>저장</Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.changePwButton} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>비밀번호 변경</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.withdrawalButton} onPress={handleDeleteAccount}>
          <Text style={styles.buttonText}>회원 탈퇴</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>회원 탈퇴</Text>
            <Text style={styles.modalText}>회원 탈퇴와 함께 K'du-re 에 등록된 모든 개인정보는 삭제, 폐기 처리되며 복구되지 않습니다.</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력하세요"
              secureTextEntry={true}
            />
            <TouchableOpacity style={styles.confirmButton} onPress={confirmDeleteAccount}>
              <Text style={styles.buttonText}>확인</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalOpen(false)}>
              <Text style={styles.buttonText}>취소</Text>
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
    padding: 20,
    marginTop: -160,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  formGroup: {
    marginBottom: 10,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    width: 300,
  },
  saveButton: {
    backgroundColor: '#103260',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
    width: 300,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  changePwButton: {
    backgroundColor: '#103260',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    width: '48%',
  },
  withdrawalButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    width: '48%',
    marginLeft: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#103260',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',

  },
});
export default UserEdit;