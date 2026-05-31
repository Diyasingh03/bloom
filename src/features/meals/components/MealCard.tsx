import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, FadeInRight } from 'react-native-reanimated';
import { Meal, AIMeal } from '../../../types';
import { Colors, Typography, Radius, PhaseThemes } from '../../../constants/theme';
import { Card } from '../../../components/Card';

type MealData = Meal | (AIMeal & { type?: string; phases?: never; glycemicLoad?: never; cookMethod?: never });

interface Props {
  meal: MealData;
  isAI?: boolean;
}

export function MealCard({ meal, isAI = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  const typeLabel = (meal as Meal).type;
  const phases = (meal as Meal).phases;
  const cookMethod = (meal as Meal).cookMethod;

  const typeColour = (() => {
    if (typeLabel === 'breakfast') return Colors.pastelYellow;
    if (typeLabel === 'lunch') return Colors.pastelMint;
    if (typeLabel === 'dinner') return Colors.pastelPeach;
    return Colors.pastelPurple;
  })();

  return (
    <Animated.View entering={FadeInRight.duration(400)}>
      <Card style={styles.card} padding={16}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.emojiCircle, { backgroundColor: typeColour + '50' }]}>
            <Text style={styles.emoji}>{meal.emoji}</Text>
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.name} numberOfLines={2}>{meal.name}</Text>
            <View style={styles.tags}>
              {typeLabel && (
                <View style={[styles.tag, { backgroundColor: typeColour + '60' }]}>
                  <Text style={styles.tagText}>{typeLabel}</Text>
                </View>
              )}
              {isAI && (
                <View style={[styles.tag, { backgroundColor: Colors.pastelPurple + '80' }]}>
                  <Text style={styles.tagText}>✨ AI</Text>
                </View>
              )}
              {cookMethod && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {cookMethod === 'no-cook' ? '🥗 no-cook' : cookMethod === 'microwave' ? '📡 microwave' : '🍳 stovetop'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.prepBadge}>
            <Text style={styles.prepTime}>{meal.prepTime}m</Text>
          </View>
        </View>

        {/* PCOS note */}
        <Text style={styles.pcosNote}>{meal.pcosNote}</Text>

        {/* Ingredient toggle */}
        <TouchableOpacity style={styles.toggleRow} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
          <Text style={styles.toggleText}>{expanded ? '▲ Hide ingredients' : '▼ Show ingredients'}</Text>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.ingredients}>
            {meal.ingredients.map((ing, i) => (
              <View key={i} style={styles.ingRow}>
                <Text style={styles.ingDot}>•</Text>
                <Text style={styles.ingText}>{ing}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 12 },
  header: { flexDirection: 'row', gap: 12, marginBottom: 10, alignItems: 'flex-start' },
  emojiCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 },
  titleSection: { flex: 1, gap: 6 },
  name: { ...Typography.heading3, fontSize: 15 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.border },
  tagText: { fontSize: 11, fontWeight: '500', color: Colors.textDark },
  prepBadge: { alignItems: 'center', justifyContent: 'center' },
  prepTime: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  pcosNote: { ...Typography.body, fontSize: 13, fontStyle: 'italic', marginBottom: 10, lineHeight: 19 },
  toggleRow: { paddingVertical: 4 },
  toggleText: { fontSize: 12, fontWeight: '500', color: Colors.pastelPink },
  ingredients: { marginTop: 8, gap: 5 },
  ingRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  ingDot: { color: Colors.pastelPink, fontWeight: '700', marginTop: 1 },
  ingText: { ...Typography.body, fontSize: 13, flex: 1 },
});
