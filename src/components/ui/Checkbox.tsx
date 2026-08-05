import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => onChange(!checked)}
    >
      <View style={[styles.box, checked && styles.checkedBox]}>
        {checked && <View style={styles.checkmark} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#4b5563', // gray-600
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  checkmark: {
    width: 8,
    height: 8,
    backgroundColor: '#000000',
    borderRadius: 1,
  },
  label: {
    color: '#9ca3af',
    fontSize: 14,
  }
});
