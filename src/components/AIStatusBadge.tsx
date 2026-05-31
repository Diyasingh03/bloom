import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../constants/theme';

interface Props {
  isUsingFallback: boolean;
}

export function AIStatusBadge({ isUsingFallback }: Props) {
  return (
    <View style={[styles.badge, isUsingFallback ? styles.offline : styles.online]}>
      <Text style={[styles.text, isUsingFallback ? styles.offlineText : styles.onlineText]}>
        {isUsingFallback ? 'offline' : '✨ AI'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  online: {
    backgroundColor: Colors.pastelPurple,
  },
  offline: {
    backgroundColor: '#E8E8E8',
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
});
