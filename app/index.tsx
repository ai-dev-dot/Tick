import { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
  TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── Colors ───
const C = {
  bg: '#FAFAF8',
  card: '#FFFFFF',
  primary: '#FF6B35',
  text: '#1C1C1E',
  sub: '#8E8E93',
  faint: '#C7C7CC',
  line: '#F0EFEC',
  // Category colors
  life: '#FF6B35',
  lifeBg: '#FFF2EC',
  work: '#3B82F6',
  workBg: '#EFF4FF',
  health: '#22C55E',
  healthBg: '#ECFDF3',
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
const WEEKDAY = '星期一';
const IS_WEEKDAY = !['六', '日'].includes(WEEKDAY.slice(-1));

const CAT: Record<Category, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  '生活': { icon: 'home', color: C.life, bg: C.lifeBg },
  '工作': { icon: 'briefcase', color: C.work, bg: C.workBg },
  '健康': { icon: 'heart', color: C.health, bg: C.healthBg },
};

const MOCK: Task[] = [
  { id: '1', content: '喂小乌龟', category: '生活', deadlineType: '日常', dailyOption: '每天', completed: false, reminderTime: '22:00' },
  { id: '2', content: '晨跑 30 分钟', category: '健康', deadlineType: '日常', dailyOption: '每工作日', completed: true, reminderTime: '07:00' },
  { id: '3', content: '帮娃完成游戏日常', category: '生活', deadlineType: '日常', dailyOption: '每天', completed: true, reminderTime: null },
  { id: '4', content: '超市买菜 — 蔬菜、水果、牛奶', category: '生活', deadlineType: '近期', dailyOption: null, completed: false, reminderTime: null },
  { id: '5', content: '准备周五项目汇报 PPT', category: '工作', deadlineType: '近期', dailyOption: null, completed: false, reminderTime: '09:00' },
  { id: '6', content: '学习 React Native 动画', category: '工作', deadlineType: '长期', dailyOption: null, completed: false, reminderTime: null },
  { id: '7', content: '整理书架和旧杂志', category: '生活', deadlineType: '长期', dailyOption: null, completed: true, reminderTime: null },
];

function byStatus(list: Task[]): Task[] {
  return [...list].sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
}

// ─── Home ───
export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK);
  const [tab, setTab] = useState<FilterTab>('全部');
  const [longOpen, setLongOpen] = useState(false);

  const visible = tasks.filter(t => {
    if (t.deadlineType === '日常' && t.dailyOption === '每工作日' && !IS_WEEKDAY) return false;
    if (tab === '全部') return true;
    if (tab === '日常') return t.deadlineType === '日常';
    if (tab === '近期') return t.deadlineType === '近期';
    return true;
  });

  const daily = visible.filter(t => t.deadlineType === '日常');
  const recent = visible.filter(t => t.deadlineType === '近期');
  const long = visible.filter(t => t.deadlineType === '长期');
  const total = daily.length + recent.length;
  const done = daily.filter(t => t.completed).length + recent.filter(t => t.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const toggle = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const longPress = useCallback((task: Task) => {
    const actions = [
      { text: '编辑分类', onPress: () => Alert.alert('选择分类', '', [
        { text: '生活', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, category: '生活' } : t)) },
        { text: '工作', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, category: '工作' } : t)) },
        { text: '健康', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, category: '健康' } : t)) },
        { text: '取消', style: 'cancel' as const },
      ])},
      { text: '编辑期限', onPress: () => Alert.alert('选择期限', '', [
        { text: '日常 · 每天', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '日常', dailyOption: '每天' } : t)) },
        { text: '日常 · 每工作日', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '日常', dailyOption: '每工作日' } : t)) },
        { text: '近期任务', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '近期', dailyOption: null } : t)) },
        { text: '长期规划', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '长期', dailyOption: null } : t)) },
        { text: '取消', style: 'cancel' as const },
      ])},
      { text: '取消', style: 'cancel' as const },
    ];
    Alert.alert(task.content, '快速编辑', actions);
  }, []);

  const del = useCallback((task: Task) => {
    Alert.alert('删除任务', `确定删除「${task.content}」？\n任务记录会保留在统计中。`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => setTasks(prev => prev.filter(t => t.id !== task.id)) },
    ]);
  }, []);

  return (
    <SafeAreaView style={ss.safe} edges={['top']}>
      <View style={ss.root}>
        {/* ── Header ── */}
        <View style={ss.head}>
          <View>
            <Text style={ss.wkday}>{WEEKDAY}</Text>
            <Text style={ss.date}>{TODAY_DATE}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/stats')} activeOpacity={0.7} style={ss.pctWrap}>
            <View style={ss.pctRing}>
              <Text style={ss.pctNum}>{pct}%</Text>
            </View>
            <Text style={ss.pctSub}>{done}/{total}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Tabs ── */}
        <View style={ss.tabs}>
          {(['全部', '日常', '近期'] as FilterTab[]).map(t => (
            <Pressable key={t} style={ss.tab} onPress={() => setTab(t)}>
              <Text style={[ss.tabTxt, t === tab && ss.tabOn]}>{t}</Text>
              {t === tab && <View style={ss.tabDot} />}
            </Pressable>
          ))}
        </View>

        {/* ── List ── */}
        <ScrollView style={ss.scroll} contentContainerStyle={[ss.scrollIn, visible.length === 0 && ss.scrollEmpty]} showsVerticalScrollIndicator={false}>
          {daily.length > 0 && (
            <View style={ss.block}>
              <View style={ss.blockHead}>
                <Ionicons name="pin" size={13} color={C.sub} />
                <Text style={ss.blockTitle}> 日常任务</Text>
              </View>
              <View style={ss.card}>
                {byStatus(daily).map((t, i) => (
                  <TaskRow key={t.id} task={t} onToggle={toggle} onLongPress={longPress} onDelete={del} last={i === daily.length - 1} />
                ))}
              </View>
            </View>
          )}

          {recent.length > 0 && (
            <View style={ss.block}>
              <View style={ss.blockHead}>
                <Ionicons name="list" size={13} color={C.sub} />
                <Text style={ss.blockTitle}> 近期任务</Text>
              </View>
              <View style={ss.card}>
                {byStatus(recent).map((t, i) => (
                  <TaskRow key={t.id} task={t} onToggle={toggle} onLongPress={longPress} onDelete={del} last={i === recent.length - 1} />
                ))}
              </View>
            </View>
          )}

          {long.length > 0 && tab === '全部' && (
            <View style={ss.block}>
              <Pressable style={ss.blockHead} onPress={() => setLongOpen(!longOpen)}>
                <Ionicons name="archive" size={13} color={C.sub} />
                <Text style={ss.blockTitle}> 长期规划</Text>
                <View style={ss.badge}>
                  <Text style={ss.badgeText}>{long.filter(t => t.completed).length}/{long.length}</Text>
                </View>
                <Ionicons name={longOpen ? 'chevron-down' : 'chevron-forward'} size={12} color={C.faint} />
              </Pressable>
              {longOpen && (
                <View style={ss.card}>
                  {byStatus(long).map((t, i) => (
                    <TaskRow key={t.id} task={t} onToggle={toggle} onLongPress={longPress} onDelete={del} last={i === long.length - 1} />
                  ))}
                </View>
              )}
            </View>
          )}

          {visible.length === 0 && (
            <View style={ss.empty}>
              <Ionicons name="sunny" size={52} color={C.primary} />
              <Text style={ss.emptyTitle}>今天还没有任务</Text>
              <Text style={ss.emptySub}>点击 + 号，用一句话创建</Text>
              <View style={ss.emptyHints}>
                {['每天早上 8 点跑步','周末前完成报告','学习一门新技能'].map(h => (
                  <Text key={h} style={ss.emptyHint}>「{h}」</Text>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 96 }} />
        </ScrollView>

        {/* ── FAB ── */}
        <TouchableOpacity style={ss.fab} activeOpacity={0.88} onPress={() => Alert.alert('添加任务', '输入你想做的事（Demo）')}>
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Task Row ───
function TaskRow({ task, onToggle, onLongPress, onDelete, last }: {
  task: Task; onToggle: (id: string) => void; onLongPress: (task: Task) => void; onDelete: (task: Task) => void; last: boolean;
}) {
  const anim = useRef(new Animated.Value(1)).current;
  const cat = CAT[task.category];

  const tap = () => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.82, duration: 80, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    onToggle(task.id);
  };

  return (
    <Pressable style={[ss.row, !last && ss.rowLine]} onPress={tap} onLongPress={() => onLongPress(task)} delayLongPress={500}>
      {/* Circle */}
      <Animated.View style={[ss.circle, task.completed && ss.circleDone, { transform: [{ scale: anim }] }]}>
        {task.completed && <Ionicons name="checkmark" size={16} color="#FFF" />}
      </Animated.View>

      {/* Content */}
      <View style={ss.body}>
        <Text style={[ss.bodyText, task.completed && ss.bodyDone]} numberOfLines={2}>{task.content}</Text>
        <View style={ss.meta}>
          {/* Category chip — color coded */}
          <View style={[ss.chip, { backgroundColor: cat.bg }]}>
            <Ionicons name={cat.icon} size={13} color={cat.color} />
            <Text style={[ss.chipTxt, { color: cat.color }]}>  {task.category}</Text>
          </View>

          {task.reminderTime && (
            <View style={ss.metaRow}>
              <Ionicons name="time" size={13} color={C.sub} />
              <Text style={ss.metaTxt}>  {task.reminderTime}</Text>
            </View>
          )}

          {task.deadlineType === '日常' && task.dailyOption && (
            <View style={ss.repeat}>
              <Ionicons name="repeat" size={12} color={C.primary} />
              <Text style={ss.repeatTxt}>  {task.dailyOption === '每工作日' ? '工作日' : '每天'}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Delete */}
      <TouchableOpacity style={ss.delBtn} onPress={() => onDelete(task)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Ionicons name="close-circle" size={22} color={C.line} />
      </TouchableOpacity>
    </Pressable>
  );
}

// ─── Styles ───
const ss = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  root: { flex: 1 },

  // Header
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 },
  wkday: { fontSize: 13, color: C.faint, fontWeight: '500', letterSpacing: 1, marginBottom: 2 },
  date: { fontSize: 30, fontWeight: '700', color: C.text, letterSpacing: -0.5 },
  pctWrap: { alignItems: 'flex-end', paddingTop: 4 },
  pctRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 3, borderColor: C.primary, justifyContent: 'center', alignItems: 'center' },
  pctNum: { fontSize: 14, fontWeight: '800', color: C.primary },
  pctSub: { fontSize: 10, color: C.sub, marginTop: 3, fontWeight: '600' },

  // Tabs
  tabs: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 8 },
  tab: { marginRight: 32, paddingBottom: 8, position: 'relative' },
  tabTxt: { fontSize: 16, color: C.faint, fontWeight: '500' },
  tabOn: { color: C.text, fontWeight: '700' },
  tabDot: { position: 'absolute', bottom: 0, left: '50%', marginLeft: -4, width: 8, height: 3, borderRadius: 2, backgroundColor: C.primary },

  // Scroll
  scroll: { flex: 1 },
  scrollIn: { paddingHorizontal: 20, paddingTop: 8 },
  scrollEmpty: { flex: 1, justifyContent: 'center' },

  // Section
  block: { marginBottom: 22 },
  blockHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: 2 },
  blockTitle: { fontSize: 13, fontWeight: '700', color: C.sub, letterSpacing: 0.4, textTransform: 'uppercase' },
  card: { backgroundColor: C.card, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },

  badge: { backgroundColor: '#F2F2F7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, marginLeft: 8, marginRight: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', color: C.sub },

  // Row
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 18, paddingVertical: 15 },
  rowLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },

  // Circle
  circle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2.5, borderColor: C.primary, justifyContent: 'center', alignItems: 'center', marginRight: 14, marginTop: 1 },
  circleDone: { borderColor: '#34C759', backgroundColor: '#34C759' },

  // Body
  body: { flex: 1, paddingRight: 4 },
  bodyText: { fontSize: 16, lineHeight: 23, color: C.text, fontWeight: '600' },
  bodyDone: { color: C.faint, textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },

  // Chip
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  chipTxt: { fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaTxt: { fontSize: 12, color: C.sub, fontWeight: '500' },
  repeat: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primary + '12', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  repeatTxt: { fontSize: 11, fontWeight: '600', color: C.primary },

  delBtn: { paddingLeft: 10, paddingTop: 3 },

  // Empty
  empty: { alignItems: 'center', paddingTop: 64 },
  emptyTitle: { fontSize: 21, fontWeight: '800', color: C.text, marginTop: 18, marginBottom: 6 },
  emptySub: { fontSize: 15, color: C.sub, marginBottom: 32 },
  emptyHints: { alignItems: 'center', gap: 12 },
  emptyHint: { fontSize: 15, color: C.primary, fontWeight: '600' },

  // FAB
  fab: { position: 'absolute', right: 20, bottom: 40, width: 58, height: 58, borderRadius: 29, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 },
});
