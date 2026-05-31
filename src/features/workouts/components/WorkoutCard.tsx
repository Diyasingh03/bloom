import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Workout, AIWorkout, CyclePhase } from '../../../types';
import { Colors, Typography, Radius, PhaseThemes } from '../../../constants/theme';
import { Card } from '../../../components/Card';

type WorkoutData = Workout | (AIWorkout & { phase?: CyclePhase });

interface Props {
  workout: WorkoutData;
  onPress: () => void;
  featured?: boolean;
  isAI?: boolean;
}

const INTENSITY_COLOUR: Record<string, string> = {
  gentle: Colors.pastelMint,
  moderate: Colors.pastelYellow,
  high: Colors.pastelPeach,
  peak: Colors.pastelPink,
};

export function WorkoutCard({ workout, onPress, featured = false, isAI = false }: Props) {
  const phase = (workout as Workout).phase;
  const phaseColour = phase ? PhaseThemes[phase].primary : Colors.pastelPurple;
  const intensityColour = INTENSITY_COLOUR[workout.intensity] ?? Colors.pastelPurple;

  return (
    <Animated.View entering={FadeInUp.duration(400)}>
      <Card style={[styles.card, featured && styles.featuredCard]} padding={featured ? 20 : 16}>
        <View style={styles.header}>
          <View style={[styles.emojiCircle, { backgroundColor: phaseColour + '25' }, featured && styles.emojiCircleLarge]}>
            <Text style={[styles.emoji, featured && styles.emojiLarge]}>{workout.emoji}</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, featured && styles.nameLarge]} numberOfLines={2}>
              {workout.name}
            </Text>
            <View style={styles.tags}>
              <View style={[styles.tag, { backgroundColor: intensityColour + '80' }]}>
                <Text style={styles.tagText}>{workout.intensity}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>⏱ {workout.durationMinutes}m</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{workout.type}</Text>
              </View>
              {isAI && (
                <View style={[styles.tag, { backgroundColor: Colors.pastelPurple + '80' }]}>
                  <Text style={styles.tagText}>✨ AI</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={featured ? 3 : 2}>
          {workout.benefits}
        </Text>

        <TouchableOpacity style={[styles.startBtn, { backgroundColor: phaseColour }]} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.startBtnText}>Start workout →</Text>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 12 },
  featuredCard: { borderWidth: 0, shadowOpacity: 0.12, shadowRadius: 16 },
  header: { flexDirection: 'row', gap: 12, marginBottom: 10, alignItems: 'flex-start' },
  emojiCircle: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  emojiCircleLarge: { width: 60, height: 60, borderRadius: 18 },
  emoji: { fontSize: 24 },
  emojiLarge: { fontSize: 28 },
  info: { flex: 1, gap: 6 },
  name: { ...Typography.heading3, fontSize: 15 },
  nameLarge: { fontSize: 17 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.border },
  tagText: { fontSize: 11, fontWeight: '500', color: Colors.textDark },
  description: { ...Typography.body, fontSize: 13, marginBottom: 14, lineHeight: 19 },
  startBtn: { paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  startBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },
});
