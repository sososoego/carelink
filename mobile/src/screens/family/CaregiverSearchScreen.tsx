import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import client from '../../api/client';
import { Caregiver } from '../../types';

const REGIONS = [
  '전체',
  '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시',
  '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도',
  '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도',
  '제주특별자치도',
];

export default function CaregiverSearchScreen() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [region, setRegion] = useState('');
  const [maxHourlyRate, setMaxHourlyRate] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [matchTarget, setMatchTarget] = useState<Caregiver | null>(null);

  const fetchCaregivers = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (region) params.region = region;
      if (maxHourlyRate) params.max_hourly_rate = maxHourlyRate;
      if (minExperience) params.min_experience = minExperience;
      const { data } = await client.get('/caregivers', { params });
      setCaregivers(data);
    } catch {
      setCaregivers([]);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, [region, maxHourlyRate, minExperience]);

  useEffect(() => {
    fetchCaregivers();
  }, []); // 최초 1회만 로드, 이후 검색 버튼으로 수동 실행

  const resetFilters = () => {
    setRegion('');
    setMaxHourlyRate('');
    setMinExperience('');
  };

  const activeFilterCount = [region, maxHourlyRate, minExperience].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 검색 필터 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.filterToggle, activeFilterCount > 0 && styles.filterToggleActive]}
          onPress={() => setFilterVisible((v) => !v)}
        >
          <Text style={[styles.filterToggleText, activeFilterCount > 0 && styles.filterToggleTextActive]}>
            필터{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
        {activeFilterCount > 0 && (
          <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
            <Text style={styles.resetText}>초기화</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.resultCount}>{caregivers.length}명</Text>
      </View>

      {/* 필터 패널 */}
      {filterVisible && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>지역</Text>
          <TouchableOpacity
            style={[styles.filterSelect, region ? styles.selectedBorder : null]}
            onPress={() => setRegionModalVisible(true)}
          >
            <Text style={[styles.filterSelectText, !region && styles.placeholderText]}>
              {region || '전체 지역'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.filterRow}>
            <View style={styles.filterHalf}>
              <Text style={styles.filterLabel}>최소 경력 (년)</Text>
              <TextInput
                style={styles.filterInput}
                placeholder='예: 2'
                value={minExperience}
                onChangeText={(v) => setMinExperience(v.replace(/[^0-9]/g, ''))}
                keyboardType='numeric'
              />
            </View>
            <View style={styles.filterHalf}>
              <Text style={styles.filterLabel}>최대 시급 (원)</Text>
              <TextInput
                style={styles.filterInput}
                placeholder='예: 15000'
                value={maxHourlyRate}
                onChangeText={(v) => setMaxHourlyRate(v.replace(/[^0-9]/g, ''))}
                keyboardType='numeric'
              />
            </View>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={() => fetchCaregivers()}>
            <Text style={styles.searchButtonText}>검색</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 결과 목록 */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size='large' color='#2E86AB' />
        </View>
      ) : (
        <FlatList
          data={caregivers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={caregivers.length === 0 ? styles.emptyContainer : styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchCaregivers(true)} tintColor='#2E86AB' />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>조건에 맞는 간병인이 없습니다.</Text>
            </View>
          }
          renderItem={({ item }) => <CaregiverCard caregiver={item} onMatchPress={setMatchTarget} />}
        />
      )}

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
            data={REGIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const selected = (item === '전체' ? '' : item) === region;
              return (
                <TouchableOpacity
                  style={[styles.pickerItem, selected && styles.pickerItemSelected]}
                  onPress={() => {
                    setRegion(item === '전체' ? '' : item);
                    setRegionModalVisible(false);
                  }}
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
        <MatchRequestModal
          caregiver={matchTarget}
          onClose={() => setMatchTarget(null)}
        />
      )}
    </SafeAreaView>
  );
}

function MatchRequestModal({ caregiver, onClose }: { caregiver: Caregiver; onClose: () => void }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDate = (text: string, prev: string): string => {
    const digits = text.replace(/[^0-9]/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  };

  const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

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
      await client.post('/matches', {
        caregiver_id: caregiver.id,
        start_date: startDate,
        end_date: endDate,
      });
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
      <View style={[styles.modalSheet, matchModalStyles.sheet]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>매칭 요청</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>닫기</Text>
          </TouchableOpacity>
        </View>
        <View style={matchModalStyles.body}>
          <Text style={matchModalStyles.caregiverName}>{caregiver.name} 간병인</Text>
          <Text style={matchModalStyles.label}>간병 시작일</Text>
          <TextInput
            style={matchModalStyles.input}
            placeholder='YYYY-MM-DD'
            value={startDate}
            onChangeText={(t) => setStartDate(formatDate(t, startDate))}
            keyboardType='numeric'
            maxLength={10}
          />
          <Text style={matchModalStyles.label}>간병 종료일</Text>
          <TextInput
            style={matchModalStyles.input}
            placeholder='YYYY-MM-DD'
            value={endDate}
            onChangeText={(t) => setEndDate(formatDate(t, endDate))}
            keyboardType='numeric'
            maxLength={10}
          />
          <TouchableOpacity
            style={[matchModalStyles.submitButton, (!startDate || !endDate || loading) && matchModalStyles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!startDate || !endDate || loading}
          >
            {loading
              ? <ActivityIndicator color='#fff' />
              : <Text style={matchModalStyles.submitText}>요청 보내기</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function CaregiverCard({ caregiver, onMatchPress }: { caregiver: Caregiver; onMatchPress: (c: Caregiver) => void }) {
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', gap: 8 },
  filterToggle: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 20 },
  filterToggleActive: { backgroundColor: '#2E86AB', borderColor: '#2E86AB' },
  filterToggleText: { fontSize: 14, color: '#666' },
  filterToggleTextActive: { color: '#fff', fontWeight: 'bold' },
  resetButton: { paddingHorizontal: 10, paddingVertical: 8 },
  resetText: { fontSize: 14, color: '#e74c3c' },
  resultCount: { marginLeft: 'auto', fontSize: 14, color: '#999' },
  filterPanel: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 12 },
  filterSelect: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterSelectText: { fontSize: 15, color: '#333' },
  chevron: { fontSize: 18, color: '#999' },
  selectedBorder: { borderColor: '#2E86AB' },
  placeholderText: { color: '#aaa' },
  filterRow: { flexDirection: 'row', gap: 12 },
  filterHalf: { flex: 1 },
  filterInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15 },
  searchButton: { backgroundColor: '#2E86AB', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  searchButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  listContent: { padding: 12, gap: 12 },
  emptyContainer: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, color: '#999' },
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

const matchModalStyles = StyleSheet.create({
  sheet: { maxHeight: '50%' },
  body: { padding: 20 },
  caregiverName: { fontSize: 16, fontWeight: 'bold', color: '#2E86AB', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, fontSize: 16 },
  submitButton: { backgroundColor: '#2E86AB', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 24 },
  submitDisabled: { backgroundColor: '#A8DADC' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

const cardStyles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
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
