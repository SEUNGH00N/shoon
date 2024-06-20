import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import serverHost from './host';
import { useNavigation } from '@react-navigation/native';

function ChangePw() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const navigation = useNavigation();

    const handleChangePassword = async () => {
        try {
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                alert('모든 필드를 입력해주세요.');
                return;
            }

            if (newPassword !== confirmNewPassword) {
                alert('새 비밀번호가 일치하지 않습니다.');
                return;
            }

            const userId = await AsyncStorage.getItem('userId');

            if (!userId) {
                alert('사용자 ID를 가져오지 못했습니다.');
                return;
            }

            const response = await fetch(`${serverHost}:4000/changepassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, currentPassword, newPassword })
            });

            if (response.ok) {
                alert('비밀번호가 변경되었습니다.');
                navigation.navigate('Login');
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('비밀번호 변경 오류:', error);
            alert('비밀번호 변경 중 오류가 발생했습니다.');
        }
    };

    const handleClose = () => {
        navigation.navigate('MyInfo');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>비밀번호 재설정</Text>
            <Text style={styles.label}>현재 암호</Text>
            <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={true}
                placeholder="현재 비밀번호 입력"
            />
            <Text style={styles.label}>새 암호</Text>
            <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={true}
                placeholder="새 비밀번호 입력"
            />
            <Text style={styles.label}>새 암호 재입력</Text>
            <TextInput
                style={styles.input}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry={true}
                placeholder="새 비밀번호 재입력"
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={handleClose}>
                    <Text style={styles.buttonText}>닫기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleChangePassword}>
                    <Text style={styles.buttonText}>확인</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginTop: 170,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        borderRadius: 5,
        padding: 15,
        alignItems: 'center',
        width: '48%',
    },
    closeButton: {
        backgroundColor: '#ccc',
    },
    confirmButton: {
        backgroundColor: '#103260',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ChangePw;