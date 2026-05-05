import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── Tokens ───
const T = {
  primary: '#FF6B35', primarySoft: '#FFF0E8',
  completed: '#8E8E93', surface: '#FBFBF9', card: '#FFFFFF',
  textPrimary: '#1C1C1E', textSecondary: '#8E8E93', textTertiary: '#C7C7CC',
  green: '#34C759', blue: '#007AFF', purple: '#AF52DE',
};

// ─── Mock Stats ───
const STATS = {
  daily:  { completed: 6,  total: 8,   pct: 75 },
  weekly: { completed: 41, total: 50,  pct: 82 },
  monthly:{ completed: 112,total: 150, pct: 75 },
  categories: {
    '生活': { completed: 38, total: 40, pct: 95, color: T.primary, icon: 'home-outline' as const },
    '工作': { completed: 12, total: 20, pct: 60, color: T.blue,    icon: 'briefcase-outline' as const },
    '健康': { completed: 19, total: 20, pct: 95, color: T.green,   icon: 'heart-outline' as const },
  },
  aiAnalysis: {
    highlights: '健康类任务全部完成，保持得很好！',
    concerns: '工作类任务有 2 项未完成，主要集中在下午。',
    suggestion: '明天可以把重要的工作任务安排在上午，你上午的效率更高。',
  },
};

// ─── Sub-components ───
function Bar({ pct, color, h = 6 }: { pct: number; color: string; h?: number }) {
  return (
    <View style={[styles.bar, { height: h }]}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color, borderRadius: h / 2 }]} />
    </View>
  );
}

function StatCard({ label, completed, total, pct, accent }: { label: string; completed: number; total: number; pct: number; accent?: string }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statPct, accent ? { color: accent } : {}]}>{pct}%</Text>
      </View>
      <Bar pct={pct} color={accent || T.primary} />
      <Text style={styles.statDetail}>{completed}/{total} 项完成</Text>
    </View>
  );
}

// ─── Main ───
export default function StatsPage() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner} showsVerticalScrollIndicator={false}>
        {/* Top */}
        <View style={styles.top}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={T.primary} />
          </Pressable>
          <Text style={styles.title}>统计</Text>
          <View style={styles.back} />
        </View>

        {/* Completion */}
        <Text style={styles.label}>完成率</Text>
        <View style={styles.row3}>
          <StatCard label="昨日" {...STATS.daily} accent={T.primary} />
          <StatCard label="本周" {...STATS.weekly} accent={T.green} />
          <StatCard label="本月" {...STATS.monthly} accent={T.blue} />
        </View>

        {/* Categories */}
        <Text style={styles.label}>分类统计</Text>
        <View style={styles.card}>
          {Object.entries(STATS.categories).map(([name, data], i) => (
            <View key={name} style={[styles.catRow, i < 2 && styles.catBorder]}>
              <View style={styles.catHead}>
                <View style={[styles.catDot, { backgroundColor: data.color }]} />
                <Ionicons name={data.icon} size={15} color={data.color} />
                <Text style={styles.catName}> {name}</Text>
                <Text style={styles.catPct}>{data.pct}%</Text>
              </View>
              <Bar pct={data.pct} color={data.color} h={4} />
              <Text style={styles.catDetail}>{data.completed}/{data.total} 项</Text>
            </View>
          ))}
        </View>

        {/* AI */}
        <Text style={styles.label}>AI 分析</Text>
        <View style={styles.aiCard}>
          <View style={styles.aiHead}>
            <Ionicons name="flash-outline" size={16} color={T.purple} />
            <Text style={styles.aiTitle}> 今日总结</Text>
            <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI</Text></View>
          </View>
          <Text style={styles.aiBody}>
            ✅ 亮点：{STATS.aiAnalysis.highlights}{'\n'}
            ⚠️ 待改进：{STATS.aiAnalysis.concerns}{'\n'}
            💡 建议：{STATS.aiAnalysis.suggestion}
          </Text>
          <Pressable style={styles.aiRefresh}>
            <Ionicons name="refresh-outline" size={13} color={T.textSecondary} />
            <Text style={styles.aiRefreshText}> 重新生成</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.surface },
  scroll: { flex: 1 },
  scrollInner: { paddingHorizontal: 20, paddingTop: 8 },

  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  back: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  title: { fontSize: 20, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.3 },

  label: { fontSize: 13, fontWeight: '600', color: T.textSecondary, letterSpacing: 0.5, marginBottom: 10, marginLeft: 4 },

  // Stats row
  row3: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: T.card, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  statLabel: { fontSize: 13, color: T.textSecondary, fontWeight: '500' },
  statPct: { fontSize: 24, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.5 },
  statDetail: { fontSize: 11, color: T.textTertiary, marginTop: 6 },

  // Bar
  bar: { backgroundColor: '#F0F0ED', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%' },

  // Category
  card: { backgroundColor: T.card, borderRadius: 14, padding: 16, marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  catRow: { marginBottom: 14 },
  catBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0ED', paddingBottom: 14 },
  catHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { fontSize: 15, fontWeight: '600', color: T.textPrimary, flex: 1 },
  catPct: { fontSize: 16, fontWeight: '700', color: T.textPrimary },
  catDetail: { fontSize: 11, color: T.textTertiary, marginTop: 4 },

  // AI
  aiCard: { backgroundColor: T.card, borderRadius: 14, padding: 18, marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  aiHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiTitle: { fontSize: 16, fontWeight: '700', color: T.textPrimary, flex: 1 },
  aiBadge: { backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  aiBadgeText: { fontSize: 10, fontWeight: '700', color: T.purple },
  aiBody: { fontSize: 14, lineHeight: 22, color: T.textPrimary },
  aiRefresh: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14, paddingVertical: 10, backgroundColor: '#F8F8F6', borderRadius: 10 },
  aiRefreshText: { fontSize: 13, color: T.textSecondary, fontWeight: '600' },
});
