import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import { X, Plus, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore, Task, Subtask } from '../../../store/useStore';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  initialTask?: Task | null;
  initialDate?: Date;
}

const PRIORITIES = ['High', 'Med', 'Low', 'None'];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ visible, onClose, initialTask, initialDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'High' | 'Med' | 'Low' | ''>('');
  
  // Date & Time
  const [date, setDate] = useState(new Date());
  const [hasDate, setHasDate] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // End Date & Time
  const [endDate, setEndDate] = useState(new Date());
  const [hasEndDate, setHasEndDate] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // Subtasks
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);

  const addTask = useStore(state => state.addTask);
  const updateTask = useStore(state => state.updateTask);

  useEffect(() => {
    if (initialTask && visible) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority);
      setDate(initialTask.date ? new Date(initialTask.date) : new Date());
      setHasDate(!!initialTask.date);
      setEndDate(initialTask.endDate ? new Date(initialTask.endDate) : new Date());
      setHasEndDate(!!initialTask.endDate);
      setSubtasks(initialTask.subtasksList || []);
      setShowSubtaskInput(false);
      setShowDatePicker(false);
      setShowTimePicker(false);
      setShowEndDatePicker(false);
      setShowEndTimePicker(false);
    } else if (visible) {
      setTitle('');
      setDescription('');
      setPriority('');
      setDate(initialDate || new Date());
      setHasDate(true);
      setEndDate(initialDate || new Date());
      setHasEndDate(false);
      setSubtasks([]);
      setShowSubtaskInput(false);
      setShowDatePicker(false);
      setShowTimePicker(false);
      setShowEndDatePicker(false);
      setShowEndTimePicker(false);
    }
  }, [initialTask, visible]);

  const triggerHaptic = () => {
    Haptics.selectionAsync();
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubtasks([...subtasks, { id: Date.now().toString(), title: newSubtaskTitle.trim(), completed: false }]);
      setNewSubtaskTitle('');
      setShowSubtaskInput(false);
      triggerHaptic();
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
    triggerHaptic();
  };

  const handleSave = () => {
    if (!title.trim()) return;

    let timeString = 'Anytime';
    if (hasDate) {
      const startStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (hasEndDate) {
        const endStr = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeString = `${startStr} - ${endStr}`;
      } else {
        timeString = startStr;
      }
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const taskPayload = {
      title,
      description,
      priority: priority === 'None' ? '' : (priority as any),
      time: timeString,
      date: hasDate ? date.toISOString() : null,
      endDate: hasEndDate ? endDate.toISOString() : null,
      subtasksList: subtasks,
    };

    if (initialTask) {
      updateTask(initialTask.id, taskPayload);
    } else {
      addTask(taskPayload);
    }

    onClose();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(newDate);
      triggerHaptic();
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedDate) {
      const newDate = new Date(date);
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setDate(newDate);
      triggerHaptic();
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const newDate = new Date(endDate);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setEndDate(newDate);
      triggerHaptic();
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(false);
    if (event.type === 'set' && selectedDate) {
      const newDate = new Date(endDate);
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setEndDate(newDate);
      triggerHaptic();
    }
  };

  const toggleHasEndDate = (val: boolean) => {
    triggerHaptic();
    setHasEndDate(val);
    if (val) {
      const newEnd = new Date(date);
      newEnd.setHours(date.getHours() + 1);
      setEndDate(newEnd);
    }
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
            <Text style={styles.headerTitle}>{initialTask ? 'Edit Task' : 'New Task'}</Text>
            <TouchableOpacity onPress={() => { triggerHaptic(); onClose(); }} style={styles.closeButton}>
              <X color="#ffffff" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <TextInput
              style={styles.titleInput}
              placeholder="What do you need to do?"
              placeholderTextColor="#6b7280"
              value={title}
              onChangeText={setTitle}
              autoFocus={!initialTask}
            />

            <TextInput
              style={styles.descInput}
              placeholder="Notes or description..."
              placeholderTextColor="#6b7280"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Date and Time Row */}
            <View style={styles.dateToggleRow}>
              <Text style={styles.sectionTitle}>Schedule Task</Text>
              <Switch 
                value={hasDate} 
                onValueChange={(val) => { triggerHaptic(); setHasDate(val); }} 
                trackColor={{ false: '#3f3f46', true: '#2563eb' }}
                thumbColor={'#ffffff'}
              />
            </View>

            {hasDate && (
              <View style={styles.dateTimeContainer}>
                <View style={styles.dateTimeRow}>
                  <TouchableOpacity 
                    style={[styles.dateTimeButton, showDatePicker && styles.dateTimeButtonActive]} 
                    onPress={() => { 
                      triggerHaptic(); 
                      setShowTimePicker(false);
                      setShowEndDatePicker(false);
                      setShowEndTimePicker(false);
                      setShowDatePicker(!showDatePicker); 
                    }}
                  >
                    <CalendarIcon color={showDatePicker ? "#ffffff" : "#2563eb"} size={18} />
                    <Text style={[styles.dateTimeText, showDatePicker && styles.dateTimeTextActive]}>
                      {date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.dateTimeButton, showTimePicker && styles.dateTimeButtonActive]} 
                    onPress={() => { 
                      triggerHaptic(); 
                      setShowDatePicker(false);
                      setShowEndDatePicker(false);
                      setShowEndTimePicker(false);
                      setShowTimePicker(!showTimePicker); 
                    }}
                  >
                    <Clock color={showTimePicker ? "#ffffff" : "#eab308"} size={18} />
                    <Text style={[styles.dateTimeText, showTimePicker && styles.dateTimeTextActive]}>
                      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* End Date Toggle */}
                <View style={styles.endDateToggleRow}>
                  <Text style={styles.sectionTitleSmall}>Add End Time</Text>
                  <Switch 
                    value={hasEndDate} 
                    onValueChange={toggleHasEndDate} 
                    trackColor={{ false: '#3f3f46', true: '#2563eb' }}
                    thumbColor={'#ffffff'}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                </View>

                {hasEndDate && (
                  <View style={styles.dateTimeRow}>
                    <TouchableOpacity 
                      style={[styles.dateTimeButton, showEndDatePicker && styles.dateTimeButtonActive]} 
                      onPress={() => { 
                        triggerHaptic(); 
                        setShowDatePicker(false);
                        setShowTimePicker(false);
                        setShowEndTimePicker(false);
                        setShowEndDatePicker(!showEndDatePicker); 
                      }}
                    >
                      <CalendarIcon color={showEndDatePicker ? "#ffffff" : "#2563eb"} size={18} />
                      <Text style={[styles.dateTimeText, showEndDatePicker && styles.dateTimeTextActive]}>
                        {endDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.dateTimeButton, showEndTimePicker && styles.dateTimeButtonActive]} 
                      onPress={() => { 
                        triggerHaptic(); 
                        setShowDatePicker(false);
                        setShowTimePicker(false);
                        setShowEndDatePicker(false);
                        setShowEndTimePicker(!showEndTimePicker); 
                      }}
                    >
                      <Clock color={showEndTimePicker ? "#ffffff" : "#ef4444"} size={18} />
                      <Text style={[styles.dateTimeText, showEndTimePicker && styles.dateTimeTextActive]}>
                        {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {showDatePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            
            {showTimePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={date}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}

            {showEndDatePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onEndDateChange}
              />
            )}
            
            {showEndTimePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={endDate}
                mode="time"
                display="default"
                onChange={onEndTimeChange}
              />
            )}

            {/* Priority */}
            <Text style={styles.sectionTitle}>Priority</Text>
            <View style={styles.chipRow}>
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, priority === p || (p === 'None' && priority === '') ? styles.chipActive : {}]}
                  onPress={() => { triggerHaptic(); setPriority(p === 'None' ? '' : (p as any)); }}
                >
                  <Text style={[styles.chipText, priority === p || (p === 'None' && priority === '') ? styles.chipTextActive : {}]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Subtasks */}
            <View style={styles.subtasksHeader}>
              <Text style={styles.sectionTitle}>Subtasks</Text>
              {!showSubtaskInput && (
                <TouchableOpacity onPress={() => { triggerHaptic(); setShowSubtaskInput(true); }}>
                  <Plus color="#2563eb" size={20} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.subtaskList}>
              {subtasks.map((subtask) => (
                <View key={subtask.id} style={styles.subtaskItem}>
                  <View style={styles.subtaskDot} />
                  <Text style={styles.subtaskText}>{subtask.title}</Text>
                  <TouchableOpacity onPress={() => removeSubtask(subtask.id)}>
                    <Trash2 color="#ef4444" size={16} />
                  </TouchableOpacity>
                </View>
              ))}
              
              {showSubtaskInput && (
                <View style={styles.addSubtaskRow}>
                  <TextInput
                    style={styles.subtaskInput}
                    placeholder="Add subtask..."
                    placeholderTextColor="#6b7280"
                    value={newSubtaskTitle}
                    onChangeText={setNewSubtaskTitle}
                    autoFocus
                    onSubmitEditing={handleAddSubtask}
                  />
                  <TouchableOpacity style={styles.addSubtaskBtn} onPress={handleAddSubtask}>
                    <Text style={styles.addSubtaskBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={styles.saveButtonText}>Save Task</Text>
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
    marginBottom: 12,
  },
  descInput: {
    color: '#a1a1aa',
    fontSize: 15,
    minHeight: 40,
    marginBottom: 20,
  },
  dateToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeContainer: {
    backgroundColor: '#141313',
    padding: 12,
    borderRadius: 16,
    marginBottom: 24,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  endDateToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1c1b1b',
    paddingTop: 12,
  },
  sectionTitleSmall: {
    color: '#8E9192',
    fontSize: 13,
    fontWeight: '500',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1b1b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1c1b1b',
    gap: 8,
  },
  dateTimeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  dateTimeText: {
    color: '#e4e4e7',
    fontSize: 14,
    fontWeight: '600',
  },
  dateTimeTextActive: {
    color: '#ffffff',
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
    paddingVertical: 8,
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
  subtasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtaskList: {
    marginBottom: 24,
    gap: 12,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1b1b',
    padding: 12,
    borderRadius: 12,
  },
  subtaskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginRight: 12,
  },
  subtaskText: {
    color: '#ffffff',
    fontSize: 15,
    flex: 1,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1b1b',
    borderRadius: 12,
    paddingRight: 8,
  },
  subtaskInput: {
    flex: 1,
    color: '#ffffff',
    padding: 12,
    fontSize: 15,
  },
  addSubtaskBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addSubtaskBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
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
