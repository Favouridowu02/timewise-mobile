import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Check, ChevronDown, Plus } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Header } from '../../../components/ui/Header';
import { AddTaskModal } from '../../tasks/components/AddTaskModal';
import { useStore, Task } from '../../../store/useStore';

const generateMonthDays = (date: Date) => {
  const days = [];
  const year = date.getFullYear();
  const month = date.getMonth();
  const numDays = new Date(year, month + 1, 0).getDate();
  
  for (let i = 1; i <= numDays; i++) {
    const d = new Date(year, month, i);
    days.push({
      dateObj: d,
      day: d.toLocaleDateString([], { weekday: 'short' }),
      date: d.getDate().toString(),
    });
  }
  return days;
};

const HOURS = Array.from({ length: 24 }).map((_, i) => {
  return `${i.toString().padStart(2, '0')}:00`;
});

export const CalendarScreen = () => {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const tasks = useStore((state) => state.tasks);
  const toggleTaskCompletion = useStore((state) => state.toggleTaskCompletion);

  const daysStrip = useMemo(() => {
    return generateMonthDays(selectedDate);
  }, [selectedDate]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return (
        d.getDate() === selectedDate.getDate() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [tasks, selectedDate]);

  const handleOptimizePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("AI Optimization", "Coming soon! Timewise AI will automatically rearrange your schedule for maximum deep work.");
  };

  const handleTaskPress = (task: Task) => {
    Haptics.selectionAsync();
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const monthYearLabel = selectedDate.toLocaleDateString([], { month: 'long', year: 'numeric' });

  // Auto-scroll the date strip to the selected date
  const dateScrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    const dateIndex = selectedDate.getDate() - 1; // 0-indexed
    // Approx 72px per item (60px width + 12px gap). Center offset approx 160px.
    const scrollPosition = Math.max(0, (dateIndex * 72) - 160);
    setTimeout(() => {
      dateScrollRef.current?.scrollTo({ x: scrollPosition, animated: true });
    }, 100);
  }, [selectedDate]);

  // Scroll to current hour on mount for timeline
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    const currentHour = today.getHours();
    // Scroll to 2 hours before current time so it's centered nicely, max 0
    const scrollPosition = Math.max(0, (currentHour - 2) * 60);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: scrollPosition, animated: false });
    }, 100);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      {/* Header */}
      <Header />

      {/* Month & Year Title Row */}
      <View style={styles.topBarRow}>
        <TouchableOpacity 
          style={styles.monthHeaderRow}
          onPress={() => {
            Haptics.selectionAsync();
            setShowMonthPicker(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.monthHeaderText}>{monthYearLabel}</Text>
          <ChevronDown color="#ffffff" size={20} style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setEditingTask(null);
            setIsModalVisible(true);
          }}
        >
          <Plus color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Native Month Picker - iOS Modal with Spinner or Android Native Modal */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showMonthPicker} transparent animationType="slide" onRequestClose={() => setShowMonthPicker(false)}>
          <View style={styles.pickerModalOverlay}>
            <TouchableOpacity style={styles.pickerModalBackdrop} activeOpacity={1} onPress={() => setShowMonthPicker(false)} />
            <View style={styles.pickerModalContainer}>
              <View style={styles.pickerModalHeader}>
                <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                  <Text style={styles.pickerModalCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                  <Text style={styles.pickerModalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                themeVariant="dark"
                textColor="#ffffff"
                onChange={(event, date) => {
                  if (date) {
                    Haptics.selectionAsync();
                    setSelectedDate(date);
                  }
                }}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showMonthPicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowMonthPicker(false);
              if (date) {
                Haptics.selectionAsync();
                setSelectedDate(date);
              }
            }}
          />
        )
      )}

      {/* Date Selector */}
      <View style={styles.dateSelectorContainer}>
        <ScrollView ref={dateScrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {daysStrip.map((d, index) => {
            const isActive = 
              d.dateObj.getDate() === selectedDate.getDate() &&
              d.dateObj.getMonth() === selectedDate.getMonth();
            const isToday = 
              d.dateObj.getDate() === today.getDate() &&
              d.dateObj.getMonth() === today.getMonth();

            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.dateItem, isActive && styles.dateItemActive, isToday && !isActive && styles.dateItemToday]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedDate(d.dateObj);
                }}
              >
                <Text style={[styles.dateDayText, isActive && styles.dateDayTextActive]}>{d.day}</Text>
                <Text style={[styles.dateNumberText, isActive && styles.dateNumberTextActive]}>{d.date}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Timeline Scroll */}
      <ScrollView ref={scrollRef} contentContainerStyle={styles.timelineScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.timelineContainer}>
          {/* Time Labels & Grid Lines */}
          <View style={styles.gridContainer}>
            {HOURS.map((hour, index) => (
              <View key={index} style={styles.timeRow}>
                <Text style={styles.timeLabel}>{hour}</Text>
                <View style={styles.gridLine} />
              </View>
            ))}
          </View>

          {/* Events Overlay */}
          <View style={styles.eventsOverlay}>
            
            {filteredTasks.length === 0 && (
              <Text style={styles.emptyStateText}>No tasks scheduled for this day.</Text>
            )}

            {filteredTasks.map((task) => {
              const d = new Date(task.date!);
              const hour = d.getHours();
              const minute = d.getMinutes();
              const topOffset = (hour * 60) + minute;
              
              let blockHeight = 60; // default 1 hour
              if (task.endDate) {
                const endD = new Date(task.endDate);
                let durationMinutes = (endD.getTime() - d.getTime()) / 60000;
                
                // If end time is before start time (e.g. user error), default to 60
                if (durationMinutes <= 0) {
                   durationMinutes = 60;
                }
                
                // Cap height to not exceed midnight of the current day
                const maxAllowedHeight = (24 * 60) - topOffset;
                
                blockHeight = Math.max(30, Math.min(durationMinutes, maxAllowedHeight));
              }

              const priorityColor = 
                task.priority === 'High' ? '#ef4444' : 
                task.priority === 'Med' ? '#eab308' : 
                '#ffffff'; // Low / None

              return (
                <TouchableOpacity 
                  key={task.id}
                  style={[
                    styles.eventBlock, 
                    { top: topOffset, height: blockHeight },
                    task.completed && styles.eventBlockCompleted
                  ]}
                  onPress={() => handleTaskPress(task)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.eventHighlightBorder, { backgroundColor: priorityColor }]} />
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeaderRow}>
                      <Text style={[styles.eventTitle, task.completed && styles.eventTitleCompleted]} numberOfLines={1}>
                        {task.title}
                      </Text>
                      {task.completed && <Check color="#3b82f6" size={14} strokeWidth={3} />}
                    </View>
                    <Text style={styles.eventSubtitle}>
                      {task.time}
                      {task.subtasksList?.length > 0 && ` • ${task.subtasksList.filter(s => s.completed).length}/${task.subtasksList.length} subtasks`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Current Time Indicator Line (only show if viewing today) */}
            {selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() && (
              <View style={[styles.currentTimeIndicator, { top: (today.getHours() * 60) + today.getMinutes() }]}>
                <View style={styles.currentTimeDot} />
                <View style={styles.currentTimeLine} />
              </View>
            )}

          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={handleOptimizePress} activeOpacity={0.8}>
          <Text style={styles.fabIcon}>✨</Text>
          <Text style={styles.fabText}>OPTIMIZE DAY</Text>
        </TouchableOpacity>
      </View>

      {/* Reused Add/Edit Task Modal */}
      <AddTaskModal 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        initialTask={editingTask}
        initialDate={selectedDate}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtn: {
    padding: 8,
    backgroundColor: '#1c1b1b',
    borderRadius: 20,
  },
  monthHeaderText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  dateSelectorContainer: {
    backgroundColor: '#111111',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
  },
  dateScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 60,
  },
  dateItemToday: {
    borderWidth: 1,
    borderColor: '#333',
  },
  dateItemActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  dateDayText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateDayTextActive: {
    color: '#000000',
  },
  dateNumberText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  dateNumberTextActive: {
    color: '#000000',
  },
  pickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModalContainer: {
    backgroundColor: '#1c1b1b',
    paddingBottom: 40,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  pickerModalCancel: {
    color: '#a1a1aa',
    fontSize: 16,
  },
  pickerModalDone: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  timelineScroll: {
    paddingBottom: 120, // space for FAB and Nav
  },
  timelineContainer: {
    paddingTop: 16,
    position: 'relative',
    height: 1480, // 24 hours * 60px + padding
  },
  gridContainer: {
    flex: 1,
  },
  timeRow: {
    height: 60, // 1 hour = 60px height
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeLabel: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '500',
    marginTop: -7,
    width: 50,
    textAlign: 'center',
    marginRight: 8,
  },
  gridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1c1c1e',
  },
  eventsOverlay: {
    position: 'absolute',
    top: 16,
    left: 58,
    right: 16,
    bottom: 0,
  },
  emptyStateText: {
    color: '#333333',
    marginTop: 40,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  eventBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#1c1b1b',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  eventBlockCompleted: {
    opacity: 0.6,
  },
  eventHighlightBorder: {
    width: 4,
    height: '100%',
  },
  eventContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  eventTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
  eventSubtitle: {
    color: '#a0a0a0',
    fontSize: 11,
    fontWeight: '500',
  },
  currentTimeIndicator: {
    position: 'absolute',
    left: -6,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10, // above events
  },
  currentTimeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb', // premium blue
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#2563eb',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  fabText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  }
});
