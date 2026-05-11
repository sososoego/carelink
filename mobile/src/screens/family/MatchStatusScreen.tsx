import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import client from '../../api/client';

interface MatchRequest {
  id: string;
  family_id: string;
  caregiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  start_date: string;
  end_date: string;
  created_at: string;
  partner_name: string;
}

const STATUS_LABEL: Record<string, { text: string; color: string; bg: string }> = {
  pending:  { text: '응답 대기 중', color: '#f39c12', bg: '#fef9e7' },
  accepted: { text: '수락됨',       color: '#27ae60', bg: '#eafaf1' },
  rejected: { text: '거절됨',       color: '#e74c3c', bg: '#fdedec' },
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export default function MatchStatusScreen() {
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const { data } = await client.get('/matches');
      setRequests(data);
    } catch {
      setRequests([]);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const pending  = requests.filter((r) => r.status === 'pending');
  const accepted = requests.filter((r) => r.status === 'accepted');
  const rejected = requests.filter((r) => r.status === 'rejected');

  type SectionHeader = { type: 'header'; title: string; id: string };
  type Row = MatchRequest;
  const sections: (SectionHeader | Row)[] = [
    ...(pending.length  > 0 ? [{ type: 'header' as const, title: `응답 대기 중 (${pending.length})`,  id: 'h1' }, ...pending]  : []),
    ...(accepted.length > 0 ? [{ type: 'header' as const, title: `수락됨 (${accepted.length})`,        id: 'h2' }, ...accepted] : []),
    ...(rejected.length > 0 ? [{ type: 'header' as const, title: `거절됨 (${rejected.length})`,        id: 'h3' }, ...rejected] : []),
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size='large' color='#2E86AB' />
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={sections.length === 0 ? styles.emptyContainer : styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchRequests(true)} tintColor='#2E86AB' />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>보낸 매칭 요청이 없습니다.</Text>
            </View>
          }
          renderItem={({ item }) => {
            if ('type' in item && item.type === 'header') {
              return <Text style={styles.sectionHeader}>{item.title}</Text>;
            }
            const req = item as MatchRequest;
            const s = STATUS_LABEL[req.status];
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.caregiverName}>{req.partner_name} 간병인</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusText, { color: s.color }]}>{s.text}</Text>
                  </View>
                </View>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>간병 기간</Text>
                  <Text style={styles.dateValue}>{formatDate(req.start_date)} ~ {formatDate(req.end_date)}</Text>
                </View>
                <Text style={styles.requestedAt}>요청일: {formatDate(req.created_at)}</Text>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 16, gap: 10 },
  emptyContainer: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, color: '#999' },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: '#888', marginTop: 8, marginBottom: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  caregiverName: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },
  dateRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dateLabel: { fontSize: 13, color: '#888' },
  dateValue: { fontSize: 13, color: '#333', fontWeight: '500' },
  requestedAt: { fontSize: 12, color: '#bbb' },
});
