import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CyclePhase } from '../types';
import { PhaseThemes } from '../constants/theme';

interface Props {
  phase: CyclePhase;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function PhaseGradient({ phase, style, children }: Props) {
  const gradient = PhaseThemes[phase].gradient;
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.base, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
});
