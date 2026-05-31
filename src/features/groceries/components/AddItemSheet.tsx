import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { GroceryCategory } from '../../../types';
import { Colors, Typography, Radius } from '../../../constants/theme';

const CATEGORIES: Array<{ value: GroceryCategory; label: string; emoji: string }> = [
  { value: 'produce', label: 'Produce', emoji: '🥬' },
  { value: 'protein', label: 'Protein', emoji: '🥩' },
  { value: 'dairy', label: 'Dairy', emoji: '🥛' },
  { value: 'pantry', label: 'Pantry', emoji: '🫙' },
  { value: 'other', label: 'Other', emoji: '📦' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, category: GroceryCategory, quantity?: string) => void;
}

export function AddItemSheet({ visible, onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GroceryCategory>('other');
  const [quantity, setQuantity] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), category, quantity.trim() || undefined);
    setName('');
    setQuantity('');
    setCategory('other');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Add item</Text>

          <Text style={styles.inputLabel}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Greek yogurt"
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />

          <Text style={styles.inputLabel}>Quantity (optional)</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g. 2 cartons"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.catRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.value}
                style={[styles.catChip, category === c.value && styles.catChipActive]}
                onPress={() => setCategory(c.value)}
              >
                <Text style={styles.catEmoji}>{c.emoji}</Text>
                <Text style={[styles.catLabel, category === c.value && styles.catLabelActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, !name.trim() && styles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={!name.trim()}
            >
              <Text style={styles.addBtnText}>Add item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 44 },
  title: { ...Typography.heading2, marginBottom: 20 },
  inputLabel: { ...Typography.label, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 15, color: Colors.textDark, marginBottom: 14 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border },
  catChipActive: { backgroundColor: Colors.pastelPink, borderColor: Colors.pastelPink },
  catEmoji: { fontSize: 13 },
  catLabel: { fontSize: 13, fontWeight: '500', color: Colors.textMuted },
  catLabelActive: { color: Colors.white },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  cancelText: { ...Typography.label },
  addBtn: { flex: 1, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.pastelPink, alignItems: 'center' },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { ...Typography.label, color: Colors.white },
});
