import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Calendar as CalendarIcon, CheckSquare, Timer, User } from 'lucide-react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TasksScreen } from '../features/tasks/screens/TasksScreen';
import { CalendarScreen } from '../features/calendar/screens/CalendarScreen';
import { HabitsScreen } from '../features/habits/screens/HabitsScreen';
import { StatisticsScreen } from '../features/statistics/screens/StatisticsScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';

export type MainTabParamList = {
  Tasks: undefined;
  Calendar: undefined;
  Habits: undefined; // Assuming Check/Habits is the middle one
  Statistics: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.bottomNavBar}>
      <View style={styles.navBarShadow} />
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Icon logic mapping based on route name
        let IconComponent = Home;
        if (route.name === 'Tasks') IconComponent = Home;
        if (route.name === 'Calendar') IconComponent = CalendarIcon;
        if (route.name === 'Habits') IconComponent = CheckSquare;
        if (route.name === 'Statistics') IconComponent = Timer;
        if (route.name === 'Profile') IconComponent = User;

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.navItem}
          >
            <IconComponent 
              color={isFocused ? '#ffffff' : '#c4c7c8'} 
              size={24} 
              strokeWidth={isFocused ? 2.5 : 2}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#000000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#1c1c1e',
  },
  navBarShadow: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#ffffff',
    opacity: 0.05,
  },
  navItem: {
    padding: 10,
  }
});
