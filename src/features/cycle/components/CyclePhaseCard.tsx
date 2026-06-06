import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CyclePhase } from '../../../types';
import { PhaseThemes, Colors, Typography, Radius, Spacing } from '../../../constants/theme';
import { Card } from '../../../components/Card';

interface Props {
  phase: CyclePhase;
  cycleDay: number;
  cycleLength: number;
  insight?: string;
}

export function CyclePhaseCard({ phase, cycleDay, cycleLength, insight }: Props) {
  const theme = PhaseThemes[phase];
  const progress = Math.min(cycleDay / cycleLength, 1);
  const displayInsight = insight ?? theme.insight;

  return (
    <Animated.View entering={FadeInDown.duration(500)}>
      <Card style={[styles.card, { borderColor: theme.primary + '40' }] as StyleProp<ViewStyle>} padding={20}>
        <View style={styles.header}>
          <View style={[styles.phaseChip, { backgroundColor: theme.primary + '25' }]}>
            <Text style={styles.emoji}>{theme.emoji}</Text>
            <Text style={[styles.phaseLabel, { color: theme.primary }]}>{theme.label} Phase</Text>
          </View>
          <Text style={styles.dayCount}>Day {cycleDay}</Text>
        </View>

        <Text style={styles.insight}>{displayInsight}</Text>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: theme.primary },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>Day {cycleDay} of {cycleLength}</Text>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  emoji: {
    fontSize: 16,
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayCount: {
    ...Typography.heading2,
    fontSize: 20,
  },
  insight: {
    ...Typography.body,
    marginBottom: 16,
    lineHeight: 22,
  },
  progressSection: {
    gap: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressLabel: {
    ...Typography.caption,
    textAlign: 'right',
  },
});
