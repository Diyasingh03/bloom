import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GroceryItem as GroceryItemType } from '../../../types';
import { Colors, Typography, Radius } from '../../../constants/theme';

interface Props {
  item: GroceryItemType;
  onToggle: () => void;
  onDelete: () => void;
}

export function GroceryItemRow({ item, onToggle, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={onToggle}
        style={[styles.checkbox, item.inStock && styles.checkboxFilled]}
        activeOpacity={0.7}
      >
        {item.inStock && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={[styles.name, !item.inStock && styles.nameMuted]}>{item.name}</Text>
        {item.quantity && <Text style={styles.quantity}>{item.quantity}</Text>}
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxFilled: { backgroundColor: Colors.pastelPink, borderColor: Colors.pastelPink },
  checkmark: { fontSize: 13, fontWeight: '700', color: Colors.white },
  info: { flex: 1 },
  name: { ...Typography.bodyBold, fontSize: 15 },
  nameMuted: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  quantity: { ...Typography.caption, marginTop: 2 },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 13, color: Colors.textMuted },
});
