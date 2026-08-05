import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Moon, Bell, Shield, Briefcase, ChevronRight, LogOut, User, CheckCircle2, Target, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Header } from '../../../components/ui/Header';
import { EditProfileModal } from '../components/EditProfileModal';
import { signOut, deleteUser } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { useStore } from '../../../store/useStore';

export const ProfileScreen = () => {
  const profile = useStore(state => state.profile);
  const tasks = useStore(state => state.tasks);
  const habits = useStore(state => state.habits);
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Quick Stats Calculation
  const tasksCompleted = tasks.filter(t => t.completed).length;
  const activeHabits = habits.length;

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive", 
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            try {
              await signOut(auth);
            } catch (error: any) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure? This action cannot be undone and will permanently delete your account and all data.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Forever", 
          style: "destructive", 
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            try {
              if (auth.currentUser) {
                await deleteUser(auth.currentUser);
              }
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete account. You may need to sign in again first.');
            }
          }
        }
      ]
    );
  };

  const handleSettingPress = (settingName: string) => {
    Haptics.selectionAsync();
    Alert.alert("Coming Soon", `The ${settingName} settings will be available in the next update!`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      {/* Header */}
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <TouchableOpacity 
          style={styles.profileCard} 
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsEditModalVisible(true);
          }}
        >
          <View style={styles.avatarContainer}>
            <User color="#ffffff" size={32} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{auth.currentUser?.email || 'No email linked'}</Text>
          </View>
          <ChevronRight color="#8E9192" size={20} />
        </TouchableOpacity>

        {/* Quick Stats Row */}
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(37, 99, 235, 0.2)' }]}>
              <CheckCircle2 color="#3b82f6" size={24} />
            </View>
            <Text style={styles.statValue}>{tasksCompleted}</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}>
              <Target color="#eab308" size={24} />
            </View>
            <Text style={styles.statValue}>{activeHabits}</Text>
            <Text style={styles.statLabel}>Active Habits</Text>
          </View>
        </View>

        {/* Settings List */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingsList}>
          {[
            { name: 'Appearance', icon: Moon },
            { name: 'Notifications', icon: Bell },
            { name: 'Security', icon: Shield },
            { name: 'Workspace', icon: Briefcase }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.settingItem}
                onPress={() => handleSettingPress(item.name)}
              >
                <View style={styles.settingItemLeft}>
                  <Icon color="#c4c7c8" size={24} style={{ marginRight: 12 }} />
                  <Text style={styles.settingText}>{item.name}</Text>
                </View>
                <ChevronRight color="#c4c7c8" size={20} opacity={0.5} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut color="#c4c7c8" size={20} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerZone} onPress={handleDeleteAccount}>
          <Trash2 color="#ffb4ab" size={20} />
          <Text style={styles.dangerText}>Delete Account</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        visible={isEditModalVisible} 
        onClose={() => setIsEditModalVisible(false)} 
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100, // padding for bottom nav
  },
  profileCard: {
    backgroundColor: '#1c1b1b',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb', // Premium blue accent
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#8E9192',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1c1b1b',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#8E9192',
    fontSize: 13,
    fontWeight: '500',
  },
  settingsList: {
    backgroundColor: '#1c1b1b',
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  signOutBtn: {
    backgroundColor: '#1c1b1b',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  signOutText: {
    color: '#c4c7c8',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  dangerZone: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dangerText: {
    color: '#ffb4ab',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  }
});
