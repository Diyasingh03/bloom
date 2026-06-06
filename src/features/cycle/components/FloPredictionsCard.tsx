import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { FloPredictions } from '../../../types';
import { Colors, Typography, Radius, Spacing } from '../../../constants/theme';
import { Card } from '../../../components/Card';
import { getDaysUntil } from '../utils/cycleCalculations';
import { format, parseISO } from 'date-fns';

interface Props {
  predictions: FloPredictions | null;
  onSave: (p: FloPredictions) => Promise<void>;
  onRefreshPlan: () => void;
}

function formatPrediction(dateStr: string): string {
  try {
    const days = getDaysUntil(dateStr);
    const formatted = format(parseISO(dateStr), 'EEE d MMM');
    if (days < 0) return `${formatted} (passed)`;
    if (days === 0) return `${formatted} (today!)`;
    return `${formatted} (in ${days} day${days === 1 ? '' : 's'})`;
  } catch {
    return dateStr;
  }
}

export function FloPredictionsCard({ predictions, onSave, onRefreshPlan }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [ovulationInput, setOvulationInput] = useState(predictions?.ovulationDate ?? '');
  const [nextCycleInput, setNextCycleInput] = useState(predictions?.nextCycleStart ?? '');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ovulationInput) || !/^\d{4}-\d{2}-\d{2}$/.test(nextCycleInput)) {
      setError('Please use YYYY-MM-DD format');
      return;
    }
    setError('');
    await onSave({
      ovulationDate: ovulationInput,
      nextCycleStart: nextCycleInput,
      lastUpdated: new Date().toISOString().split('T')[0],
    });
    setModalVisible(false);
  };

  return (
    <>
      <Card style={styles.card} padding={16}>
        <View style={styles.header}>
          <Text style={styles.title}>Flo Predictions</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                setOvulationInput(predictions?.ovulationDate ?? '');
                setNextCycleInput(predictions?.nextCycleStart ?? '');
                setError('');
                setModalVisible(true);
              }}
            >
              <Text style={styles.actionBtnText}>✏️ Edit</Text>
            </TouchableOpacity>
            {predictions && (
              <TouchableOpacity style={[styles.actionBtn, styles.refreshBtn]} onPress={onRefreshPlan}>
                <Text style={styles.actionBtnText}>✨ Refresh plan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {predictions ? (
          <View style={styles.predRows}>
            <View style={styles.predRow}>
              <Text style={styles.predIcon}>🥚</Text>
              <View>
                <Text style={styles.predLabel}>Predicted ovulation</Text>
                <Text style={styles.predValue}>{formatPrediction(predictions.ovulationDate)}</Text>
              </View>
            </View>
            <View style={styles.predRow}>
              <Text style={styles.predIcon}>🌸</Text>
              <View>
                <Text style={styles.predLabel}>Predicted next period</Text>
                <Text style={styles.predValue}>{formatPrediction(predictions.nextCycleStart)}</Text>
              </View>
            </View>
            <Text style={styles.lastUpdated}>
              Updated {predictions.lastUpdated}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>
            Tap Edit to add your Flo ovulation and next period predictions. These help personalise your AI plan.
          </Text>
        )}
      </Card>

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Flo Predictions</Text>
            <Text style={styles.inputLabel}>Predicted ovulation date</Text>
            <TextInput
              style={styles.input}
              value={ovulationInput}
              onChangeText={setOvulationInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.inputLabel}>Predicted next period start</Text>
            <TextInput
              style={styles.input}
              value={nextCycleInput}
              onChangeText={setNextCycleInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numbers-and-punctuation"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { ...Typography.heading3 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  refreshBtn: { backgroundColor: Colors.pastelPurple + '40', borderColor: Colors.pastelPurple },
  actionBtnText: { fontSize: 12, fontWeight: '500', color: Colors.textDark },
  predRows: { gap: 10 },
  predRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  predIcon: { fontSize: 20 },
  predLabel: { ...Typography.caption, marginBottom: 2 },
  predValue: { ...Typography.bodyBold, fontSize: 14 },
  lastUpdated: { ...Typography.caption, marginTop: 4 },
  emptyText: { ...Typography.body, fontSize: 13, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { ...Typography.heading2, marginBottom: 20 },
  inputLabel: { ...Typography.label, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 15, color: Colors.textDark, marginBottom: 14 },
  errorText: { color: '#E05C5C', fontSize: 13, marginBottom: 10 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  cancelBtnText: { ...Typography.label },
  saveBtn: { flex: 1, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.pastelPink, alignItems: 'center' },
  saveBtnText: { ...Typography.label, color: Colors.white },
});
