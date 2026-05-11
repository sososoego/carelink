import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
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

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  pending:  { text: '대기 중',  color: '#f39c12' },
  accepted: { text: '수락됨',   color: '#27ae60' },
  rejected: { text: '거절됨',   color: '#e74c3c' },
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export default function MatchRequestsScreen() {
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

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

  const handleUpdateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    const label = status === 'accepted' ? '수락' : '거절';
    Alert.alert(
      `매칭 ${label}`,
      `이 매칭 요청을 ${label}하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: label,
          style: status === 'rejected' ? 'destructive' : 'default',
          onPress: async () => {
            setUpdating(id);
            try {
              const { data } = await client.put(`/matches/${id}`, { status });
              setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: data.status } : r));
            } catch (e: any) {
              Alert.alert('오류', e.response?.data?.error ?? '처리에 실패했습니다.');
            } finally {
              setUpdating(null);
            }
          },
        },
      ]
    );
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const others = requests.filter((r) => r.status !== 'pending');

  const sections = [
    ...(pending.length > 0 ? [{ type: 'header', title: `대기 중 (${pending.length})`, id: 'h1' }, ...pending] : []),
    ...(others.length > 0 ? [{ type: 'header', title: '처리 완료', id: 'h2' }, ...others] : []),
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size='large' color='#2E86AB' />
        </View>
      ) : (
        <FlatList
          data={sections as any[]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={sections.length === 0 ? styles.emptyContainer : styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchRequests(true)} tintColor='#2E86AB' />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>매칭 요청이 없습니다.</Text>
            </View>
          }
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return <Text style={styles.sectionHeader}>{item.title}</Text>;
            }
            const req = item as MatchRequest;
            const statusInfo = STATUS_LABEL[req.status];
            const isPending = req.status === 'pending';

            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.partnerName}>{req.partner_name}</Text>
                    <Text style={styles.dateRange}>
                      {formatDate(req.start_date)} ~ {formatDate(req.end_date)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                  </View>
                </View>

                <Text style={styles.requestedAt}>요청일: {formatDate(req.created_at)}</Text>

                {isPending && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.rejectButton, updating === req.id && styles.buttonDisabled]}
                      onPress={() => handleUpdateStatus(req.id, 'rejected')}
                      disabled={updating === req.id}
                    >
                      {updating === req.id
                        ? <ActivityIndicator size='small' color='#e74c3c' />
                        : <Text style={styles.rejectText}>거절</Text>
                      }
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.acceptButton, updating === req.id && styles.buttonDisabled]}
                      onPress={() => handleUpdateStatus(req.id, 'accepted')}
                      disabled={updating === req.id}
                    >
                      {updating === req.id
                        ? <ActivityIndicator size='small' color='#fff' />
                        : <Text style={styles.acceptText}>수락</Text>
                      }
                    </TouchableOpacity>
                  </View>
                )}
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
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  partnerName: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  dateRange: { fontSize: 14, color: '#555' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },
  requestedAt: { fontSize: 12, color: '#aaa', marginBottom: 14 },
  actionRow: { flexDirection: 'row', gap: 10 },
  rejectButton: {
    flex: 1, borderWidth: 1, borderColor: '#e74c3c',
    borderRadius: 8, padding: 12, alignItems: 'center',
  },
  rejectText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 15 },
  acceptButton: {
    flex: 2, backgroundColor: '#2E86AB',
    borderRadius: 8, padding: 12, alignItems: 'center',
  },
  acceptText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  buttonDisabled: { opacity: 0.5 },
});
