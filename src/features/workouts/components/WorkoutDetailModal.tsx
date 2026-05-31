import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Workout, AIWorkout, CyclePhase } from '../../../types';
import { Colors, Typography, Radius, PhaseThemes } from '../../../constants/theme';

type WorkoutData = Workout | (AIWorkout & { phase?: CyclePhase });

interface Props {
  workout: WorkoutData | null;
  visible: boolean;
  onClose: () => void;
}

export function WorkoutDetailModal({ workout, visible, onClose }: Props) {
  if (!workout) return null;
  const phase = (workout as Workout).phase;
  const phaseColour = phase ? PhaseThemes[phase].primary : Colors.pastelPurple;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.handle} />
        <View style={[styles.header, { borderBottomColor: phaseColour + '30' }]}>
          <Text style={styles.emoji}>{workout.emoji}</Text>
          <View style={styles.headerText}>
            <Text style={styles.title}>{workout.name}</Text>
            <Text style={styles.meta}>{workout.durationMinutes} min • {workout.intensity} • {workout.type}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Equipment */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Equipment</Text>
            <View style={styles.equipmentRow}>
              {workout.equipment.map((eq, i) => (
                <View key={i} style={[styles.equipChip, { backgroundColor: phaseColour + '20' }]}>
                  <Text style={[styles.equipText, { color: phaseColour }]}>{eq}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PCOS Benefit</Text>
            <Text style={styles.benefitText}>{workout.benefits}</Text>
          </View>

          {/* Steps */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>The Workout</Text>
            {workout.steps.map((step) => (
              <View key={step.order} style={styles.step}>
                <View style={[styles.stepNum, { backgroundColor: phaseColour }]}>
                  <Text style={styles.stepNumText}>{step.order}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepInstruction}>{step.instruction}</Text>
                  <Text style={styles.stepDuration}>{step.duration}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  handle: { width: 36, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1 },
  emoji: { fontSize: 32 },
  headerText: { flex: 1 },
  title: { ...Typography.heading2, fontSize: 19 },
  meta: { ...Typography.caption, marginTop: 3 },
  closeBtn: { padding: 8 },
  closeBtnText: { fontSize: 16, color: Colors.textMuted },
  body: { padding: 20, gap: 24, paddingBottom: 40 },
  section: { gap: 10 },
  sectionLabel: { ...Typography.label, textTransform: 'uppercase', letterSpacing: 0.8, color: Colors.textMuted, fontSize: 11 },
  equipmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  equipChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  equipText: { fontSize: 13, fontWeight: '500' },
  benefitText: { ...Typography.body, fontStyle: 'italic' },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepNumText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  stepContent: { flex: 1, gap: 3 },
  stepInstruction: { ...Typography.bodyBold, fontSize: 14, lineHeight: 20 },
  stepDuration: { ...Typography.caption, color: Colors.textMuted },
});
