import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { UserRole } from '../../types';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('family');
  const setUser = useAuthStore((state) => state.setUser);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('오류', '모든 항목을 입력해주세요.');
      return;
    }
    try {
      const { data } = await client.post('/auth/signup', { name, email, password, role });
      setUser(data, role === 'caregiver');
    } catch (e: any) {
      Alert.alert('회원가입 실패', e.response?.data?.error ?? '서버 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === 'family' && styles.roleActive]}
          onPress={() => setRole('family')}
        >
          <Text style={[styles.roleText, role === 'family' && styles.roleTextActive]}>환자 가족</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === 'caregiver' && styles.roleActive]}
          onPress={() => setRole('caregiver')}
        >
          <Text style={[styles.roleText, role === 'caregiver' && styles.roleTextActive]}>간병인</Text>
        </TouchableOpacity>
      </View>
      <TextInput style={styles.input} placeholder='이름' value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder='이메일' value={email} onChangeText={setEmail} keyboardType='email-address' autoCapitalize='none' />
      <TextInput style={styles.input} placeholder='비밀번호' value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>가입하기</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>이미 계정이 있으신가요? 로그인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 32, color: '#2E86AB' },
  roleContainer: { flexDirection: 'row', marginBottom: 20, gap: 12 },
  roleButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, alignItems: 'center' },
  roleActive: { backgroundColor: '#2E86AB', borderColor: '#2E86AB' },
  roleText: { fontSize: 15, color: '#666' },
  roleTextActive: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#2E86AB', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 16, color: '#2E86AB', fontSize: 14 },
});
