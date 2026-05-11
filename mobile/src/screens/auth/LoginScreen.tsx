import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    try {
      console.log('로그인 시도:', email);
      const { data } = await client.post('/auth/login', { email, password });
      console.log('로그인 성공:', data);
      setUser(data);
    } catch (e: any) {
      console.log('로그인 에러:', e.message, e.response?.data);
      Alert.alert('로그인 실패', e.response?.data?.error ?? '서버 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CareLink</Text>
      <TextInput
        style={styles.input}
        placeholder='이메일'
        value={email}
        onChangeText={setEmail}
        keyboardType='email-address'
        autoCapitalize='none'
      />
      <TextInput
        style={styles.input}
        placeholder='비밀번호'
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#2E86AB' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#2E86AB', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 16, color: '#2E86AB', fontSize: 14 },
});
