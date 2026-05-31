import { CyclePhase, PhaseTheme } from '../types';

export const Colors = {
  white: '#FFFFFF',
  pastelPink: '#FFB3C6',
  pastelYellow: '#FFF3B0',
  pastelPeach: '#FFD6B3',
  pastelPurple: '#DCC8F0',
  pastelMint: '#C8F0DC',
  pastelLavender: '#E8D5F7',

  textDark: '#3D2C35',
  textMuted: '#9B8B92',
  border: '#F0E4EC',
  shadow: 'rgba(61,44,53,0.07)',

  // Solid phase colours for icons and accents
  menstrual: '#F4A7BB',
  follicular: '#D4C84A',
  ovulatory: '#F5B87A',
  luteal: '#B89AD4',
} as const;

export const PhaseThemes: Record<CyclePhase, PhaseTheme> = {
  menstrual: {
    primary: '#F4A7BB',
    secondary: '#FFD6E3',
    gradient: ['#FFE8EE', '#FFFFFF'],
    label: 'Menstrual',
    emoji: '🌸',
    insight:
      'Your body is shedding and renewing. Rest is productive. Warm foods, iron-rich ingredients, and gentle movement are your allies right now.',
  },
  follicular: {
    primary: '#C8B830',
    secondary: '#FFF9C0',
    gradient: ['#FFFDE0', '#FFFFFF'],
    label: 'Follicular',
    emoji: '🌿',
    insight:
      'Oestrogen is rising and so is your energy. This is a natural window for new goals, higher-intensity movement, and fresh starts.',
  },
  ovulatory: {
    primary: '#F5A056',
    secondary: '#FFE5C8',
    gradient: ['#FFF3E8', '#FFFFFF'],
    label: 'Ovulatory',
    emoji: '✨',
    insight:
      'Peak energy, confidence, and focus. Leverage this window for intense workouts — your body is primed for performance right now.',
  },
  luteal: {
    primary: '#A87CC8',
    secondary: '#E8D5F7',
    gradient: ['#F0E4FF', '#FFFFFF'],
    label: 'Luteal',
    emoji: '🌙',
    insight:
      'Progesterone rises through this phase. Cravings are real and valid — reach for magnesium-rich foods and wind down intensity gradually.',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 16,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const Typography = {
  heading1: { fontSize: 28, fontWeight: '700' as const, color: Colors.textDark, letterSpacing: -0.5 },
  heading2: { fontSize: 22, fontWeight: '600' as const, color: Colors.textDark, letterSpacing: -0.3 },
  heading3: { fontSize: 17, fontWeight: '600' as const, color: Colors.textDark },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.textMuted, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, color: Colors.textDark },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.textMuted },
  label: { fontSize: 13, fontWeight: '500' as const, color: Colors.textDark },
  tab: { fontSize: 11, fontWeight: '500' as const },
} as const;
