import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import client from '../../api/client';

const REGIONS = [
  '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시',
  '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도',
  '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도',
  '제주특별자치도',
];

const CERTIFICATIONS = [
  '요양보호사 1급', '요양보호사 2급', '간호조무사', '사회복지사 1급',
  '사회복지사 2급', '치매전문교육 수료', '응급처치 자격증',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1939 }, (_, i) => String(1940 + i)).reverse();
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const EXPERIENCE_OPTIONS = ['1년 미만', ...Array.from({ length: 30 }, (_, i) => `${i + 1}년`)];

type PickerType = 'year' | 'month' | 'day' | 'region' | 'experience' | null;

export default function RegisterProfileScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'남성' | '여성' | null>(null);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [region, setRegion] = useState('');
  const [experience, setExperience] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [activePicker, setActivePicker] = useState<PickerType>(null);
  const [certModalVisible, setCertModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickerData: Record<string, string[]> = {
    year: YEARS, month: MONTHS, day: DAYS, region: REGIONS, experience: EXPERIENCE_OPTIONS,
  };

  const pickerLabel: Record<string, string> = {
    year: '출생 연도', month: '월', day: '일', region: '활동 지역', experience: '경력',
  };

  const selectedValue: Record<string, string> = { year, month, day, region, experience };

  const handlePickerSelect = (value: string) => {
    if (activePicker === 'year') setYear(value);
    else if (activePicker === 'month') setMonth(value);
    else if (activePicker === 'day') setDay(value);
    else if (activePicker === 'region') setRegion(value);
    else if (activePicker === 'experience') setExperience(value);
    setActivePicker(null);
  };

  const toggleCertification = (cert: string) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const experienceToNumber = (exp: string): number => {
    if (exp === '1년 미만') return 0;
    return parseInt(exp, 10);
  };

  const handleSubmit = async () => {
    if (!name || !gender || !year || !month || !day || !region || !experience || !hourlyRate) return;
    setLoading(true);
    try {
      await client.put('/caregivers/profile', {
        gender,
        birth_date: `${year}-${month}-${day}`,
        regions: [region],
        experience: experienceToNumber(experience),
        certifications,
        available_days: [],
        hourly_rate: parseInt(hourlyRate, 10),
        bio: '',
      });
      Alert.alert('완료', '프로필이 등록되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e.response?.data?.error ?? '등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = !!(name && gender && year && month && day && region && experience && hourlyRate);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>
        <Text style={styles.title}>간병인 프로필 등록</Text>

        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          placeholder='이름을 입력하세요'
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>생년월일</Text>
        <View style={styles.dateRow}>
          {(['year', 'month', 'day'] as const).map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.dateButton, selectedValue[key] ? styles.selectedBorder : null]}
              onPress={() => setActivePicker(key)}
            >
              <Text style={[styles.dateButtonText, !selectedValue[key] && styles.placeholderText]}>
                {key === 'year' && (year || '연도')}
                {key === 'month' && (month ? `${month}월` : '월')}
                {key === 'day' && (day ? `${day}일` : '일')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>성별</Text>
        <View style={styles.rowGap}>
          {(['남성', '여성'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.toggleButton, gender === g && styles.toggleButtonActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.toggleText, gender === g && styles.toggleTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>활동 지역</Text>
        <TouchableOpacity
          style={[styles.selectButton, region ? styles.selectedBorder : null]}
          onPress={() => setActivePicker('region')}
        >
          <Text style={[styles.selectButtonText, !region && styles.placeholderText]}>
            {region || '지역을 선택하세요'}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <Text style={styles.label}>경력</Text>
        <TouchableOpacity
          style={[styles.selectButton, experience ? styles.selectedBorder : null]}
          onPress={() => setActivePicker('experience')}
        >
          <Text style={[styles.selectButtonText, !experience && styles.placeholderText]}>
            {experience || '경력을 선택하세요'}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <Text style={styles.label}>자격증 <Text style={styles.optional}>(선택)</Text></Text>
        <TouchableOpacity
          style={[styles.selectButton, certifications.length > 0 ? styles.selectedBorder : null]}
          onPress={() => setCertModalVisible(true)}
        >
          <Text style={[styles.selectButtonText, certifications.length === 0 && styles.placeholderText]} numberOfLines={1}>
            {certifications.length > 0 ? certifications.join(', ') : '자격증을 선택하세요 (복수 선택 가능)'}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <Text style={styles.label}>시급 (원)</Text>
        <TextInput
          style={[styles.input, styles.inputSuffix]}
          placeholder='예: 12000'
          value={hourlyRate}
          onChangeText={(v) => setHourlyRate(v.replace(/[^0-9]/g, ''))}
          keyboardType='numeric'
        />
        {hourlyRate ? (
          <Text style={styles.hint}>시간당 {Number(hourlyRate).toLocaleString()}원</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.submitButton, (!isFormValid || loading) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid || loading}
        >
          {loading
            ? <ActivityIndicator color='#fff' />
            : <Text style={styles.submitButtonText}>등록하기</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      {/* 단일 선택 피커 모달 */}
      <Modal visible={activePicker !== null} transparent animationType='slide'>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActivePicker(null)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{activePicker ? pickerLabel[activePicker] : ''}</Text>
            <TouchableOpacity onPress={() => setActivePicker(null)}>
              <Text style={styles.modalClose}>닫기</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={activePicker ? pickerData[activePicker] : []}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = activePicker ? selectedValue[activePicker] === item : false;
              return (
                <TouchableOpacity
                  style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                  onPress={() => handlePickerSelect(item)}
                >
                  <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

      {/* 자격증 다중 선택 모달 */}
      <Modal visible={certModalVisible} transparent animationType='slide'>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCertModalVisible(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>자격증 선택</Text>
            <TouchableOpacity onPress={() => setCertModalVisible(false)}>
              <Text style={styles.modalClose}>완료</Text>
            </TouchableOpacity>
          </View>
          {CERTIFICATIONS.map((cert) => {
            const selected = certifications.includes(cert);
            return (
              <TouchableOpacity
                key={cert}
                style={[styles.pickerItem, selected && styles.pickerItemSelected]}
                onPress={() => toggleCertification(cert)}
              >
                <View style={styles.certRow}>
                  <Text style={[styles.pickerItemText, selected && styles.pickerItemTextSelected]}>{cert}</Text>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2E86AB', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, fontSize: 16 },
  inputSuffix: { paddingRight: 48 },
  hint: { fontSize: 12, color: '#2E86AB', marginTop: 4, marginLeft: 4 },
  dateRow: { flexDirection: 'row', gap: 8 },
  dateButton: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, alignItems: 'center' },
  dateButtonText: { fontSize: 15, color: '#333' },
  rowGap: { flexDirection: 'row', gap: 12 },
  toggleButton: { flex: 1, padding: 14, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, alignItems: 'center' },
  toggleButtonActive: { backgroundColor: '#2E86AB', borderColor: '#2E86AB' },
  toggleText: { fontSize: 16, color: '#666' },
  toggleTextActive: { color: '#fff', fontWeight: 'bold' },
  selectButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectButtonText: { fontSize: 16, color: '#333', flex: 1, marginRight: 8 },
  chevron: { fontSize: 20, color: '#999' },
  selectedBorder: { borderColor: '#2E86AB' },
  placeholderText: { color: '#aaa' },
  submitButton: { backgroundColor: '#2E86AB', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 40 },
  submitButtonDisabled: { backgroundColor: '#A8DADC' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '55%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  modalClose: { fontSize: 14, color: '#2E86AB' },
  pickerItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  pickerItemSelected: { backgroundColor: '#EBF5FB' },
  pickerItemText: { fontSize: 16, color: '#333' },
  pickerItemTextSelected: { color: '#2E86AB', fontWeight: 'bold' },
  certRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkmark: { fontSize: 16, color: '#2E86AB', fontWeight: 'bold' },
  optional: { fontSize: 12, fontWeight: '400', color: '#999' },
});
