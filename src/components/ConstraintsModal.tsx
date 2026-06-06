import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, Switch, TouchableOpacity, ScrollView,
  TextInput, StyleSheet, SafeAreaView, Platform,
} from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../constants/theme';
import { UserConstraints } from '../types';
import { DEFAULT_CONSTRAINTS, EQUIPMENT_OPTIONS } from '../lib/defaultConstraints';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  constraints: UserConstraints;
  onSave: (c: UserConstraints) => Promise<void>;
  onRegenerate: () => Promise<void>;
}

type ApplianceKey = keyof UserConstraints['cookingAppliances'];

const APPLIANCE_LABELS: Record<ApplianceKey, string> = {
  stovetop: 'Stovetop',
  microwave: 'Microwave',
  oven: 'Oven',
  airFryer: 'Air fryer',
};

export function ConstraintsModal({ visible, onClose, constraints, onSave, onRegenerate }: Props) {
  const [draft, setDraft] = useState<UserConstraints>(constraints);
  const [saving, setSaving] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  useEffect(() => {
    if (visible) setDraft(constraints);
  }, [visible, constraints]);

  const toggleAppliance = (key: ApplianceKey) => {
    setDraft(d => ({
      ...d,
      cookingAppliances: { ...d.cookingAppliances, [key]: !d.cookingAppliances[key] },
    }));
  };

  const toggleEquipment = (item: string) => {
    setDraft(d => ({
      ...d,
      equipment: d.equipment.includes(item)
        ? d.equipment.filter(e => e !== item)
        : [...d.equipment, item],
    }));
  };

  const handleReset = () => setDraft(DEFAULT_CONSTRAINTS);

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    await onRegenerate();
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Constraints</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.note}>
            These are used to personalise your daily AI plan. Changes take effect immediately.
          </Text>

          {/* Cooking */}
          <Text style={styles.sectionTitle}>Cooking Appliances</Text>
          <View style={styles.card}>
            {(Object.keys(APPLIANCE_LABELS) as ApplianceKey[]).map((key, i, arr) => (
              <View
                key={key}
                style={[styles.toggleRow, i < arr.length - 1 && styles.toggleRowBorder]}
              >
                <Text style={styles.toggleLabel}>{APPLIANCE_LABELS[key]}</Text>
                <Switch
                  value={draft.cookingAppliances[key]}
                  onValueChange={() => toggleAppliance(key)}
                  trackColor={{ false: Colors.border, true: Colors.pastelPink }}
                  thumbColor={Colors.white}
                />
              </View>
            ))}
          </View>

          {/* Equipment */}
          <Text style={styles.sectionTitle}>Workout Equipment</Text>
          <View style={styles.chipsWrap}>
            {EQUIPMENT_OPTIONS.map(item => {
              const selected = draft.equipment.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => toggleEquipment(item)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {selected ? '✓ ' : ''}{item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Dietary notes */}
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <TextInput
            style={styles.textArea}
            value={draft.dietaryNotes}
            onChangeText={text => setDraft(d => ({ ...d, dietaryNotes: text }))}
            multiline
            textAlignVertical="top"
            placeholder="Describe your dietary preferences, restrictions, or notes for the AI…"
            placeholderTextColor={Colors.textMuted}
          />

          <View style={styles.bottomLinks}>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetBtnText}>Reset to my defaults</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPrivacyVisible(true)}>
              <Text style={styles.privacyLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <PrivacyPolicyModal visible={privacyVisible} onClose={() => setPrivacyVisible(false)} />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving…' : 'Save & refresh plan'}
            </Text>
          </TouchableOpacity>
        </View>
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
  content: { padding: Spacing.lg, paddingBottom: 8, gap: 12 },
  note: { ...Typography.body, fontSize: 13, color: Colors.textMuted, lineHeight: 19 },
  sectionTitle: { ...Typography.heading3, marginTop: 8 },
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  toggleRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  toggleLabel: { ...Typography.body, fontSize: 15, color: Colors.textDark },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipSelected: {
    borderColor: Colors.pastelPink,
    backgroundColor: Colors.pastelPink + '20',
  },
  chipText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  chipTextSelected: { color: Colors.textDark },
  textArea: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 12,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
    color: Colors.textDark,
    minHeight: 100,
    lineHeight: 20,
  },
  bottomLinks: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  resetBtnText: { fontSize: 13, color: Colors.textMuted, textDecorationLine: 'underline' },
  privacyLinkText: { fontSize: 13, color: Colors.textMuted, textDecorationLine: 'underline' },
  footer: {
    padding: Spacing.lg,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.pastelPink,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: Colors.border },
  saveBtnText: { ...Typography.label, color: Colors.white, fontSize: 15 },
});
