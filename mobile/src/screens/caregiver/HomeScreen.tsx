import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

export default function CaregiverHomeScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isNewUser = useAuthStore((state) => state.isNewUser);
  const clearNewUser = useAuthStore((state) => state.clearNewUser);

  useEffect(() => {
    if (isNewUser) {
      clearNewUser();
      navigation.navigate('RegisterProfile');
    }
  }, [isNewUser]);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>안녕하세요, {user?.name}님</Text>
      <Text style={styles.subtitle}>매칭 요청을 확인하세요</Text>
      <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('RegisterProfile')}>
        <Text style={styles.buttonText}>내 프로필 관리</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.requestButton} onPress={() => navigation.navigate('MatchRequests')}>
        <Text style={styles.buttonText}>매칭 요청 확인</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  greeting: { fontSize: 24, fontWeight: 'bold', marginTop: 60, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8, marginBottom: 40 },
  profileButton: { backgroundColor: '#2E86AB', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  requestButton: { backgroundColor: '#A8DADC', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { marginTop: 'auto', padding: 16, alignItems: 'center' },
  logoutText: { color: '#999', fontSize: 14 },
});
