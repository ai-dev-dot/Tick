import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
  TouchableOpacity, SafeAreaView, useColorScheme,
} from 'react-native';

// ----- Design tokens from docs/VISUAL.md -----
const C = {
  primary: '#FF6B35',
  completed: '#8E8E93',
  delete: '#FF3B30',
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  separator: '#E5E5EA',
  tabInactive: '#8E8E93',
  chipBg: '#F2F2F7',
};

// ----- Types -----
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

// ----- Mock Data -----
const TODAY = '2026年5月5日 星期一';

const MOCK_TASKS: Task[] = [
  { id: '1', content: '喂小乌龟', category: '生活', deadlineType: '日常', dailyOption: '每天', completed: false, reminderTime: '22:00' },
  { id: '2', content: '晨跑 30 分钟', category: '健康', deadlineType: '日常', dailyOption: '每工作日', completed: true, reminderTime: '07:00' },
  { id: '3', content: '帮娃完成游戏日常', category: '生活', deadlineType: '日常', dailyOption: '每天', completed: true, reminderTime: null },
  { id: '4', content: '超市买菜', category: '生活', deadlineType: '近期', dailyOption: null, completed: false, reminderTime: null },
  { id: '5', content: '准备周五项目汇报', category: '工作', deadlineType: '近期', dailyOption: null, completed: false, reminderTime: '09:00' },
  { id: '6', content: '学习 React Native', category: '工作', deadlineType: '长期', dailyOption: null, completed: false, reminderTime: null },
  { id: '7', content: '整理书架', category: '生活', deadlineType: '长期', dailyOption: null, completed: true, reminderTime: null },
];

const CATEGORY_ICON: Record<Category, string> = { '生活': '🏠', '工作': '💼', '健康': '💚' };

// ----- Helpers -----
function getDateHeader(): string {
  return TODAY;
}

function isWeekday(dateStr: string): boolean {
  const day = dateStr.slice(-3, -1);
  return !['六', '日'].includes(day);
}

// ----- Main Component -----
export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [activeTab, setActiveTab] = useState<FilterTab>('全部');
  const [longTermExpanded, setLongTermExpanded] = useState(false);

  // Only weekday tasks shown on weekdays
  const displayTasks = tasks.filter(t => {
    if (t.deadlineType === '日常' && t.dailyOption === '每工作日' && !isWeekday(TODAY)) {
      return false;
    }
    if (activeTab === '全部') return true;
    if (activeTab === '日常') return t.deadlineType === '日常';
    if (activeTab === '近期') return t.deadlineType === '近期';
    return true;
  });

  const dailyTasks = displayTasks.filter(t => t.deadlineType === '日常');
  const recentTasks = displayTasks.filter(t => t.deadlineType === '近期');
  const longTermTasks = displayTasks.filter(t => t.deadlineType === '长期');

  const totalDaily = dailyTasks.length + recentTasks.length;
  const completedDaily = dailyTasks.filter(t => t.completed).length + recentTasks.filter(t => t.completed).length;

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const handleLongPress = useCallback((task: Task) => {
    Alert.alert(
      task.content,
      '快速编辑',
      [
        { text: '编辑分类', onPress: () => {
          Alert.alert('编辑分类', '选择分类', [
            { text: '生活', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, category: '生活' } : t)) },
            { text: '工作', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, category: '工作' } : t)) },
            { text: '健康', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, category: '健康' } : t)) },
            { text: '取消', style: 'cancel' },
          ]);
        }},
        { text: '编辑期限', onPress: () => {
          Alert.alert('编辑期限', '选择期限类型', [
            { text: '日常-每天', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '日常', dailyOption: '每天' } : t)) },
            { text: '日常-每工作日', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '日常', dailyOption: '每工作日' } : t)) },
            { text: '近期', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '近期', dailyOption: null } : t)) },
            { text: '长期', onPress: () => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, deadlineType: '长期', dailyOption: null } : t)) },
            { text: '取消', style: 'cancel' },
          ]);
        }},
        { text: '取消', style: 'cancel' },
      ]
    );
  }, []);

  const handleDelete = useCallback((task: Task) => {
    Alert.alert(
      '删除任务',
      `确定要删除「${task.content}」吗？任务记录将保留在统计中。`,
      [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive', onPress: () => {
          setTasks(prev => prev.filter(t => t.id !== task.id));
        }},
      ]
    );
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>📅 {getDateHeader()}</Text>
          <Text style={styles.completionText}>今日完成 {completedDaily}/{totalDaily}</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabBar}>
          {(['全部', '日常', '近期'] as FilterTab[]).map(tab => (
            <Pressable key={tab} style={styles.tabItem} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabActive]}>{tab}</Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </Pressable>
          ))}
          <Text style={styles.statsIcon}>📊</Text>
        </View>

        {/* Task List */}
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {/* Daily Tasks Group */}
          {dailyTasks.length > 0 && (
            <View style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupHeaderText}>📌 日常任务</Text>
              </View>
              {sortByStatus(dailyTasks).map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onLongPress={handleLongPress}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          )}

          {/* Recent Tasks Group */}
          {recentTasks.length > 0 && (
            <View style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupHeaderText}>📋 近期任务</Text>
              </View>
              {sortByStatus(recentTasks).map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onLongPress={handleLongPress}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          )}

          {/* Long-term Tasks Group */}
          {longTermTasks.length > 0 && activeTab === '全部' && (
            <View style={styles.group}>
              <Pressable style={styles.groupHeader} onPress={() => setLongTermExpanded(!longTermExpanded)}>
                <Text style={styles.groupHeaderText}>
                  📦 长期规划 ({longTermTasks.filter(t => t.completed).length}个已完成)
                </Text>
                <Text style={styles.expandIcon}>{longTermExpanded ? '▼' : '▶'}</Text>
              </Pressable>
              {longTermExpanded && sortByStatus(longTermTasks).map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onLongPress={handleLongPress}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          )}

          {/* Empty State */}
          {displayTasks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyTitle}>今天还没有任务</Text>
              <Text style={styles.emptySubtitle}>点击下方 + 按钮创建第一个任务</Text>
              <View style={styles.emptyExamples}>
                <Text style={styles.emptyExampleHint}>试试输入：</Text>
                <Text style={styles.emptyExample}>"每天早上8点跑步"</Text>
                <Text style={styles.emptyExample}>"周末前完成报告"</Text>
                <Text style={styles.emptyExample}>"学习一门新技能"</Text>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => Alert.alert('添加任务', '输入任务内容（原型演示）')}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ----- Task Item Component -----
