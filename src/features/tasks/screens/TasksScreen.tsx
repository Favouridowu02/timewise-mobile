import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Plus, Clock, ListTodo, Check } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { AddTaskModal } from '../components/AddTaskModal';

import { useStore, Task } from '../../../store/useStore';

export const TasksScreen = () => {
  const [activeTab, setActiveTab] = useState('Today');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const tasks = useStore((state) => state.tasks);
  const toggleTaskCompletion = useStore((state) => state.toggleTaskCompletion);
  const deleteTask = useStore((state) => state.deleteTask);

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'All') return true;
    
    if (activeTab === 'Inbox') {
      return !task.date;
    }
    
    if (!task.date) return false;

    const taskDate = new Date(task.date);
    const today = new Date();
    
    // Normalize both dates to midnight for accurate day comparison
    const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const diffTime = taskDay.getTime() - currentDay.getTime();
    
    if (activeTab === 'Today') {
      return diffTime === 0;
    } else if (activeTab === 'Past') {
      return diffTime < 0;
    } else if (activeTab === 'Upcoming') {
      return diffTime > 0;
    }
    return false;
  });

  const handleLongPress = (id: string, title: string) => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteTask(id) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      {/* Header */}
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title & Tabs */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Tasks</Text>
          
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
              {['All', 'Today', 'Past', 'Upcoming', 'Inbox'].map((tab) => (
                <TouchableOpacity 
                  key={tab} 
                  style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActiveTab(tab);
                  }}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Task List */}
        <View style={styles.taskList}>
          {filteredTasks.length === 0 && (
            <Text style={{ color: '#8E9192', textAlign: 'center', marginTop: 40 }}>No tasks here.</Text>
          )}
          {filteredTasks.map((task) => (
            <TouchableOpacity 
              key={task.id} 
              style={[styles.taskItem, task.completed && styles.taskItemCompleted]}
              onPress={() => {
                Haptics.selectionAsync();
                setEditingTask(task);
                setIsModalVisible(true);
              }}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleLongPress(task.id, task.title);
              }}
              delayLongPress={500}
              activeOpacity={0.8}
            >
              
              {/* Checkbox */}
              <TouchableOpacity 
                style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleTaskCompletion(task.id);
                }}
              >
                {task.completed && <Check color="#ffffff" size={14} strokeWidth={3} />}
              </TouchableOpacity>
              
              {/* Task Content */}
              <View style={styles.taskContent}>
                <View style={styles.taskHeaderRow}>
                  <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                    {task.title}
                  </Text>
                  
                  {task.priority !== '' && (
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityText}>{task.priority}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.taskMetaRow}>
                  {task.date && (
                    <View style={styles.metaItem}>
                      <Clock color="#c4c7c8" size={14} style={{ marginRight: 6 }} />
                      <Text style={styles.metaText}>{task.time}</Text>
                    </View>
                  )}

                  {task.subtasksList && task.subtasksList.length > 0 && (
                    <View style={styles.metaItem}>
                      <ListTodo color="#c4c7c8" size={14} style={{ marginRight: 6 }} />
                      <Text style={styles.metaText}>
                        {task.subtasksList.filter(s => s.completed).length}/{task.subtasksList.length} Subtasks
                      </Text>
                    </View>
                  )}
                </View>
              </View>

            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setEditingTask(null);
          setIsModalVisible(true);
        }}
      >
        <Plus color="#141313" size={24} strokeWidth={2.5} />
      </TouchableOpacity>

      <AddTaskModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        initialTask={editingTask}
      />

      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // padding for bottom nav & FAB
  },
  titleSection: {
    marginTop: 10,
    marginBottom: 24,
  },
  pageTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tabButton: {
    backgroundColor: '#1c1b1b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    color: '#c4c7c8',
    fontSize: 12,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#141313',
  },
  taskList: {
    gap: 12,
  },
  taskItem: {
    backgroundColor: '#1c1b1b',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskItemCompleted: {
    backgroundColor: '#0e0e0e',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#2563eb', // blue color from design
    borderColor: '#2563eb',
  },
  taskContent: {
    flex: 1,
  },
  taskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#c4c7c8',
  },
  priorityBadge: {
    backgroundColor: '#141313',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  priorityText: {
    color: '#c4c7c8',
    fontSize: 11,
    fontWeight: '600',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    color: '#c4c7c8',
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 100, // Above bottom nav bar
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  }
});
