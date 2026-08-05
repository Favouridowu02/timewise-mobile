import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  priority: 'High' | 'Med' | 'Low' | '';
  time: string; // Keeps 'Today', 'Tomorrow', 'Anytime' for legacy categorization
  date: string | null; // Precise date/time string
  endDate?: string | null;
  description: string;
  subtasksList: Subtask[];
  completed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  subtitle: string;
  frequency: string;
  streak: number;
  completedToday: boolean;
  history: boolean[]; // Array of last 7 days completion status
}

export interface UserProfile {
  name: string;
  email: string;
}

interface AppState {
  tasks: Task[];
  habits: Habit[];
  profile: UserProfile;

  // Actions
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (taskId: string, updatedData: Partial<Omit<Task, 'id' | 'completed'>>) => void;
  toggleTaskCompletion: (taskId: string) => void;
  deleteTask: (taskId: string) => void;

  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedToday' | 'history'>) => void;
  toggleHabitCompletion: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;

  updateProfile: (profile: Partial<UserProfile>) => void;
}

// Initial dummy data for the first launch
const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Finalize Q3 OKRs', priority: 'High', time: 'Today', date: new Date().toISOString(), description: 'Discuss the remaining key results with the board.', subtasksList: [{ id: 's1', title: 'Draft email', completed: false }], completed: false },
  { id: '2', title: 'Review Design System Specs', priority: 'Med', time: 'Today', date: new Date(Date.now() + 7200000).toISOString(), description: '', subtasksList: [], completed: false },
  { id: '3', title: 'Prepare Weekly Sync Deck', priority: 'Low', time: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString(), description: '', subtasksList: [], completed: false },
];

const INITIAL_HABITS: Habit[] = [
  { id: '1', title: 'Morning Run (3mi)', subtitle: 'Daily • Morning', frequency: 'Daily', streak: 12, completedToday: false, history: [true, true, true, false, true, true, false] },
  { id: '2', title: 'Read 20 Pages', subtitle: 'Daily • Evening', frequency: 'Daily', streak: 4, completedToday: true, history: [false, false, true, true, true, true, true] },
  { id: '3', title: 'Spanish Practice', subtitle: '3x/week • Any time', frequency: '3x / week', streak: 0, completedToday: false, history: [false, false, false, false, false, false, false] },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      tasks: INITIAL_TASKS,
      habits: INITIAL_HABITS,
      profile: {
        name: 'Jane Doe',
        email: 'jane@example.com',
      },

      addTask: (taskData) => set((state) => ({
        tasks: [...state.tasks, { ...taskData, id: Date.now().toString(), completed: false }]
      })),

      updateTask: (taskId, updatedData) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === taskId ? { ...task, ...updatedData } : task
        )
      })),

      toggleTaskCompletion: (taskId) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      })),

      deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== taskId)
      })),

      addHabit: (habitData) => set((state) => ({
        habits: [...state.habits, { ...habitData, id: Date.now().toString(), streak: 0, completedToday: false, history: Array(7).fill(false) }]
      })),

      toggleHabitCompletion: (habitId) => set((state) => ({
        habits: state.habits.map(habit => {
          if (habit.id === habitId) {
            const completedToday = !habit.completedToday;
            // A real app would calculate streaks based on dates, but for now we'll just simulate it
            const streak = completedToday ? habit.streak + 1 : Math.max(0, habit.streak - 1);
            const history = [...habit.history];
            history[history.length - 1] = completedToday; // update the last day (today)

            return { ...habit, completedToday, streak, history };
          }
          return habit;
        })
      })),

      deleteHabit: (habitId) => set((state) => ({
        habits: state.habits.filter(habit => habit.id !== habitId)
      })),

      updateProfile: (profileData) => set((state) => ({
        profile: { ...state.profile, ...profileData }
      })),
    }),
    {
      name: 'timewise-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
