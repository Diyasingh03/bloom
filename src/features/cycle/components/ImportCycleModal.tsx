import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../../../constants/theme';
import { parseFloJson } from '../../../lib/floImport';
import { storageSet, STORAGE_KEYS } from '../../../lib/storage';

interface Props {
  visible: boolean;
  onClose: () => void;
  onImported: () => void;
}

type State = 'idle' | 'valid' | 'error' | 'importing' | 'success';

export function ImportCycleModal({ visible, onClose, onImported }: Props) {
  const [json, setJson] = useState('');
  const [state, setState] = useState<State>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const reset = () => {
    setJson('');
    setState('idle');
    setCycleCount(0);
    setErrorMsg('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleTextChange = (text: string) => {
    setJson(text);
    if (!text.trim()) {
      setState('idle');
      return;
    }
    const parsed = parseFloJson(text);
    if (parsed) {
      setState('valid');
      setCycleCount(parsed.cycles.length);
      setErrorMsg('');
    } else {
      setState('error');
      setErrorMsg('Invalid format. Make sure the JSON matches: { "cycles": [...] }');
    }
  };

  const handleImport = async () => {
    const parsed = parseFloJson(json);
    if (!parsed) return;
    setState('importing');
    await storageSet(STORAGE_KEYS.FLO_DATA, parsed);
    setState('success');
    setTimeout(() => {
      onImported();
      handleClose();
    }, 1200);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Import Cycle Data</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.instructions}>
              Paste your cycle JSON below. Each cycle needs{' '}
              <Text style={styles.code}>start_date</Text>,{' '}
              <Text style={styles.code}>end_date</Text>,{' '}
              <Text style={styles.code}>cycle_length</Text>, and{' '}
              <Text style={styles.code}>period_length</Text>. The optional{' '}
              <Text style={styles.code}>ovulation</Text> field is also accepted.
            </Text>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>
                {`{ "cycles": [\n  {\n    "start_date": "2026-01-01",\n    "end_date": "2026-02-04",\n    "cycle_length": 35,\n    "period_length": 5,\n    "ovulation": "2026-01-20"\n  }\n] }`}
              </Text>
            </View>

            <View style={styles.warning}>
              <Text style={styles.warningText}>
                Importing will replace your current cycle history.
              </Text>
            </View>

            <TextInput
              style={[
                styles.input,
                state === 'valid' && styles.inputValid,
                state === 'error' && styles.inputError,
              ]}
              multiline
              value={json}
              onChangeText={handleTextChange}
              placeholder='Paste JSON here…'
              placeholderTextColor={Colors.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
              textAlignVertical="top"
            />

            {state === 'valid' && (
              <View style={styles.validRow}>
                <Text style={styles.validText}>
                  Valid — {cycleCount} cycle{cycleCount !== 1 ? 's' : ''} detected
                </Text>
              </View>
            )}
            {state === 'error' && (
              <Text style={styles.errorText}>{errorMsg}</Text>
            )}
            {state === 'success' && (
              <View style={styles.successRow}>
                <Text style={styles.successText}>Imported successfully!</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.importBtn,
                state !== 'valid' && styles.importBtnDisabled,
              ]}
              onPress={handleImport}
              disabled={state !== 'valid'}
            >
              {state === 'importing' ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.importBtnText}>
                  {state === 'valid'
                    ? `Import ${cycleCount} cycle${cycleCount !== 1 ? 's' : ''}`
                    : 'Import'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { ...Typography.heading2 },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeBtnText: { ...Typography.label, color: Colors.textDark },
  content: { padding: Spacing.lg, paddingBottom: 8, gap: 14 },
  instructions: { ...Typography.body, fontSize: 14, lineHeight: 21, color: Colors.textDark },
  code: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, color: Colors.pastelPurple },
  exampleBox: {
    backgroundColor: Colors.pastelPurple + '12',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.pastelPurple + '30',
  },
  exampleText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: Colors.textDark,
    lineHeight: 18,
  },
  warning: {
    backgroundColor: '#FFF3CD',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FFD966',
  },
  warningText: { fontSize: 13, color: '#856404', fontWeight: '500' },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 12,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.textDark,
    minHeight: 160,
    maxHeight: 280,
  },
  inputValid: { borderColor: '#4CAF50' },
  inputError: { borderColor: '#E05C5C' },
  validRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validText: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },
  errorText: { fontSize: 13, color: '#E05C5C' },
  successRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  successText: { fontSize: 14, color: '#4CAF50', fontWeight: '700' },
  footer: {
    padding: Spacing.lg,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  importBtn: {
    backgroundColor: Colors.pastelPink,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  importBtnDisabled: { backgroundColor: Colors.border },
  importBtnText: { ...Typography.label, color: Colors.white, fontSize: 15 },
});
