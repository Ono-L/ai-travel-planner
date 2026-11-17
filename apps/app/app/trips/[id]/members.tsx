import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// SCR-06: 参加者管理・招待 (docs/01_Requirements/screen_spec.md 準拠)
export default function TripMembersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>参加者管理・招待リンク</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  heading: { fontSize: 20, fontWeight: '700', color: '#111827' },
});
