import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Cycle } from '../../../types';
import { Colors, Typography, Radius } from '../../../constants/theme';
import { format, parseISO } from 'date-fns';

interface Props {
  cycles: Cycle[];
}

function CycleRow({ cycle, index }: { cycle: Cycle; index: number }) {
  return (
    <View style={styles.row}>
      <View style={styles.indexBubble}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.dateRange}>
          {format(parseISO(cycle.start_date), 'd MMM yyyy')} → {format(parseISO(cycle.end_date), 'd MMM')}
        </Text>
        <View style={styles.chips}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{cycle.cycle_length}d cycle</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{cycle.period_length}d period</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function CycleHistoryList({ cycles }: Props) {
  const sorted = [...cycles].sort(
    (a, b) => parseISO(b.start_date).getTime() - parseISO(a.start_date).getTime()
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Cycle History</Text>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.start_date}
        renderItem={({ item, index }) => <CycleRow cycle={item} index={index} />}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16 },
  sectionTitle: { ...Typography.heading3, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  indexBubble: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.pastelPink + '30', alignItems: 'center', justifyContent: 'center' },
  indexText: { fontSize: 13, fontWeight: '600', color: Colors.pastelPink },
  info: { flex: 1, gap: 4 },
  dateRange: { ...Typography.bodyBold, fontSize: 14 },
  chips: { flexDirection: 'row', gap: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: Colors.border, borderRadius: Radius.full },
  chipText: { ...Typography.caption, color: Colors.textMuted },
  separator: { height: 1, backgroundColor: Colors.border },
});
