import { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
  TouchableOpacity, Animated, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// ─── Design Tokens ───
const Tokens = {
  primary: '#FF6B35',
  primarySoft: '#FFF0E8',
  completed: '#8E8E93',
  completedBg: '#F2F2F7',
  delete: '#FF3B30',
  surface: '#FBFBF9',
  card: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  separator: '#F0F0ED',
};

// ─── Types ───
type FilterTab = '全部' | '日常' | '近期';
type Category = '生活' | '工作' | '健康';

interface Task {
  id: string;
  content: string;
  category: Category;
  deadlineType: '日常' | '近期' | '长期';
  dailyOption: '每天' | '每工作日' | null;
  completed: boolean;
  reminderTime: string | null;
}

// ─── Constants ───
const TODAY_DATE = '2026年5月5日';
const TODAY_WEEKDAY = '星期一';
const IS_WEEKDAY = !['六', '日'].includes(TODAY_WEEKDAY.slice(-1));

const CATEGORY_META: Record<Category, { icon: string; label: string }> = {
  '生活': { icon: '🏠', label: '生活' },
  '工作': { icon: '💼', label: '工作' },
  '健康': { icon: '💚', label: '健康' },
};

// ─── Mock Data ───
const MOCK_TASKS: Task[] = [
  { id: '1', content: '喂小乌龟', category: '生活', deadlineType: '日常', dailyOption: '每天', completed: false, reminderTime: '22:00' },
  { id: '2', content: '晨跑 30 分钟', category: '健康', deadlineType: '日常', dailyOption: '每工作日', completed: true, reminderTime: '07:00' },
  { id: '3', content: '帮娃完成游戏日常', category: '生活', deadlineType: '日常', dailyOption: '每天', completed: true, reminderTime: null },
  { id: '4', content: '超市买菜 — 蔬菜、水果、牛奶', category: '生活', deadlineType: '近期', dailyOption: null, completed: false, reminderTime: null },
  { id: '5', content: '准备周五项目汇报 PPT', category: '工作', deadlineType: '近期', dailyOption: null, completed: false, reminderTime: '09:00' },
  { id: '6', content: '学习 React Native 动画', category: '工作', deadlineType: '长期', dailyOption: null, completed: false, reminderTime: null },
  { id: '7', content: '整理书架和旧杂志', category: '生活', deadlineType: '长期', dailyOption: null, completed: true, reminderTime: null },
];

// ─── Helpers ───
function sortByStatus(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
}

// ─── Main ───
export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [activeTab, setActiveTab] = useState<FilterTab>('全部');
  const [longTermExpanded, setLongTermExpanded] = useState(false);

  const filtered = tasks.filter(t => {
    if (t.deadlineType === '日常' && t.dailyOption === '每工作日' && !IS_WEEKDAY) return false;
    if (activeTab === '全部') return true;
    if (activeTab === '日常') return t.deadlineType === '日常';
    if (activeTab === '近期') return t.deadlineType === '近期';
    return true;
  });

  const dailyTasks = filtered.filter(t => t.deadlineType === '日常');
  const recentTasks = filtered.filter(t => t.deadlineType === '近期');
  const longTermTasks = filtered.filter(t => t.deadlineType === '长期');
  const total = dailyTasks.length + recentTasks.length;
  const completed = dailyTasks.filter(t => t.completed).length + recentTasks.filter(t => t.completed).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const handleLongPress = useCallback((task: Task) => {
    Alert.alert(task.content, '快速编辑', [
      {
        text: '编辑分类', onPress: () => {
          Alert.alert('选择分类', '', [
            { text: '🏠 生活', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, category: '生活' } : t)) },
            { text: '💼 工作', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, category: '工作' } : t)) },
            { text: '💚 健康', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, category: '健康' } : t)) },
            { text: '取消', style: 'cancel' },
          ]);
        },
      },
      {
        text: '编辑期限', onPress: () => {
          Alert.alert('选择期限', '', [
            { text: '日常 · 每天', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '日常', dailyOption: '每天' } : t)) },
            { text: '日常 · 每工作日', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '日常', dailyOption: '每工作日' } : t)) },
            { text: '近期任务', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '近期', dailyOption: null } : t)) },
            { text: '长期规划', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '长期', dailyOption: null } : t)) },
            { text: '取消', style: 'cancel' },
          ]);
        },
      },
      { text: '取消', style: 'cancel' },
    ]);
  }, []);

  const handleDelete = useCallback((task: Task) => {
    Alert.alert('删除任务', `确定删除「${task.content}」？\n任务记录会保留在统计中。`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => setTasks(prev => prev.filter(t => t.id !== task.id)) },
    ]);
  }, []);

  const isEmpty = filtered.length === 0;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.container}>
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.weekday}>{TODAY_WEEKDAY}</Text>
            <Text style={s.date}>{TODAY_DATE}</Text>
          </View>
          <TouchableOpacity style={s.statsBtn} onPress={() => router.push('/stats')} activeOpacity={0.6}>
            <View style={s.progressRing}>
              <Text style={s.progressPct}>{pct}%</Text>
            </View>
            <Text style={s.statsLabel}>{completed}/{total} 完成</Text>
          </TouchableOpacity>
        </View>

        {/* ── Tabs ── */}
        <View style={s.tabRow}>
          {(['全部', '日常', '近期'] as FilterTab[]).map(tab => {
            const active = tab === activeTab;
            return (
              <Pressable key={tab} style={s.tab} onPress={() => setActiveTab(tab)}>
                <Text style={[s.tabText, active && s.tabTextActive]}>{tab}</Text>
                {active && <View style={s.tabDot} />}
              </Pressable>
            );
          })}
        </View>

        {/* ── List ── */}
        <ScrollView
          style={s.scroll}
          contentContainerStyle={[s.scrollInner, isEmpty && s.scrollInnerEmpty]}
          showsVerticalScrollIndicator={false}
        >
          {/* Daily */}
          {dailyTasks.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>日常任务</Text>
              <View style={s.card}>
                {sortByStatus(dailyTasks).map((task, i) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onLongPress={handleLongPress}
                    onDelete={handleDelete}
                    isLast={i === dailyTasks.length - 1}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Recent */}
          {recentTasks.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>近期任务</Text>
              <View style={s.card}>
                {sortByStatus(recentTasks).map((task, i) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onLongPress={handleLongPress}
                    onDelete={handleDelete}
                    isLast={i === recentTasks.length - 1}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Long-term */}
          {longTermTasks.length > 0 && activeTab === '全部' && (
            <View style={s.section}>
              <Pressable style={s.longTermHeader} onPress={() => setLongTermExpanded(!longTermExpanded)}>
                <Text style={s.sectionTitle}>长期规划</Text>
                <View style={s.longTermBadge}>
                  <Text style={s.longTermBadgeText}>
                    {longTermTasks.filter(t => t.completed).length}/{longTermTasks.length}
                  </Text>
                </View>
                <Text style={s.expandIcon}>{longTermExpanded ? '▾' : '▸'}</Text>
              </Pressable>
              {longTermExpanded && (
                <View style={s.card}>
                  {sortByStatus(longTermTasks).map((task, i) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onLongPress={handleLongPress}
                      onDelete={handleDelete}
                      isLast={i === longTermTasks.length - 1}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Empty */}
          {isEmpty && (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>✨</Text>
              <Text style={s.emptyTitle}>今天还没有任务</Text>
              <Text style={s.emptyBody}>点击下方 + 号，用一句话创建</Text>
              <View style={s.emptyHints}>
                <Text style={s.emptyHint}>「每天早上 8 点跑步」</Text>
                <Text style={s.emptyHint}>「周末前完成报告」</Text>
                <Text style={s.emptyHint}>「学习一门新技能」</Text>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── FAB ── */}
        <TouchableOpacity
          style={s.fab}
          activeOpacity={0.85}
          onPress={() => Alert.alert('添加任务', '输入你想做的事（Demo）')}
        >
          <Text style={s.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Task Row ───
function TaskRow({ task, onToggle, onLongPress, onDelete, isLast }: {
  task: Task;
  onToggle: (id: string) => void;
  onLongPress: (task: Task) => void;
  onDelete: (task: Task) => void;
  isLast: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { completed } = task;
  const meta = CATEGORY_META[task.category];

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    onToggle(task.id);
  };

  return (
    <Pressable
      style={[s.row, !isLast && s.rowBorder]}
      onPress={handlePress}
      onLongPress={() => onLongPress(task)}
      delayLongPress={500}
    >
      {/* Circle */}
      <Animated.View style={[s.circle, completed && s.circleDone, { transform: [{ scale: scaleAnim }] }]}>
        {completed && <Text style={s.check}>✓</Text>}
      </Animated.View>

      {/* Body */}
      <View style={s.rowBody}>
        <Text style={[s.rowText, completed && s.rowTextDone]} numberOfLines={2}>
          {task.content}
        </Text>
        <View style={s.rowMeta}>
          <View style={s.chip}>
            <Text style={s.chipText}>{meta.icon} {meta.label}</Text>
          </View>
          {task.reminderTime && (
            <Text style={s.metaText}>⏰ {task.reminderTime}</Text>
          )}
          {task.deadlineType === '日常' && task.dailyOption && (
            <Text style={s.badge}>{task.dailyOption === '每工作日' ? '工作日' : '每天'}</Text>
          )}
        </View>
      </View>

      {/* Delete */}
      <TouchableOpacity style={s.delBtn} onPress={() => onDelete(task)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={s.delIcon}>×</Text>
      </TouchableOpacity>
    </Pressable>
  );
}

// ─── Styles ───
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Tokens.surface },
  container: { flex: 1, backgroundColor: Tokens.surface },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8,
  },
  headerLeft: {},
  weekday: { fontSize: 13, color: Tokens.textTertiary, fontWeight: '500', letterSpacing: 1, marginBottom: 2 },
  date: { fontSize: 28, fontWeight: '700', color: Tokens.textPrimary, letterSpacing: -0.5 },
  statsBtn: { alignItems: 'flex-end' },
  progressRing: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 3, borderColor: Tokens.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  progressPct: { fontSize: 13, fontWeight: '700', color: Tokens.primary },
  statsLabel: { fontSize: 11, color: Tokens.textSecondary, marginTop: 3 },

  // Tabs
  tabRow: {
    flexDirection: 'row', paddingHorizontal: 24, marginTop: 8, marginBottom: 4,
  },
  tab: {
    marginRight: 28, paddingBottom: 6, position: 'relative',
  },
  tabText: { fontSize: 16, color: Tokens.textTertiary, fontWeight: '500' },
  tabTextActive: { color: Tokens.primary, fontWeight: '600' },
  tabDot: {
    position: 'absolute', bottom: 0, left: '50%', marginLeft: -3,
    width: 6, height: 6, borderRadius: 3, backgroundColor: Tokens.primary,
  },

  // List
  scroll: { flex: 1 },
  scrollInner: { paddingTop: 12, paddingHorizontal: 20 },
  scrollInnerEmpty: { flex: 1, justifyContent: 'center' },

  // Section
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Tokens.textSecondary, letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  card: {
    backgroundColor: Tokens.card, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
    elevation: 1,
  },

  // Long-term
  longTermHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 4 },
  longTermBadge: {
    backgroundColor: Tokens.completedBg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, marginLeft: 6,
  },
  longTermBadgeText: { fontSize: 11, color: Tokens.textSecondary, fontWeight: '600' },
  expandIcon: { fontSize: 12, color: Tokens.textTertiary, marginLeft: 4 },

  // Row
  row: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: 'transparent',
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Tokens.separator },

  // Circle
  circle: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: Tokens.primary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14, marginTop: 1,
    backgroundColor: 'transparent',
  },
  circleDone: { borderColor: Tokens.completed, backgroundColor: Tokens.completed },
  check: { color: '#FFF', fontSize: 14, fontWeight: '700', marginTop: -1 },

  // Body
  rowBody: { flex: 1 },
  rowText: { fontSize: 16, lineHeight: 22, color: Tokens.textPrimary, fontWeight: '500' },
  rowTextDone: { color: Tokens.completed, textDecorationLine: 'line-through' },
  rowMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  chip: {
    backgroundColor: Tokens.primarySoft, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: Tokens.primary },
  metaText: { fontSize: 12, color: Tokens.textTertiary },
  badge: {
    fontSize: 10, fontWeight: '600', color: Tokens.primary,
    backgroundColor: Tokens.primarySoft, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3,
    overflow: 'hidden',
  },

  // Delete
  delBtn: { paddingLeft: 10, paddingTop: 3 },
  delIcon: { fontSize: 20, color: Tokens.textTertiary, fontWeight: '300' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Tokens.textPrimary, marginBottom: 6 },
  emptyBody: { fontSize: 15, color: Tokens.textSecondary, marginBottom: 28 },
  emptyHints: { alignItems: 'center', gap: 10 },
  emptyHint: { fontSize: 14, color: Tokens.primary, fontWeight: '500' },

  // FAB
  fab: {
    position: 'absolute', right: 20, bottom: 36,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Tokens.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Tokens.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: { color: '#FFF', fontSize: 28, fontWeight: '400', marginTop: -1 },
});
