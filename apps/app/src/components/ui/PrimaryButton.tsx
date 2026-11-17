import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ label, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1A56DB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
