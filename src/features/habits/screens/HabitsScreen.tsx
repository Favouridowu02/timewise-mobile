import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Plus, Target, Check, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { Header } from '../../../components/ui/Header';
import { AddHabitModal } from '../components/AddHabitModal';
import { useStore, Habit } from '../../../store/useStore';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const HabitCardItem = ({ habit, toggleHabitCompletion, deleteHabit }: { habit: Habit, toggleHabitCompletion: (id: string) => void, deleteHabit: (id: string) => void }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Dopamine hit animation
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true })
    ]).start();

    toggleHabitCompletion(habit.id);
  };

  const handleLongPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habit.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteHabit(habit.id) }
      ]
    );
  };

  return (
    <TouchableOpacity 
      activeOpacity={1}
      onLongPress={handleLongPress}
      delayLongPress={400}
    >
      <Animated.View style={[styles.habitCard, { transform: [{ scale }] }]}>
        <View style={styles.habitHeaderRow}>
          <View style={styles.habitInfo}>
            <Text style={styles.habitTitle}>{habit.title}</Text>
            <Text style={styles.habitSubtitle}>{habit.subtitle}</Text>
          </View>
          
          <View style={styles.streakBadge}>
            <Flame color="#f59e0b" size={14} style={{ marginRight: 6 }} />
            <Text style={styles.streakText}>{habit.streak} Day Streak</Text>
          </View>
        </View>

        {/* 7 Day Grid */}
        <View style={styles.gridContainer}>
          {DAYS.map((day, index) => {
            const isCompleted = habit.history[index];
            return (
              <View key={index} style={styles.gridDay}>
                <Text style={styles.gridDayText}>{day}</Text>
                <View style={[styles.gridBox, isCompleted && styles.gridBoxCompleted]}>
                  {isCompleted && <Check color="#000000" size={16} strokeWidth={3} />}
                </View>
              </View>
            );
          })}
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={[styles.actionButton, habit.completedToday && styles.actionButtonCompleted]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={[styles.actionButtonIcon, habit.completedToday && styles.actionButtonIconCompleted]} />
          <Text style={[styles.actionButtonText, habit.completedToday && styles.actionButtonTextCompleted]}>
            {habit.completedToday ? 'Completed' : 'Complete Today'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const HabitsScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const habits = useStore((state) => state.habits);
  const toggleHabitCompletion = useStore((state) => state.toggleHabitCompletion);
  const deleteHabit = useStore((state) => state.deleteHabit);
  
  const completedHabitsCount = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const progressPercentage = totalHabits === 0 ? 0 : Math.round((completedHabitsCount / totalHabits) * 100);
  
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progressPercentage,
      duration: 1000,
      useNativeDriver: false 
    }).start();
  }, [progressPercentage]);

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0]
  });
  
  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      {/* Header */}
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {habits.length > 0 ? (
          <>
            {/* Progress Summary Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressTitle}>Daily Progress</Text>
                <Text style={styles.progressSubtitle}>
                  You've completed {completedHabitsCount} out of {totalHabits} habits{'\n'}today. Keep the momentum.
                </Text>
              </View>
              
              <View style={styles.progressChartContainer}>
                <View style={styles.progressCircleWrapper}>
                  <Svg width="80" height="80" viewBox="0 0 80 80">
                    <Circle cx="40" cy="40" r={radius} stroke="#2a2a2a" strokeWidth="6" fill="none" />
                    <AnimatedCircle 
                      cx="40" 
                      cy="40" 
                      r={radius} 
                      stroke="#4ade80" 
                      strokeWidth="6" 
                      fill="none" 
                      strokeDasharray={circumference} 
                      strokeDashoffset={strokeDashoffset} 
                      strokeLinecap="round" 
                      transform="rotate(-90 40 40)" 
                    />
                  </Svg>
                  <View style={styles.progressPercentageContainer}>
                    <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
                  </View>
                </View>
                <Text style={styles.progressLabel}>COMPLETED</Text>
              </View>
            </View>

            {/* Habits List */}
            <View style={styles.habitsList}>
              {habits.map((habit) => (
                <HabitCardItem 
                  key={habit.id} 
                  habit={habit} 
                  toggleHabitCompletion={toggleHabitCompletion} 
                  deleteHabit={deleteHabit} 
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Target color="#2a2a2a" size={64} style={styles.emptyStateIcon} />
            <Text style={styles.emptyStateTitle}>No habits yet</Text>
            <Text style={styles.emptyStateSub}>Tap + to build a better you.</Text>
          </View>
        )}

      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={handleAddPress} activeOpacity={0.8}>
          <Plus color="#000000" size={24} style={styles.fabIcon} />
          <Text style={styles.fabText}>ADD HABIT</Text>
        </TouchableOpacity>
      </View>

      {/* Add Habit Modal */}
      <AddHabitModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
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
    paddingBottom: 100, // padding for bottom nav
  },
  progressSection: {
    backgroundColor: '#141313',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  progressTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressSubtitle: {
    color: '#c4c7c8',
    fontSize: 14,
    lineHeight: 20,
  },
  progressChartContainer: {
    alignItems: 'center',
  },
  progressCircleWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressPercentageContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  progressLabel: {
    color: '#c4c7c8',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  habitsList: {
    gap: 16,
  },
  habitCard: {
    backgroundColor: '#0e0e0e',
    borderRadius: 20,
    padding: 20,
  },
  habitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitSubtitle: {
    color: '#c4c7c8',
    fontSize: 12,
    fontWeight: '500',
  },
  streakBadge: {
    backgroundColor: '#2a2a2a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  streakIconPlaceholder: {
    width: 12,
    height: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    marginRight: 6,
  },
  streakText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#141313',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  gridDay: {
    alignItems: 'center',
  },
  gridDayText: {
    color: '#c4c7c8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  gridBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  gridBoxCompleted: {
    backgroundColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonCompleted: {
    backgroundColor: '#122617', // Very subtle rich dark green
    borderWidth: 1,
    borderColor: '#1a3a2a',
  },
  actionButtonIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#2f3131',
    borderRadius: 4,
    marginRight: 8,
  },
  actionButtonIconCompleted: {
    backgroundColor: '#4ade80',
  },
  actionButtonText: {
    color: '#2f3131',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextCompleted: {
    color: '#4ade80',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {
    marginRight: 8,
  },
  fabText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyStateIcon: {
    marginBottom: 20,
  },
  emptyStateTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateSub: {
    color: '#8E9192',
    fontSize: 15,
  }
});
