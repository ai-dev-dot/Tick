import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// ─── Tokens ───
const T = {
  primary: '#FF6B35',
  primarySoft: '#FFF0E8',
  completed: '#8E8E93',
  surface: '#FBFBF9',
  card: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  green: '#34C759',
  blue: '#007AFF',
  purple: '#AF52DE',
};

// ─── Mock Stats ───
const STATS = {
  daily: { completed: 6, total: 8, pct: 75 },
  weekly: { completed: 41, total: 50, pct: 82 },
  monthly: { completed: 112, total: 150, pct: 75 },
  categories: {
    '生活': { completed: 38, total: 40, pct: 95, color: T.primary },
    '工作': { completed: 12, total: 20, pct: 60, color: T.blue },
    '健康': { completed: 19, total: 20, pct: 95, color: T.green },
  },
  aiAnalysis: {
    type: 'daily_summary',
    content: {
      highlights: '健康类任务全部完成，保持得很好！',
      concerns: '工作类任务有 2 项未完成，主要集中在下午。',
      suggestion: '明天可以把重要的工作任务安排在上午，你上午的效率更高。',
    },
  },
};

// ─── Components ───
function ProgressBar({ pct, color, height = 6 }: { pct: number; color: string; height?: number }) {
  return (
    <View style={[styles.barTrack, { height }]}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

function StatCard({ label, completed, total, pct, accent }: {
  label: string; completed: number; total: number; pct: number; accent?: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statPct, accent ? { color: accent } : {}]}>{pct}%</Text>
      </View>
      <ProgressBar pct={pct} color={accent || T.primary} />
      <Text style={styles.statDetail}>{completed}/{total} 项完成</Text>
    </View>
  );
}

// ─── Main ───
export default function StatsPage() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner} showsVerticalScrollIndicator={false}>
        {/* Back + Title */}
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.pageTitle}>统计</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Completion Cards */}
        <Text style={styles.sectionLabel}>完成率</Text>
        <View style={styles.cardsRow}>
          <StatCard label="昨日" completed={STATS.daily.completed} total={STATS.daily.total} pct={STATS.daily.pct} accent={T.primary} />
          <StatCard label="本周" completed={STATS.weekly.completed} total={STATS.weekly.total} pct={STATS.weekly.pct} accent={T.green} />
          <StatCard label="本月" completed={STATS.monthly.completed} total={STATS.monthly.total} pct={STATS.monthly.pct} accent={T.blue} />
        </View>

        {/* Category Breakdown */}
        <Text style={styles.sectionLabel}>分类统计</Text>
        <View style={styles.categoryCard}>
          {Object.entries(STATS.categories).map(([name, data], i) => (
            <View key={name} style={[styles.catRow, i < 2 && styles.catRowBorder]}>
              <View style={styles.catHeader}>
                <View style={[styles.catDot, { backgroundColor: data.color }]} />
                <Text style={styles.catName}>{name}</Text>
                <Text style={styles.catPct}>{data.pct}%</Text>
              </View>
              <ProgressBar pct={data.pct} color={data.color} height={4} />
              <Text style={styles.catDetail}>{data.completed}/{data.total} 项</Text>
            </View>
          ))}
        </View>

        {/* AI Analysis */}
        <Text style={styles.sectionLabel}>✨ AI 分析</Text>
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiTitle}>📊 今日总结</Text>
            <Text style={styles.aiBadge}>AI</Text>
          </View>
          <Text style={styles.aiBody}>
            ✅ 亮点：{STATS.aiAnalysis.content.highlights}{'\n'}
            ⚠️ 待改进：{STATS.aiAnalysis.content.concerns}{'\n'}
            💡 建议：{STATS.aiAnalysis.content.suggestion}
          </Text>
          <Pressable style={styles.aiRefresh}>
            <Text style={styles.aiRefreshText}>🔄 重新生成</Text>
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

  // Top
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 28,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  backIcon: { fontSize: 24, color: T.primary, fontWeight: '600' },
  pageTitle: { fontSize: 20, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.3 },

  // Sections
  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: T.textSecondary,
    letterSpacing: 0.5, marginBottom: 10, marginLeft: 4,
  },

  // Stat Cards Row
  cardsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: {
    flex: 1, backgroundColor: T.card, borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
    elevation: 1,
  },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  statLabel: { fontSize: 13, color: T.textSecondary, fontWeight: '500' },
  statPct: { fontSize: 24, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.5 },
  statDetail: { fontSize: 11, color: T.textTertiary, marginTop: 6 },

  // Progress Bar
  barTrack: {
    backgroundColor: '#F0F0ED', borderRadius: 3, overflow: 'hidden',
  },
  barFill: { height: '100%' },

  // Category Card
  categoryCard: {
    backgroundColor: T.card, borderRadius: 14, padding: 16, marginBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
    elevation: 1,
  },
  catRow: { marginBottom: 14 },
  catRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0ED', paddingBottom: 14 },
  catHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  catName: { fontSize: 15, fontWeight: '600', color: T.textPrimary, flex: 1 },
  catPct: { fontSize: 16, fontWeight: '700', color: T.textPrimary },
  catDetail: { fontSize: 11, color: T.textTertiary, marginTop: 4 },

  // AI Card
  aiCard: {
    backgroundColor: T.card, borderRadius: 14, padding: 18, marginBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
    elevation: 1,
  },
  aiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  aiTitle: { fontSize: 16, fontWeight: '700', color: T.textPrimary },
  aiBadge: {
    fontSize: 10, fontWeight: '700', color: T.purple,
    backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
    overflow: 'hidden',
  },
  aiBody: { fontSize: 14, lineHeight: 22, color: T.textPrimary },
  aiRefresh: {
    marginTop: 14, paddingVertical: 10,
    backgroundColor: '#F8F8F6', borderRadius: 10,
    alignItems: 'center',
  },
  aiRefreshText: { fontSize: 13, color: T.textSecondary, fontWeight: '600' },
});