function TaskItem({ task, onToggle, onLongPress, onDelete }: {
  task: Task;
  onToggle: (id: string) => void;
  onLongPress: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const completed = task.completed;

  return (
    <Pressable
      style={styles.taskRow}
      onPress={() => onToggle(task.id)}
      onLongPress={() => onLongPress(task)}
      delayLongPress={500}
    >
      {/* Status Circle */}
      <View style={[styles.circle, completed && styles.circleCompleted]}>
        {completed && <Text style={styles.checkmark}>✓</Text>}
      </View>

      {/* Content */}
      <View style={styles.taskContent}>
        <Text style={[styles.taskText, completed && styles.taskTextCompleted]} numberOfLines={2}>
          {task.content}
        </Text>
        <View style={styles.taskMeta}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{CATEGORY_ICON[task.category]} {task.category}</Text>
          </View>
          {task.reminderTime && (
            <Text style={styles.reminderText}>⏰ {task.reminderTime}</Text>
          )}
          {task.deadlineType === '日常' && task.dailyOption && (
            <Text style={styles.repeatBadge}>{task.dailyOption === '每工作日' ? '工作日' : '每天'}</Text>
          )}
        </View>
      </View>

      {/* Delete Button (shown on long press hint) */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(task)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.deleteBtnText}>🗑</Text>
      </TouchableOpacity>
    </Pressable>
  );
}

// ----- Helpers -----
function sortByStatus(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });
}

// ----- Styles -----
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.surface,
  },
  container: {
    flex: 1,
    backgroundColor: C.surface,
  },
  // Date Header
  dateHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: C.textPrimary,
  },
  completionText: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 4,
  },
  // Tabs
  tabBar: {
    flexDirection: 'row',
    height: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: C.tabInactive,
  },
  tabActive: {
    color: C.primary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: 24,
    backgroundColor: C.primary,
    borderRadius: 1,
  },
  statsIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 4,
  },
  // Group
  group: {
    marginBottom: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: 16,
    backgroundColor: C.surfaceSecondary,
  },
  groupHeaderText: {
    fontSize: 12,
    fontWeight: '400',
    color: C.textSecondary,
  },
  expandIcon: {
    fontSize: 10,
    color: C.textSecondary,
  },
  // Task Row
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
    backgroundColor: C.surface,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  circleCompleted: {
    borderColor: C.completed,
    backgroundColor: C.completed,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 17,
    fontWeight: '400',
    color: C.textPrimary,
    lineHeight: 22,
  },
  taskTextCompleted: {
    color: C.completed,
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  categoryChip: {
    backgroundColor: C.chipBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.textSecondary,
  },
  reminderText: {
    fontSize: 12,
    color: C.textTertiary,
  },
  repeatBadge: {
    fontSize: 11,
    color: C.primary,
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: 'hidden',
  },
  deleteBtn: {
    paddingLeft: 12,
  },
  deleteBtnText: {
    fontSize: 16,
  },
  // Empty State
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: C.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: C.textSecondary,
    marginBottom: 24,
  },
  emptyExamples: {
    alignItems: 'center',
    gap: 8,
  },
  emptyExampleHint: {
    fontSize: 13,
    color: C.textTertiary,
    marginBottom: 4,
  },
  emptyExample: {
    fontSize: 15,
    color: C.primary,
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
  },
});
