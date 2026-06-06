import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { FloPredictions } from '../../../types';
import { Colors, Typography, Radius, Spacing } from '../../../constants/theme';
import { Card } from '../../../components/Card';
import { getDaysUntil } from '../utils/cycleCalculations';
import { format, parseISO } from 'date-fns';

interface Props {
  predictions: FloPredictions | null;
  computedPredictions: (FloPredictions & { confidence: number }) | null;
  onSave: (p: FloPredictions) => Promise<void>;
  onClear: () => Promise<void>;
  onRefreshPlan: () => void;
  cycleCount: number;
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

export function FloPredictionsCard({
  predictions,
  computedPredictions,
  onSave,
  onClear,
  onRefreshPlan,
  cycleCount,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [ovulationInput, setOvulationInput] = useState('');
  const [nextCycleInput, setNextCycleInput] = useState('');
  const [error, setError] = useState('');

  const isManual = predictions !== null && predictions.isComputed === false;
  const displayed = predictions;

  const openModal = () => {
    setOvulationInput(isManual ? (predictions?.ovulationDate ?? '') : '');
    setNextCycleInput(isManual ? (predictions?.nextCycleStart ?? '') : '');
    setError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(ovulationInput) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(nextCycleInput)
    ) {
      setError('Please use YYYY-MM-DD format');
      return;
    }
    setError('');
    await onSave({
      ovulationDate: ovulationInput,
      nextCycleStart: nextCycleInput,
      lastUpdated: new Date().toISOString().split('T')[0],
      isComputed: false,
    });
    setModalVisible(false);
  };

  const handleClear = async () => {
    await onClear();
    setModalVisible(false);
  };

  return (
    <>
      <Card style={styles.card} padding={16}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Predictions</Text>
            {!isManual && computedPredictions && (
              <Text style={styles.source}>Computed from {cycleCount} cycles</Text>
            )}
            {isManual && (
              <Text style={styles.sourceManual}>Manually overridden</Text>
            )}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={openModal}>
              <Text style={styles.actionBtnText}>
                {isManual ? '✏️ Edit' : '✏️ Override'}
              </Text>
            </TouchableOpacity>
            {displayed && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.refreshBtn]}
                onPress={onRefreshPlan}
              >
                <Text style={styles.actionBtnText}>✨ Refresh plan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {displayed ? (
          <View style={styles.predRows}>
            <View style={styles.predRow}>
              <Text style={styles.predIcon}>🥚</Text>
              <View style={styles.predText}>
                <Text style={styles.predLabel}>Predicted ovulation</Text>
                <Text style={styles.predValue}>{formatPrediction(displayed.ovulationDate)}</Text>
              </View>
            </View>
            <View style={styles.predRow}>
              <Text style={styles.predIcon}>🌸</Text>
              <View style={styles.predText}>
                <Text style={styles.predLabel}>Predicted next period</Text>
                <Text style={styles.predValue}>{formatPrediction(displayed.nextCycleStart)}</Text>
                {!isManual && displayed.confidence != null && (
                  <Text style={styles.confidence}>±{displayed.confidence} day window</Text>
                )}
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>
            Predictions will appear once cycle data is loaded.
          </Text>
        )}
      </Card>

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Override Predictions</Text>
            <Text style={styles.modalSubtitle}>
              Enter dates from Flo to override the computed prediction.
            </Text>
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
              {isManual && (
                <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                  <Text style={styles.clearBtnText}>Use computed</Text>
                </TouchableOpacity>
              )}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { ...Typography.heading3 },
  source: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  sourceManual: { fontSize: 11, color: Colors.pastelPurple, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  refreshBtn: { backgroundColor: Colors.pastelPurple + '40', borderColor: Colors.pastelPurple },
  actionBtnText: { fontSize: 12, fontWeight: '500', color: Colors.textDark },
  predRows: { gap: 10 },
  predRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  predIcon: { fontSize: 20, marginTop: 2 },
  predText: { flex: 1 },
  predLabel: { ...Typography.caption, marginBottom: 2 },
  predValue: { ...Typography.bodyBold, fontSize: 14 },
  confidence: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  emptyText: { ...Typography.body, fontSize: 13, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { ...Typography.heading2, marginBottom: 6 },
  modalSubtitle: { ...Typography.body, fontSize: 13, color: Colors.textMuted, marginBottom: 20 },
  inputLabel: { ...Typography.label, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 15, color: Colors.textDark, marginBottom: 14 },
  errorText: { color: '#E05C5C', fontSize: 13, marginBottom: 10 },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  cancelBtnText: { ...Typography.label },
  clearBtn: { flex: 1, padding: 14, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.pastelPurple, alignItems: 'center' },
  clearBtnText: { ...Typography.label, color: Colors.pastelPurple },
  saveBtn: { flex: 1, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.pastelPink, alignItems: 'center' },
  saveBtnText: { ...Typography.label, color: Colors.white },
});
