import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SymptomLog, SymptomKey, CyclePhase } from '../../../types';
import { Colors, Typography, Radius, PhaseThemes } from '../../../constants/theme';
import { Card } from '../../../components/Card';
import { format } from 'date-fns';

const SYMPTOMS: Array<{ key: SymptomKey; label: string; emoji: string }> = [
  { key: 'bloating', label: 'Bloating', emoji: '🤢' },
  { key: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { key: 'acne', label: 'Acne', emoji: '✨' },
  { key: 'mood', label: 'Mood', emoji: '🌀' },
  { key: 'hairChanges', label: 'Hair Changes', emoji: '💇' },
  { key: 'cravings', label: 'Cravings', emoji: '🍰' },
  { key: 'cramps', label: 'Cramps', emoji: '🌊' },
  { key: 'brainFog', label: 'Brain Fog', emoji: '🌫️' },
];

interface Props {
  existingLog: SymptomLog | null;
  cycleDay: number;
  phase: CyclePhase;
  onSave: (log: SymptomLog) => Promise<void>;
}

export function SymptomLogger({ existingLog, cycleDay, phase, onSave }: Props) {
  const [ratings, setRatings] = useState<Partial<Record<SymptomKey, number>>>(
    existingLog?.symptoms ?? {}
  );
  const [notes, setNotes] = useState(existingLog?.notes ?? '');
  const [saved, setSaved] = useState(false);

  const checkScale = useSharedValue(0);
  const phaseColour = PhaseThemes[phase].primary;

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleSave = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const log: SymptomLog = {
      id: today,
      date: today,
      cycleDay,
      phase,
      symptoms: ratings,
      notes: notes.trim() || undefined,
    };
    await onSave(log);
    setSaved(true);
    checkScale.value = withSequence(withSpring(1.2), withTiming(1));
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <View style={styles.container}>
      {SYMPTOMS.map(({ key, label, emoji }) => (
        <View key={key} style={styles.symptomRow}>
          <Text style={styles.symptomEmoji}>{emoji}</Text>
          <Text style={styles.symptomLabel}>{label}</Text>
          <View style={styles.dots}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setRatings((prev) => ({ ...prev, [key]: n }))}
                style={[
                  styles.dot,
                  (ratings[key] ?? 0) >= n && { backgroundColor: phaseColour },
                  (ratings[key] ?? 0) >= n && { borderColor: phaseColour },
                ]}
              />
            ))}
          </View>
        </View>
      ))}

      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="Any notes for today..."
        placeholderTextColor={Colors.textMuted}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: phaseColour }]}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        {saved ? (
          <Animated.Text style={[styles.saveBtnText, checkStyle]}>✓ Saved!</Animated.Text>
        ) : (
          <Text style={styles.saveBtnText}>Save today's log</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 4 },
  symptomRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  symptomEmoji: { fontSize: 18, width: 28 },
  symptomLabel: { ...Typography.label, flex: 1, fontSize: 14 },
  dots: { flexDirection: 'row', gap: 7 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  notesInput: { marginTop: 16, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 14, color: Colors.textDark, minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { marginTop: 16, paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
