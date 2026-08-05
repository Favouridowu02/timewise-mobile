import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle } from 'react-native-svg';
import { useStore } from '../../../store/useStore';
import { Header } from '../../../components/ui/Header';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AnimatedBar = ({ value, label }: { value: number, label: string }) => {
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: value,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [value]);

  return (
    <View style={styles.barColumn}>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, { height: heightAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
      </View>
      <Text style={styles.axisLabel}>{label}</Text>
    </View>
  );
};

export const StatisticsScreen = () => {
  const [activeTab, setActiveTab] = useState<'Week' | 'Month'>('Week');
  
  const tasks = useStore(state => state.tasks);
  const habits = useStore(state => state.habits);

  const completedTasks = tasks.filter(t => t.completed);
  const taskRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Calculate Focus Hours
  let focusMinutes = 0;
  completedTasks.forEach(task => {
    if (task.date && task.endDate) {
      const start = new Date(task.date);
      const end = new Date(task.endDate);
      const diff = (end.getTime() - start.getTime()) / 60000;
      if (diff > 0) focusMinutes += diff;
    } else {
      focusMinutes += 60; // default 1 hour
    }
  });
  const focusHours = (focusMinutes / 60).toFixed(1);

  // Priority Distribution
  const highPriority = completedTasks.filter(t => t.priority === 'High').length;
  const medPriority = completedTasks.filter(t => t.priority === 'Med').length;
  const lowPriority = completedTasks.filter(t => t.priority === 'Low').length;
  const totalPrioritized = highPriority + medPriority + lowPriority;

  const getPct = (val: number) => totalPrioritized > 0 ? (val / totalPrioritized) * 100 : 0;
  
  // Task Rate Animation
  const taskRateAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(taskRateAnim, {
      toValue: taskRate,
      duration: 1000,
      useNativeDriver: false 
    }).start();
  }, [taskRate]);

  const trRadius = 26;
  const trCircumference = 2 * Math.PI * trRadius;
  const trStrokeDashoffset = taskRateAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [trCircumference, 0]
  });

  const completedHabits = habits.filter(h => h.completedToday).length;
  const habitsFraction = `${completedHabits}/${habits.length}`;
  const filledGrids = completedHabits;
  const emptyGrids = Math.max(0, 8 - filledGrids);

  // Chart Data Calculations
  const now = new Date();
  
  // -- Weekly Data --
  // Get Monday of current week
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);

  const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];
  
  completedTasks.forEach(task => {
    if (!task.date) return;
    const taskDate = new Date(task.date);
    // If task is within this week (Monday to Sunday)
    if (taskDate >= monday && taskDate.getTime() < monday.getTime() + 7 * 86400000) {
      // 0 for Monday, 6 for Sunday
      const taskDay = taskDate.getDay();
      const index = taskDay === 0 ? 6 : taskDay - 1;
      weeklyCounts[index]++;
    }
  });

  const maxWeekly = Math.max(...weeklyCounts, 1); // prevent div by zero
  const weeklyChartData = weeklyCounts.map(count => (count / maxWeekly) * 100);
  const weeklyLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // -- Monthly Data --
  // 4 rolling weeks (W4 = last 7 days)
  const monthlyCounts = [0, 0, 0, 0];
  const startOfToday = new Date(now);
  startOfToday.setHours(23, 59, 59, 999);
  
  completedTasks.forEach(task => {
    if (!task.date) return;
    const taskDate = new Date(task.date);
    const diffTime = startOfToday.getTime() - taskDate.getTime();
    const diffDays = Math.floor(diffTime / 86400000);
    
    if (diffDays >= 0 && diffDays < 28) {
      if (diffDays < 7) monthlyCounts[3]++; // W4
      else if (diffDays < 14) monthlyCounts[2]++; // W3
      else if (diffDays < 21) monthlyCounts[1]++; // W2
      else monthlyCounts[0]++; // W1
    }
  });

  const maxMonthly = Math.max(...monthlyCounts, 1);
  const monthlyChartData = monthlyCounts.map(count => (count / maxMonthly) * 100);
  const monthlyLabels = ['W1', 'W2', 'W3', 'W4'];

  const currentChartData = activeTab === 'Week' ? weeklyChartData : monthlyChartData;
  const currentChartLabels = activeTab === 'Week' ? weeklyLabels : monthlyLabels;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      {/* Header */}
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title & Toggle */}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Statistics</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, activeTab === 'Week' && styles.toggleButtonActive]}
              onPress={() => setActiveTab('Week')}
            >
              <Text style={[styles.toggleText, activeTab === 'Week' && styles.toggleTextActive]}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, activeTab === 'Month' && styles.toggleButtonActive]}
              onPress={() => setActiveTab('Month')}
            >
              <Text style={[styles.toggleText, activeTab === 'Month' && styles.toggleTextActive]}>Month</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Focus Hours Card */}
        <View style={styles.card}>
          <View style={styles.focusHoursHeader}>
            <Text style={styles.cardTitle}>Focus Hours</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>↑ 12%</Text>
            </View>
          </View>
          
          <Text style={styles.largeValue}>
            {focusHours}<Text style={styles.largeValueUnit}>h</Text>
          </Text>

          <View style={styles.divider} />
          
          <View style={styles.chartArea}>
            {currentChartData.map((val, i) => (
              <AnimatedBar key={`${activeTab}-${i}`} value={val} label={currentChartLabels[i]} />
            ))}
          </View>
        </View>

        {/* Two Column Grid */}
        <View style={styles.twoColumnGrid}>
          {/* Task Rate */}
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardTitle}>Task Rate</Text>
            <Text style={styles.mediumValue}>{taskRate}%</Text>
            
            <View style={styles.circularProgressContainer}>
              <View style={styles.circularProgressInner}>
                <Svg width="60" height="60" viewBox="0 0 60 60">
                  <Circle cx="30" cy="30" r={trRadius} stroke="#2a2a2a" strokeWidth="6" fill="none" />
                  <AnimatedCircle 
                    cx="30" 
                    cy="30" 
                    r={trRadius} 
                    stroke="#4ade80" 
                    strokeWidth="6" 
                    fill="none" 
                    strokeDasharray={trCircumference} 
                    strokeDashoffset={trStrokeDashoffset} 
                    strokeLinecap="round" 
                    transform="rotate(-90 30 30)" 
                  />
                </Svg>
              </View>
            </View>
          </View>

          {/* Habits */}
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardTitle}>Habits</Text>
            <Text style={styles.mediumValue}>{habitsFraction}</Text>
            
            <View style={styles.habitsGrid}>
              {[...Array(filledGrids)].map((_, i) => (
                <View key={`filled-${i}`} style={styles.habitBoxFilled} />
              ))}
              {[...Array(emptyGrids)].map((_, i) => (
                <View key={`empty-${i}`} style={styles.habitBoxEmpty} />
              ))}
            </View>
          </View>
        </View>

        {/* Priority Distribution */}
        <View style={styles.card}>
          <Text style={styles.cardTitleLarge}>Priority Distribution</Text>
          
          {/* High */}
          <View style={styles.projectItem}>
            <View style={styles.projectHeader}>
              <View style={styles.projectLabelContainer}>
                <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.projectLabel}>High Priority</Text>
              </View>
              <Text style={styles.projectValue}>{highPriority} tasks</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <Animated.View style={[styles.progressBarFill, { width: `${getPct(highPriority)}%`, backgroundColor: '#ef4444' }]} />
            </View>
          </View>

          {/* Medium */}
          <View style={styles.projectItem}>
            <View style={styles.projectHeader}>
              <View style={styles.projectLabelContainer}>
                <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.projectLabel}>Medium Priority</Text>
              </View>
              <Text style={styles.projectValue}>{medPriority} tasks</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <Animated.View style={[styles.progressBarFill, { width: `${getPct(medPriority)}%`, backgroundColor: '#f59e0b' }]} />
            </View>
          </View>
          
          {/* Low */}
          <View style={styles.projectItem}>
            <View style={styles.projectHeader}>
              <View style={styles.projectLabelContainer}>
                <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
                <Text style={styles.projectLabel}>Low Priority</Text>
              </View>
              <Text style={styles.projectValue}>{lowPriority} tasks</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <Animated.View style={[styles.progressBarFill, { width: `${getPct(lowPriority)}%`, backgroundColor: '#3b82f6' }]} />
            </View>
          </View>

        </View>

      </ScrollView>

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
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // padding for bottom nav
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  screenTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: '#222',
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: '#ffffff',
  },
  toggleText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  halfCard: {
    flex: 1,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  focusHoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#c4c7c8',
    fontSize: 14,
    fontWeight: '400',
  },
  cardTitleLarge: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  badgeContainer: {
    backgroundColor: '#222222',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  largeValue: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 16,
  },
  largeValueUnit: {
    fontSize: 20,
    color: '#c4c7c8',
    fontWeight: '500',
  },
  mediumValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginVertical: 16,
  },
  chartArea: {
    height: 140,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    width: 24,
    height: '100%',
  },
  barBackground: {
    flex: 1,
    width: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  barFill: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  axisLabel: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
    height: 16,
  },
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  circularProgressInner: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  habitBoxFilled: {
    width: 30,
    height: 30,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  habitBoxEmpty: {
    width: 30,
    height: 30,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
  },
  projectItem: {
    marginBottom: 20,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  projectLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  projectLabel: {
    color: '#c4c7c8',
    fontSize: 14,
  },
  projectValue: {
    color: '#c4c7c8',
    fontSize: 12,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  }
});
