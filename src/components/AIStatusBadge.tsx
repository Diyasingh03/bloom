import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Radius } from '../constants/theme';

interface Props {
  isUsingFallback: boolean;
  isRegenerating?: boolean;
  error?: 'rate_limited' | null;
}

export function AIStatusBadge({ isUsingFallback, isRegenerating, error }: Props) {
  if (isRegenerating) {
    return (
      <View style={[styles.badge, styles.loading]}>
        <ActivityIndicator size="small" color="#6B4FA0" style={{ transform: [{ scale: 0.7 }] }} />
        <Text style={[styles.text, styles.loadingText]}>thinking…</Text>
      </View>
    );
  }

  if (isUsingFallback) {
    const label = error === 'rate_limited' ? 'rate limit' : 'offline';
    return (
      <View style={[styles.badge, styles.offline]}>
        <Text style={[styles.text, styles.offlineText]}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.online]}>
      <Text style={[styles.text, styles.onlineText]}>✨ AI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  online: {
    backgroundColor: Colors.pastelPurple,
  },
  offline: {
    backgroundColor: '#E8E8E8',
  },
  loading: {
    backgroundColor: Colors.pastelPurple + '40',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  onlineText: {
    color: '#6B4FA0',
  },
  offlineText: {
    color: '#888',
  },
  loadingText: {
    color: '#6B4FA0',
  },
});
