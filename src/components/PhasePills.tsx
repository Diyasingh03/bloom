import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { CyclePhase } from '../types';
import { PhaseThemes, Colors, Radius } from '../constants/theme';

interface Props {
  selected: CyclePhase | 'all';
  onSelect: (phase: CyclePhase | 'all') => void;
  includeAll?: boolean;
}

const PHASES: CyclePhase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];

export function PhasePills({ selected, onSelect, includeAll = false }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {includeAll && (
        <TouchableOpacity
          onPress={() => onSelect('all')}
          style={[styles.pill, selected === 'all' && styles.pillActiveAll]}
        >
          <Text style={[styles.pillText, selected === 'all' && styles.pillTextActive]}>All</Text>
        </TouchableOpacity>
      )}
      {PHASES.map((phase) => {
        const theme = PhaseThemes[phase];
        const isActive = selected === phase;
        return (
          <TouchableOpacity
            key={phase}
            onPress={() => onSelect(phase)}
            style={[
              styles.pill,
              isActive && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
          >
            <Text style={styles.pillEmoji}>{theme.emoji}</Text>
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {theme.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  pillActiveAll: {
    backgroundColor: Colors.textDark,
    borderColor: Colors.textDark,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  pillTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  pillEmoji: {
    fontSize: 13,
  },
});
