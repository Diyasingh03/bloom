import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SymptomKey, CyclePhase } from '../../../types';
import { Colors, Typography, Radius, PhaseThemes } from '../../../constants/theme';

const QUICK_SYMPTOMS: Array<{ key: SymptomKey; emoji: string; label: string }> = [
  { key: 'fatigue', emoji: '😴', label: 'Energy' },
  { key: 'bloating', emoji: '🤢', label: 'Bloating' },
  { key: 'mood', emoji: '🌀', label: 'Mood' },
  { key: 'cramps', emoji: '🌊', label: 'Cramps' },
];

interface Props {
  phase: CyclePhase;
  onLogComplete?: (ratings: Partial<Record<SymptomKey, number>>) => void;
}

export function QuickSymptomRow({ phase, onLogComplete }: Props) {
  const [ratings, setRatings] = useState<Partial<Record<SymptomKey, number>>>({});
  const phaseColour = PhaseThemes[phase].primary;

  const setRating = (key: SymptomKey, val: number) => {
    const updated = { ...ratings, [key]: val };
    setRatings(updated);
    if (onLogComplete) onLogComplete(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Quick check-in</Text>
      <View style={styles.row}>
        {QUICK_SYMPTOMS.map(({ key, emoji, label }) => (
          <View key={key} style={styles.item}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.itemLabel}>{label}</Text>
            <View style={styles.miniDots}>
              {[1, 2, 3].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setRating(key, n)}
                  style={[
                    styles.miniDot,
                    (ratings[key] ?? 0) >= n && { backgroundColor: phaseColour, borderColor: phaseColour },
                  ]}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  label: { ...Typography.label, marginBottom: 10, color: Colors.textMuted },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  item: { alignItems: 'center', gap: 5, flex: 1 },
  emoji: { fontSize: 20 },
  itemLabel: { fontSize: 11, fontWeight: '500', color: Colors.textMuted },
  miniDots: { flexDirection: 'row', gap: 5 },
  miniDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
});
