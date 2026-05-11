import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function FamilyHomeScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>안녕하세요, {user?.name}님</Text>
      <Text style={styles.subtitle}>간병인을 찾아보세요</Text>
      <TouchableOpacity style={styles.searchButton} onPress={() => navigation.navigate('CaregiverSearch')}>
        <Text style={styles.buttonText}>간병인 검색</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.recommendButton} onPress={() => navigation.navigate('Recommend')}>
        <Text style={styles.buttonText}>조건으로 추천받기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.matchStatusButton} onPress={() => navigation.navigate('MatchStatus')}>
        <Text style={styles.matchStatusText}>매칭 요청 현황</Text>
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
  searchButton: { backgroundColor: '#2E86AB', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  recommendButton: { backgroundColor: '#A8DADC', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  matchStatusButton: { borderWidth: 1, borderColor: '#2E86AB', borderRadius: 8, padding: 16, alignItems: 'center' },
  matchStatusText: { color: '#2E86AB', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { marginTop: 'auto', padding: 16, alignItems: 'center' },
  logoutText: { color: '#999', fontSize: 14 },
});
