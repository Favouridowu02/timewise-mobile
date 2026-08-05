import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Header } from '../../../components/ui/Header';

export const AssistantScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      {/* Header */}
      <Header />

      {/* Date Pill */}
      <View style={styles.dateContainer}>
        <View style={styles.datePill}>
          <Text style={styles.dateText}>TODAY, 9:41 AM</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Bot Message 1 */}
        <View style={styles.messageRowLeft}>
          <View style={styles.avatarDark}>
            <Text style={styles.robotIcon}>🤖</Text>
          </View>
          <View style={styles.botBubble}>
            <Text style={styles.botText}>
              Good morning. I've reviewed your schedule for today and noticed a few dense blocks.
            </Text>
          </View>
        </View>

        {/* Bot Message 2 (Actionable with white left border) */}
        <View style={[styles.messageRowLeft, { marginTop: -12 }]}>
          <View style={styles.avatarSpacer} />
          <View style={[styles.botBubble, styles.botBubbleActionable]}>
            <View style={styles.actionableIndicator} />
            <Text style={styles.botText}>
              I noticed a conflict in your afternoon. The 'Product Review' at 2:00 PM overlaps with 'Design Sync'. Should I reschedule the sync to 3:30 PM?
            </Text>
          </View>
        </View>

        {/* Action Buttons for Bot Message 2 */}
        <View style={styles.actionButtonsRow}>
          <View style={styles.avatarSpacer} />
          <TouchableOpacity style={styles.actionButtonPrimary}>
            <Text style={styles.actionButtonPrimaryText}>Yes, reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonSecondary}>
            <Text style={styles.actionButtonSecondaryText}>Keep as is</Text>
          </TouchableOpacity>
        </View>

        {/* User Message */}
        <View style={styles.messageRowRight}>
          <View style={styles.userBubble}>
            <Text style={styles.userText}>
              Actually, let's push the Design Sync to tomorrow morning at 10 AM if that slot is open.
            </Text>
          </View>
          <View style={styles.avatarLight}>
            <Text style={styles.userIcon}>👤</Text>
          </View>
        </View>

        {/* Bot Typing Indicator */}
        <View style={styles.messageRowLeft}>
          <View style={styles.avatarDark}>
            <Text style={styles.robotIcon}>🤖</Text>
          </View>
          <View style={styles.typingBubble}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
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
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  datePill: {
    backgroundColor: '#222222',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  dateText: {
    color: '#a0a0a0',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  messageRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  messageRowRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 20,
  },
  avatarDark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  avatarSpacer: {
    width: 32,
    marginRight: 12,
  },
  robotIcon: {
    fontSize: 16,
  },
  userIcon: {
    fontSize: 16,
  },
  botBubble: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 16,
    maxWidth: '80%',
  },
  botBubbleActionable: {
    flexDirection: 'row',
    paddingLeft: 0,
    overflow: 'hidden',
  },
  actionableIndicator: {
    width: 4,
    backgroundColor: '#ffffff',
    marginRight: 12,
  },
  botText: {
    color: '#e5e5ea',
    fontSize: 15,
    lineHeight: 22,
    flexShrink: 1,
    paddingRight: 16, // only needed if we want spacing from right edge
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 24,
  },
  actionButtonPrimary: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
  },
  actionButtonPrimaryText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '500',
  },
  actionButtonSecondary: {
    backgroundColor: '#2c2c2e',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  actionButtonSecondaryText: {
    color: '#e5e5ea',
    fontSize: 13,
    fontWeight: '500',
  },
  userBubble: {
    backgroundColor: '#e5e5ea',
    borderRadius: 16,
    padding: 16,
    maxWidth: '80%',
  },
  userText: {
    color: '#000000',
    fontSize: 15,
    lineHeight: 22,
  },
  typingBubble: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#a0a0a0',
    marginHorizontal: 3,
  }
});
