import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// SCR-04: 支出登録・レシートAI撮影 (docs/01_Requirements/screen_spec.md 準拠)
export default function NewExpenseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>支出登録・レシートAI読み取り</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  heading: { fontSize: 20, fontWeight: '700', color: '#111827' },
});
