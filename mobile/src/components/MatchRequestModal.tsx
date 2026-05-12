import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import client from '../api/client';
import { Caregiver } from '../types';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear + i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

type PickerField = 'startYear' | 'startMonth' | 'startDay' | 'endYear' | 'endMonth' | 'endDay';

const PICKER_DATA: Record<PickerField, string[]> = {
  startYear: YEARS, startMonth: MONTHS, startDay: DAYS,
  endYear: YEARS, endMonth: MONTHS, endDay: DAYS,
};

const PICKER_LABEL: Record<PickerField, string> = {
  startYear: '시작 연도', startMonth: '시작 월', startDay: '시작 일',
  endYear: '종료 연도', endMonth: '종료 월', endDay: '종료 일',
};

interface Props {
  caregiver: Caregiver;
  onClose: () => void;
}

export default function MatchRequestModal({ caregiver, onClose }: Props) {
  const [startYear, setStartYear] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startDay, setStartDay] = useState('');
  const [endYear, setEndYear] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endDay, setEndDay] = useState('');
  const [activePicker, setActivePicker] = useState<PickerField | null>(null);
  const [loading, setLoading] = useState(false);

  const values: Record<PickerField, string> = {
    startYear, startMonth, startDay, endYear, endMonth, endDay,
  };

  const setters: Record<PickerField, (v: string) => void> = {
    startYear: setStartYear, startMonth: setStartMonth, startDay: setStartDay,
    endYear: setEndYear, endMonth: setEndMonth, endDay: setEndDay,
  };

  const handlePickerSelect = (value: string) => {
    if (activePicker) setters[activePicker](value);
    setActivePicker(null);
  };

  const startDate = startYear && startMonth && startDay
    ? `${startYear}-${startMonth}-${startDay}` : '';
  const endDate = endYear && endMonth && endDay
    ? `${endYear}-${endMonth}-${endDay}` : '';

  const isFormValid = !!(startDate && endDate);

  const handleSubmit = async () => {
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
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={activePicker ? () => setActivePicker(null) : onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>매칭 요청</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>닫기</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <Text style={styles.caregiverName}>{caregiver.name} 간병인</Text>

          <Text style={styles.label}>간병 시작일</Text>
          <View style={styles.dateRow}>
            <DateButton field='startYear' value={startYear} placeholder='연도' onPress={setActivePicker} />
            <DateButton field='startMonth' value={startMonth ? `${startMonth}월` : ''} placeholder='월' onPress={setActivePicker} />
            <DateButton field='startDay' value={startDay ? `${startDay}일` : ''} placeholder='일' onPress={setActivePicker} />
          </View>

          <Text style={styles.label}>간병 종료일</Text>
          <View style={styles.dateRow}>
            <DateButton field='endYear' value={endYear} placeholder='연도' onPress={setActivePicker} />
            <DateButton field='endMonth' value={endMonth ? `${endMonth}월` : ''} placeholder='월' onPress={setActivePicker} />
            <DateButton field='endDay' value={endDay ? `${endDay}일` : ''} placeholder='일' onPress={setActivePicker} />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, (!isFormValid || loading) && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
          >
            {loading
              ? <ActivityIndicator color='#fff' />
              : <Text style={styles.submitText}>요청 보내기</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* 피커 — 같은 Modal 내부에 절대 위치로 렌더링 (iOS 중첩 Modal 미지원 우회) */}
      {activePicker !== null && (
        <>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setActivePicker(null)} />
          <View style={styles.pickerSheet}>
            <View style={styles.header}>
              <Text style={styles.title}>{PICKER_LABEL[activePicker]}</Text>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Text style={styles.close}>닫기</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {PICKER_DATA[activePicker].map((item) => {
                const selected = values[activePicker] === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.pickerItem, selected && styles.pickerItemSelected]}
                    onPress={() => handlePickerSelect(item)}
                  >
                    <Text style={[styles.pickerItemText, selected && styles.pickerItemTextSelected]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </>
      )}
    </Modal>
  );
}

function DateButton({ field, value, placeholder, onPress }: {
  field: PickerField;
  value: string;
  placeholder: string;
  onPress: (f: PickerField) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.dateButton, value ? styles.dateButtonSelected : null]}
      onPress={() => onPress(field)}
    >
      <Text style={[styles.dateButtonText, !value && styles.placeholder]}>{value || placeholder}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  pickerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)' },
  pickerSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '45%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  close: { fontSize: 14, color: '#2E86AB' },
  body: { padding: 20 },
  caregiverName: { fontSize: 16, fontWeight: 'bold', color: '#2E86AB', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 12 },
  dateRow: { flexDirection: 'row', gap: 8 },
  dateButton: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, alignItems: 'center' },
  dateButtonSelected: { borderColor: '#2E86AB' },
  dateButtonText: { fontSize: 14, color: '#333' },
  placeholder: { color: '#aaa' },
  submitButton: { backgroundColor: '#2E86AB', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 24 },
  submitDisabled: { backgroundColor: '#A8DADC' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  pickerItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  pickerItemSelected: { backgroundColor: '#EBF5FB' },
  pickerItemText: { fontSize: 16, color: '#333' },
  pickerItemTextSelected: { color: '#2E86AB', fontWeight: 'bold' },
});
