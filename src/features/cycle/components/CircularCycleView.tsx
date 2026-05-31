import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { CyclePhase } from '../../../types';
import { PhaseThemes, Colors, Typography } from '../../../constants/theme';

interface Props {
  cycleDay: number;
  cycleLength: number;
  phase: CyclePhase;
}

const SIZE = 260;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 100;
const STROKE = 22;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  if (endAngle - startAngle >= 360) endAngle = startAngle + 359.99;
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

interface PhaseArc {
  phase: CyclePhase;
  startDay: number;
  endDay: number;
}

function getPhaseArcs(cycleLength: number): PhaseArc[] {
  const lutealStart = Math.max(17, cycleLength - 14);
  return [
    { phase: 'menstrual', startDay: 1, endDay: 5 },
    { phase: 'follicular', startDay: 6, endDay: 13 },
    { phase: 'ovulatory', startDay: 14, endDay: lutealStart - 1 },
    { phase: 'luteal', startDay: lutealStart, endDay: cycleLength },
  ];
}

export function CircularCycleView({ cycleDay, cycleLength, phase }: Props) {
  const arcs = getPhaseArcs(cycleLength);
  const dayAngle = ((cycleDay - 1) / cycleLength) * 360;
  const dotPos = polarToCartesian(CX, CY, R, dayAngle);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        {/* Background track */}
        <Circle
          cx={CX}
          cy={CY}
          r={R}
          stroke={Colors.border}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Phase arcs */}
        {arcs.map(({ phase: p, startDay, endDay }) => {
          const startAngle = ((startDay - 1) / cycleLength) * 360;
          const endAngle = (endDay / cycleLength) * 360;
          const pathD = describeArc(CX, CY, R, startAngle, endAngle);
          return (
            <Path
              key={p}
              d={pathD}
              stroke={PhaseThemes[p].primary}
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
            />
          );
        })}
        {/* Current day indicator dot */}
        <Circle
          cx={dotPos.x}
          cy={dotPos.y}
          r={10}
          fill={Colors.white}
          stroke={PhaseThemes[phase].primary}
          strokeWidth={3}
        />
      </Svg>
      {/* Centre text */}
      <View style={styles.centre} pointerEvents="none">
        <Text style={styles.centreEmoji}>{PhaseThemes[phase].emoji}</Text>
        <Text style={styles.centreDay}>Day {cycleDay}</Text>
        <Text style={styles.centrePhase}>{PhaseThemes[phase].label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centre: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centreEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  centreDay: {
    ...Typography.heading2,
    fontSize: 24,
  },
  centrePhase: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
