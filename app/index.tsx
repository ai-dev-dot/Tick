import { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
  TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── Tokens ───
const T = {
  primary: '#FF6B35',
  primarySoft: '#FFF0E8',
  completed: '#8E8E93',
  completedBg: '#F2F2F7',
  surface: '#FBFBF9',
  card: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  separator: '#F0F0ED',
};

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

const TODAY_DATE = '2026年5月5日';
const TODAY_WEEKDAY = '星期一';
const IS_WEEKDAY = !['六', '日'].includes(TODAY_WEEKDAY.slice(-1));

const CAT_ICON: Record<Category, keyof typeof Ionicons.glyphMap> = {
  '生活': 'home-outline',
  '工作': 'briefcase-outline',
  '健康': 'heart-outline',
};

const CAT_COLOR: Record<Category, string> = {
  '生活': T.primary,
  '工作': '#007AFF',
  '健康': '#34C759',
};

const MOCK_TASKS: Task[] = [
  { id: '1', content: '喂小乌龟', category: '生活', deadlineType: '日常', dailyOption: '每天', completed: false, reminderTime: '22:00' },
  { id: '2', content: '晨跑 30 分钟', category: '健康', deadlineType: '日常', dailyOption: '每工作日', completed: true, reminderTime: '07:00' },
  { id: '3', content: '帮娃完成游戏日常', category: '生活', deadlineType: '日常', dailyOption: '每天', completed: true, reminderTime: null },
  { id: '4', content: '超市买菜 — 蔬菜、水果、牛奶', category: '生活', deadlineType: '近期', dailyOption: null, completed: false, reminderTime: null },
  { id: '5', content: '准备周五项目汇报 PPT', category: '工作', deadlineType: '近期', dailyOption: null, completed: false, reminderTime: '09:00' },
  { id: '6', content: '学习 React Native 动画', category: '工作', deadlineType: '长期', dailyOption: null, completed: false, reminderTime: null },
  { id: '7', content: '整理书架和旧杂志', category: '生活', deadlineType: '长期', dailyOption: null, completed: true, reminderTime: null },
];

function sortByStatus(list: Task[]): Task[] {
  return [...list].sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
}

// ─── Home ───
export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [tab, setTab] = useState<FilterTab>('全部');
  const [longExpanded, setLongExpanded] = useState(false);

  const filtered = tasks.filter(t => {
    if (t.deadlineType === '日常' && t.dailyOption === '每工作日' && !IS_WEEKDAY) return false;
    if (tab === '全部') return true;
    if (tab === '日常') return t.deadlineType === '日常';
    if (tab === '近期') return t.deadlineType === '近期';
    return true;
  });

  const daily = filtered.filter(t => t.deadlineType === '日常');
  const recent = filtered.filter(t => t.deadlineType === '近期');
  const longTerm = filtered.filter(t => t.deadlineType === '长期');
  const total = daily.length + recent.length;
  const done = daily.filter(t => t.completed).length + recent.filter(t => t.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const toggle = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const longPress = useCallback((task: Task) => {
    Alert.alert(task.content, '快速编辑', [
      { text: '编辑分类', onPress: () => Alert.alert('选择分类', '', [
        { text: '生活', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, category: '生活' } : t)) },
        { text: '工作', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, category: '工作' } : t)) },
        { text: '健康', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, category: '健康' } : t)) },
        { text: '取消', style: 'cancel' },
      ])},
      { text: '编辑期限', onPress: () => Alert.alert('选择期限', '', [
        { text: '日常 · 每天', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '日常', dailyOption: '每天' } : t)) },
        { text: '日常 · 每工作日', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '日常', dailyOption: '每工作日' } : t)) },
        { text: '近期任务', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '近期', dailyOption: null } : t)) },
        { text: '长期规划', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '长期', dailyOption: null } : t)) },
        { text: '取消', style: 'cancel' },
      ])},
      { text: '取消', style: 'cancel' },
    ]);
  }, []);

  const del = useCallback((task: Task) => {
    Alert.alert('删除任务', `确定删除「${task.content}」？\n任务记录会保留在统计中。`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => setTasks(prev => prev.filter(t => t.id !== task.id)) },
    ]);
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.root}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.weekday}>{TODAY_WEEKDAY}</Text>
            <Text style={s.date}>{TODAY_DATE}</Text>
          </View>
          <TouchableOpacity style={s.ringBtn} onPress={() => router.push('/stats')} activeOpacity={0.6}>
            <View style={s.ring}>
              <Text style={s.ringPct}>{pct}%</Text>
            </View>
            <Text style={s.ringLabel}>{done}/{total} 完成</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          {(['全部', '日常', '近期'] as FilterTab[]).map(t => (
            <Pressable key={t} style={s.tab} onPress={() => setTab(t)}>
              <Text style={[s.tabText, t === tab && s.tabActive]}>{t}</Text>
              {t === tab && <View style={s.tabDot} />}
            </Pressable>
          ))}
        </View>

        {/* List */}
        <ScrollView style={s.list} contentContainerStyle={[s.listInner, filtered.length === 0 && s.listEmpty]} showsVerticalScrollIndicator={false}>
          {daily.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHead}>
                <Ionicons name="pin" size={14} color={T.textSecondary} />
                <Text style={s.sectionTitle}> 日常任务</Text>
              </View>
              <View style={s.card}>
                {sortByStatus(daily).map((task, i) => (
                  <TaskRow key={task.id} task={task} onToggle={toggle} onLongPress={longPress} onDelete={del} last={i === daily.length - 1} />
                ))}
              </View>
            </View>
          )}

          {recent.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHead}>
                <Ionicons name="list-outline" size={14} color={T.textSecondary} />
                <Text style={s.sectionTitle}> 近期任务</Text>
              </View>
              <View style={s.card}>
                {sortByStatus(recent).map((task, i) => (
                  <TaskRow key={task.id} task={task} onToggle={toggle} onLongPress={longPress} onDelete={del} last={i === recent.length - 1} />
                ))}
              </View>
            </View>
          )}

          {longTerm.length > 0 && tab === '全部' && (
            <View style={s.section}>
              <Pressable style={s.sectionHead} onPress={() => setLongExpanded(!longExpanded)}>
                <Ionicons name="archive-outline" size={14} color={T.textSecondary} />
                <Text style={s.sectionTitle}> 长期规划</Text>
                <View style={s.longBadge}>
                  <Text style={s.longBadgeText}>{longTerm.filter(t => t.completed).length}/{longTerm.length}</Text>
                </View>
                <Ionicons name={longExpanded ? 'chevron-down' : 'chevron-forward'} size={14} color={T.textTertiary} />
              </Pressable>
              {longExpanded && (
                <View style={s.card}>
                  {sortByStatus(longTerm).map((task, i) => (
                    <TaskRow key={task.id} task={task} onToggle={toggle} onLongPress={longPress} onDelete={del} last={i === longTerm.length - 1} />
                  ))}
                </View>
              )}
            </View>
          )}

          {filtered.length === 0 && (
            <View style={s.empty}>
              <Ionicons name="sunny-outline" size={48} color={T.primary} />
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

        {/* FAB */}
        <TouchableOpacity style={s.fab} activeOpacity={0.85} onPress={() => Alert.alert('添加任务', '输入你想做的事（Demo）')}>
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Task Row ───
function TaskRow({ task, onToggle, onLongPress, onDelete, last }: {
  task: Task;
  onToggle: (id: string) => void;
  onLongPress: (task: Task) => void;
  onDelete: (task: Task) => void;
  last: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    onToggle(task.id);
  };

  return (
    <Pressable style={[s.row, !last && s.rowBorder]} onPress={press} onLongPress={() => onLongPress(task)} delayLongPress={500}>
      <Animated.View style={[s.circle, task.completed && s.circleDone, { transform: [{ scale }] }]}>
        {task.completed && <Ionicons name="checkmark" size={16} color="#FFF" />}
      </Animated.View>

      <View style={s.body}>
        <Text style={[s.bodyText, task.completed && s.bodyTextDone]} numberOfLines={2}>{task.content}</Text>
        <View style={s.meta}>
          <View style={[s.chip, { borderColor: CAT_COLOR[task.category] }]}>
            <Ionicons name={CAT_ICON[task.category]} size={12} color={CAT_COLOR[task.category]} />
            <Text style={[s.chipText, { color: CAT_COLOR[task.category] }]}> {task.category}</Text>
          </View>
          {task.reminderTime && (
            <View style={s.metaItem}>
              <Ionicons name="time-outline" size={12} color={T.textTertiary} />
              <Text style={s.metaText}> {task.reminderTime}</Text>
            </View>
          )}
          {task.deadlineType === '日常' && task.dailyOption && (
            <View style={s.badge}>
              <Ionicons name="refresh-outline" size={11} color={T.primary} />
              <Text style={s.badgeText}> {task.dailyOption === '每工作日' ? '工作日' : '每天'}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={s.del} onPress={() => onDelete(task)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close-outline" size={20} color={T.textTertiary} />
      </TouchableOpacity>
    </Pressable>
  );
}

// ─── Styles ───
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.surface },
  root: { flex: 1 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  weekday: { fontSize: 13, color: T.textTertiary, fontWeight: '500', letterSpacing: 1, marginBottom: 2 },
  date: { fontSize: 28, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.5 },
  ringBtn: { alignItems: 'flex-end' },
  ring: { width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: T.primary, justifyContent: 'center', alignItems: 'center' },
  ringPct: { fontSize: 13, fontWeight: '700', color: T.primary },
  ringLabel: { fontSize: 11, color: T.textSecondary, marginTop: 3 },

  tabs: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 8, marginBottom: 4 },
  tab: { marginRight: 28, paddingBottom: 6, position: 'relative' },
  tabText: { fontSize: 16, color: T.textTertiary, fontWeight: '500' },
  tabActive: { color: T.primary, fontWeight: '600' },
  tabDot: { position: 'absolute', bottom: 0, left: '50%', marginLeft: -3, width: 6, height: 6, borderRadius: 3, backgroundColor: T.primary },

  list: { flex: 1 },
  listInner: { paddingTop: 12, paddingHorizontal: 20 },
  listEmpty: { flex: 1, justifyContent: 'center' },

  section: { marginBottom: 20 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: T.textSecondary, letterSpacing: 0.5 },
  card: { backgroundColor: T.card, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },

  longBadge: { backgroundColor: T.completedBg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, marginLeft: 6 },
  longBadgeText: { fontSize: 11, color: T.textSecondary, fontWeight: '600' },

  row: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.separator },
  circle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: T.primary, justifyContent: 'center', alignItems: 'center', marginRight: 14, marginTop: 1 },
  circleDone: { borderColor: T.completed, backgroundColor: T.completed },
  body: { flex: 1 },
  bodyText: { fontSize: 16, lineHeight: 22, color: T.textPrimary, fontWeight: '500' },
  bodyTextDone: { color: T.completed, textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.primarySoft, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, borderWidth: 0 },
  chipText: { fontSize: 12, fontWeight: '600' },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: T.textTertiary },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.primarySoft, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '600', color: T.primary },
  del: { paddingLeft: 10, paddingTop: 3 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: T.textPrimary, marginTop: 16, marginBottom: 6 },
  emptyBody: { fontSize: 15, color: T.textSecondary, marginBottom: 28 },
  emptyHints: { alignItems: 'center', gap: 10 },
  emptyHint: { fontSize: 14, color: T.primary, fontWeight: '500' },

  fab: { position: 'absolute', right: 20, bottom: 36, width: 56, height: 56, borderRadius: 28, backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center', shadowColor: T.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
});
