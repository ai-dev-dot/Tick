import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const T = {
  bg: '#FAFAF8', card: '#FFFFFF', primary: '#FF6B35',
  text: '#1C1C1E', sub: '#8E8E93', faint: '#C7C7CC', line: '#F0EFEC',
  green: '#22C55E', blue: '#3B82F6', purple: '#A855F7',
  life: '#FF6B35', work: '#3B82F6', health: '#22C55E',
};

const STATS = {
  daily:  { done: 6,  total: 8,   pct: 75 },
  weekly: { done: 41, total: 50,  pct: 82 },
  monthly:{ done: 112,total: 150, pct: 75 },
  categories: [
    { name: '生活', done: 38, total: 40, pct: 95, color: T.life,   icon: 'home' as const },
    { name: '工作', done: 12, total: 20, pct: 60, color: T.work,   icon: 'briefcase' as const },
    { name: '健康', done: 19, total: 20, pct: 95, color: T.health, icon: 'heart' as const },
  ],
  ai: {
    highlights: '健康类任务全部完成，保持得很好！',
    concerns: '工作类任务有 2 项未完成，主要集中在下午。',
    suggestion: '明天把重要的工作任务安排在上午，你上午效率更高。',
  },
};

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <View style={s.bar}>
      <View style={[s.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function StatsPage() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={s.top}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={T.primary} />
          </Pressable>
          <Text style={s.title}>统计</Text>
          <View style={s.backBtn} />
        </View>

        {/* Completion */}
        <Text style={s.secTitle}>完成率</Text>
        <View style={s.row3}>
          {[{ label: '昨日', ...STATS.daily, accent: T.primary },
            { label: '本周', ...STATS.weekly, accent: T.green },
            { label: '本月', ...STATS.monthly, accent: T.blue }].map(st => (
            <View key={st.label} style={s.statCard}>
              <Text style={s.statLabel}>{st.label}</Text>
              <Text style={[s.statPct, { color: st.accent }]}>{st.pct}%</Text>
              <Bar pct={st.pct} color={st.accent} />
              <Text style={s.statDetail}>{st.done}/{st.total} 项</Text>
            </View>
          ))}
        </View>

        {/* Categories */}
        <Text style={s.secTitle}>分类统计</Text>
        <View style={s.card}>
          {STATS.categories.map((cat, i) => (
            <View key={cat.name} style={[s.catRow, i < 2 && s.catBorder]}>
              <View style={s.catHead}>
                <View style={[s.catIcon, { backgroundColor: cat.color + '18' }]}>
                  <Ionicons name={cat.icon} size={18} color={cat.color} />
                </View>
                <Text style={s.catName}>{cat.name}</Text>
                <Text style={[s.catPct, { color: cat.color }]}>{cat.pct}%</Text>
              </View>
              <Bar pct={cat.pct} color={cat.color} />
              <Text style={s.catDetail}>{cat.done}/{cat.total} 项</Text>
            </View>
          ))}
        </View>

        {/* AI */}
        <Text style={s.secTitle}>AI 分析</Text>
        <View style={s.aiCard}>
          <View style={s.aiHead}>
            <Ionicons name="sparkles" size={18} color={T.purple} />
            <Text style={s.aiTitle}>  今日总结</Text>
            <View style={s.aiBadge}><Text style={s.aiBadgeTxt}>AI</Text></View>
          </View>
          <Text style={s.aiBody}>
            ✅ 亮点：{STATS.ai.highlights}{'\n\n'}
            ⚠️ 待改进：{STATS.ai.concerns}{'\n\n'}
            💡 建议：{STATS.ai.suggestion}
          </Text>
          <Pressable style={s.aiBtn}>
            <Ionicons name="refresh" size={15} color={T.sub} />
            <Text style={s.aiBtnTxt}>  重新生成</Text>
          </Pressable>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  inner: { paddingHorizontal: 20, paddingTop: 8 },

  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: T.text, letterSpacing: -0.3 },

  secTitle: { fontSize: 13, fontWeight: '700', color: T.sub, letterSpacing: 0.5, marginBottom: 10, marginLeft: 2, textTransform: 'uppercase' },

  // Stat cards
  row3: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: T.card, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  statLabel: { fontSize: 13, color: T.sub, fontWeight: '600', marginBottom: 4 },
  statPct: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 10 },
  statDetail: { fontSize: 11, color: T.faint, fontWeight: '500', marginTop: 6 },

  bar: { height: 5, backgroundColor: '#F0EFEC', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },

  // Categories
  card: { backgroundColor: T.card, borderRadius: 16, padding: 18, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  catRow: { marginBottom: 16 },
  catBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line, paddingBottom: 16 },
  catHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  catIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  catName: { fontSize: 16, fontWeight: '700', color: T.text, flex: 1 },
  catPct: { fontSize: 20, fontWeight: '800' },
  catDetail: { fontSize: 11, color: T.faint, fontWeight: '500', marginTop: 6 },

  // AI
  aiCard: { backgroundColor: T.card, borderRadius: 16, padding: 20, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  aiHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  aiTitle: { fontSize: 17, fontWeight: '800', color: T.text, flex: 1 },
  aiBadge: { backgroundColor: '#F3E8FF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  aiBadgeTxt: { fontSize: 11, fontWeight: '800', color: T.purple },
  aiBody: { fontSize: 14, lineHeight: 24, color: T.text },
  aiBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, paddingVertical: 12, backgroundColor: '#F8F8F6', borderRadius: 12 },
  aiBtnTxt: { fontSize: 14, color: T.sub, fontWeight: '700' },
});
