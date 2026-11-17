import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// SCR-02: トリップ作成モーダル (docs/01_Requirements/screen_spec.md 準拠)
export default function NewTripModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>新しい旅行を作成</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  heading: { fontSize: 20, fontWeight: '700', color: '#111827' },
});
