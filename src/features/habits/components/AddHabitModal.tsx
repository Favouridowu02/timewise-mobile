import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../../../store/useStore';

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
}

const FREQUENCIES = ['Daily', 'Weekly', '3x / week', 'Weekdays', 'Custom'];
const TIMES = ['Any time', 'Morning', 'Afternoon', 'Evening'];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ visible, onClose }) => {
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [time, setTime] = useState('Any time');

  const addHabit = useStore(state => state.addHabit);

  const triggerHaptic = () => {
    Haptics.selectionAsync();
  };

  const handleSave = () => {
    if (!title.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const subtitle = `${frequency} • ${time}`;

    addHabit({
      title: title.trim(),
      subtitle,
      frequency,
    });

    setTitle('');
    setFrequency('Daily');
    setTime('Any time');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Habit</Text>
            <TouchableOpacity onPress={() => { triggerHaptic(); onClose(); }} style={styles.closeButton}>
              <X color="#ffffff" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <TextInput
              style={styles.titleInput}
              placeholder="What habit do you want to build?"
              placeholderTextColor="#6b7280"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            <Text style={styles.sectionTitle}>Frequency</Text>
            <View style={styles.chipRow}>
              {FREQUENCIES.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, frequency === f ? styles.chipActive : {}]}
                  onPress={() => { triggerHaptic(); setFrequency(f); }}
                >
                  <Text style={[styles.chipText, frequency === f ? styles.chipTextActive : {}]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Time of Day</Text>
            <View style={styles.chipRow}>
              {TIMES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, time === t ? styles.chipActive : {}]}
                  onPress={() => { triggerHaptic(); setTime(t); }}
                >
                  <Text style={[styles.chipText, time === t ? styles.chipTextActive : {}]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={styles.saveButtonText}>Create Habit</Text>
            </TouchableOpacity>
            
            {/* Bottom padding for scroll clearance */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 24,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 6,
    backgroundColor: '#1c1b1b',
    borderRadius: 20,
  },
  titleInput: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#8E9192',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    backgroundColor: '#1c1b1b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  chipActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  chipText: {
    color: '#c4c7c8',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
