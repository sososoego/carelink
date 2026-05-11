import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useState } from 'react';
import client from '../../api/client';
import { Caregiver } from '../../types';

const REGIONS = [
  '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시',
  '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도',
  '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도',
  '제주특별자치도',
];

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const autoHyphen = (text: string) => {
  const digits = text.replace(/[^0-9]/g, '');
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
};

const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

export default function RecommendScreen() {
  const [region, setRegion] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxHourlyRate, setMaxHourlyRate] = useState('');
  const [results, setResults] = useState<Caregiver[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [matchTarget, setMatchTarget] = useState<Caregiver | null>(null);

  const handleRecommend = async () => {
    if (startDate && !isValidDate(startDate)) {
      Alert.alert('오류', '시작일 형식이 올바르지 않습니다. (YYYY-MM-DD)');
      return;
    }
    if (endDate && !isValidDate(endDate)) {
      Alert.alert('오류', '종료일 형식이 올바르지 않습니다. (YYYY-MM-DD)');
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      Alert.alert('오류', '시작일이 종료일보다 늦을 수 없습니다.');
      return;
    }
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (region) params.region = region;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (maxHourlyRate) params.max_hourly_rate = maxHourlyRate;
      const { data } = await client.get('/caregivers/recommend', { params });
      setResults(data);
    } catch {
      Alert.alert('오류', '추천 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>
        <Text style={styles.desc}>조건을 입력하면 최대 5명의 간병인을 추천해드립니다.</Text>

        <Text style={styles.label}>지역 <Text style={styles.optional}>(선택)</Text></Text>
        <TouchableOpacity
          style={[styles.selectButton, region ? styles.selectedBorder : null]}
          onPress={() => setRegionModalVisible(true)}
        >
          <Text style={[styles.selectText, !region && styles.placeholder]}>{region || '지역을 선택하세요'}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <Text style={styles.label}>간병 시작일 <Text style={styles.optional}>(선택)</Text></Text>
        <TextInput
          style={styles.input}
          placeholder='YYYY-MM-DD'
          value={startDate}
          onChangeText={(t) => setStartDate(autoHyphen(t))}
          keyboardType='numeric'
          maxLength={10}
        />

        <Text style={styles.label}>간병 종료일 <Text style={styles.optional}>(선택)</Text></Text>
        <TextInput
          style={styles.input}
          placeholder='YYYY-MM-DD'
          value={endDate}
          onChangeText={(t) => setEndDate(autoHyphen(t))}
          keyboardType='numeric'
          maxLength={10}
        />

        <Text style={styles.label}>최대 시급 (원) <Text style={styles.optional}>(선택)</Text></Text>
        <TextInput
          style={styles.input}
          placeholder='예: 15000'
          value={maxHourlyRate}
          onChangeText={(v) => setMaxHourlyRate(v.replace(/[^0-9]/g, ''))}
          keyboardType='numeric'
        />
        {maxHourlyRate ? (
          <Text style={styles.hint}>{Number(maxHourlyRate).toLocaleString()}원 이하</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.recommendButton, loading && styles.buttonDisabled]}
          onPress={handleRecommend}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color='#fff' />
            : <Text style={styles.recommendButtonText}>추천받기</Text>
          }
        </TouchableOpacity>

        {results !== null && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {results.length > 0 ? `추천 간병인 ${results.length}명` : '조건에 맞는 간병인이 없습니다.'}
            </Text>
            {results.map((caregiver) => (
              <RecommendCard
                key={caregiver.id}
                caregiver={caregiver}
                onMatchPress={setMatchTarget}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* 지역 선택 모달 */}
      <Modal visible={regionModalVisible} transparent animationType='slide'>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setRegionModalVisible(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>지역 선택</Text>
            <TouchableOpacity onPress={() => setRegionModalVisible(false)}>
              <Text style={styles.modalClose}>닫기</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={['전체', ...REGIONS]}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const selected = (item === '전체' ? '' : item) === region;
              return (
                <TouchableOpacity
                  style={[styles.pickerItem, selected && styles.pickerItemSelected]}
                  onPress={() => { setRegion(item === '전체' ? '' : item); setRegionModalVisible(false); }}
                >
                  <Text style={[styles.pickerItemText, selected && styles.pickerItemTextSelected]}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

      {/* 매칭 요청 모달 */}
      {matchTarget && (
        <MatchRequestModal caregiver={matchTarget} onClose={() => setMatchTarget(null)} />
      )}
    </SafeAreaView>
  );
}

function RecommendCard({ caregiver, onMatchPress }: { caregiver: Caregiver; onMatchPress: (c: Caregiver) => void }) {
  const rating = parseFloat(caregiver.rating);
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.topRow}>
        <Text style={cardStyles.name}>{caregiver.name}</Text>
        <View style={cardStyles.ratingRow}>
          <Text style={cardStyles.stars}>{stars}</Text>
          <Text style={cardStyles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>
      <View style={cardStyles.infoRow}>
        <InfoBadge label='📍' value={caregiver.regions.join(', ')} />
        <InfoBadge label='경력' value={caregiver.experience === 0 ? '1년 미만' : `${caregiver.experience}년`} />
        <InfoBadge label='시급' value={`${Number(caregiver.hourly_rate).toLocaleString()}원`} />
      </View>
      {caregiver.certifications.length > 0 && (
        <View style={cardStyles.certRow}>
          {caregiver.certifications.map((cert) => (
            <View key={cert} style={cardStyles.certBadge}>
              <Text style={cardStyles.certText}>{cert}</Text>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity style={cardStyles.matchButton} onPress={() => onMatchPress(caregiver)}>
        <Text style={cardStyles.matchButtonText}>매칭 요청</Text>
      </TouchableOpacity>
    </View>
  );
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={cardStyles.infoBadge}>
      <Text style={cardStyles.infoBadgeLabel}>{label} </Text>
      <Text style={cardStyles.infoBadgeValue}>{value}</Text>
    </View>
  );
}

function MatchRequestModal({ caregiver, onClose }: { caregiver: Caregiver; onClose: () => void }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      Alert.alert('오류', '날짜를 YYYY-MM-DD 형식으로 입력해주세요.');
      return;
    }
    if (startDate > endDate) {
      Alert.alert('오류', '시작일이 종료일보다 늦을 수 없습니다.');
      return;
    }
    setLoading(true);
    try {
      await client.post('/matches', { caregiver_id: caregiver.id, start_date: startDate, end_date: endDate });
      Alert.alert('완료', `${caregiver.name} 간병인에게 매칭 요청을 보냈습니다.`, [
        { text: '확인', onPress: onClose },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e.response?.data?.error ?? '요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible transparent animationType='slide'>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose} />
      <View style={[styles.modalSheet, matchStyles.sheet]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>매칭 요청</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>닫기</Text></TouchableOpacity>
        </View>
        <View style={matchStyles.body}>
          <Text style={matchStyles.caregiverName}>{caregiver.name} 간병인</Text>
          <Text style={styles.label}>간병 시작일</Text>
          <TextInput style={styles.input} placeholder='YYYY-MM-DD' value={startDate}
            onChangeText={(t) => setStartDate(autoHyphen(t))} keyboardType='numeric' maxLength={10} />
          <Text style={styles.label}>간병 종료일</Text>
          <TextInput style={styles.input} placeholder='YYYY-MM-DD' value={endDate}
            onChangeText={(t) => setEndDate(autoHyphen(t))} keyboardType='numeric' maxLength={10} />
          <TouchableOpacity
            style={[matchStyles.submitButton, (!startDate || !endDate || loading) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!startDate || !endDate || loading}
          >
            {loading
              ? <ActivityIndicator color='#fff' />
              : <Text style={matchStyles.submitText}>요청 보내기</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, paddingBottom: 48 },
  desc: { fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 16 },
  optional: { fontSize: 12, fontWeight: '400', color: '#999' },
  selectButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectText: { fontSize: 16, color: '#333' },
  selectedBorder: { borderColor: '#2E86AB' },
  placeholder: { color: '#aaa' },
  chevron: { fontSize: 20, color: '#999' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, fontSize: 16 },
  hint: { fontSize: 12, color: '#2E86AB', marginTop: 4, marginLeft: 4 },
  recommendButton: { backgroundColor: '#2E86AB', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 28 },
  recommendButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonDisabled: { backgroundColor: '#A8DADC' },
  resultsSection: { marginTop: 32 },
  resultsTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  modalClose: { fontSize: 14, color: '#2E86AB' },
  pickerItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  pickerItemSelected: { backgroundColor: '#EBF5FB' },
  pickerItemText: { fontSize: 16, color: '#333' },
  pickerItemTextSelected: { color: '#2E86AB', fontWeight: 'bold' },
});

const matchStyles = StyleSheet.create({
  sheet: { maxHeight: '50%' },
  body: { padding: 20 },
  caregiverName: { fontSize: 16, fontWeight: 'bold', color: '#2E86AB', marginBottom: 8 },
  submitButton: { backgroundColor: '#2E86AB', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

const cardStyles = StyleSheet.create({
  card: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stars: { fontSize: 13, color: '#f39c12' },
  ratingText: { fontSize: 13, color: '#666' },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  infoBadge: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  infoBadgeLabel: { fontSize: 12, color: '#888' },
  infoBadgeValue: { fontSize: 12, color: '#333', fontWeight: '600' },
  certRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  certBadge: { backgroundColor: '#EBF5FB', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  certText: { fontSize: 11, color: '#2E86AB' },
  matchButton: { backgroundColor: '#2E86AB', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 4 },
  matchButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});
