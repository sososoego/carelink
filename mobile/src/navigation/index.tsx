import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import FamilyHomeScreen from '../screens/family/HomeScreen';
import CaregiverSearchScreen from '../screens/family/CaregiverSearchScreen';
import MatchStatusScreen from '../screens/family/MatchStatusScreen';
import RecommendScreen from '../screens/family/RecommendScreen';
import CaregiverHomeScreen from '../screens/caregiver/HomeScreen';
import RegisterProfileScreen from '../screens/caregiver/RegisterProfileScreen';
import MatchRequestsScreen from '../screens/caregiver/MatchRequestsScreen';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  const user = useAuthStore((state) => state.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name='Login' component={LoginScreen} />
            <Stack.Screen name='Signup' component={SignupScreen} />
          </>
        ) : user.role === 'family' ? (
          <>
            <Stack.Screen name='FamilyHome' component={FamilyHomeScreen} />
            <Stack.Screen name='CaregiverSearch' component={CaregiverSearchScreen} options={{ headerShown: true, title: '간병인 검색' }} />
            <Stack.Screen name='MatchStatus' component={MatchStatusScreen} options={{ headerShown: true, title: '매칭 요청 현황' }} />
            <Stack.Screen name='Recommend' component={RecommendScreen} options={{ headerShown: true, title: '조건으로 추천받기' }} />
          </>
        ) : (
          <>
            <Stack.Screen name='CaregiverHome' component={CaregiverHomeScreen} />
            <Stack.Screen name='RegisterProfile' component={RegisterProfileScreen} options={{ headerShown: true, title: '프로필 등록' }} />
            <Stack.Screen name='MatchRequests' component={MatchRequestsScreen} options={{ headerShown: true, title: '매칭 요청 확인' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
