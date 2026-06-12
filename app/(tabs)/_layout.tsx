import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Text } from 'react-native';
import { Colors } from '../../src/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, emoji, color, size }: { name: IoniconsName; emoji: string; color: string; size: number }) {
  if (Platform.OS === 'web') {
    return <Text style={{ fontSize: 20, color, lineHeight: 26, textAlign: 'center' }}>{emoji}</Text>;
  }
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 0.5,
          height: 84,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.pastelPink,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" emoji="🏠" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cycle"
        options={{
          title: 'Cycle',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="radio-button-on" emoji="🌙" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: 'Meals',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="restaurant" emoji="🍽️" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Move',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="barbell" emoji="🏃‍♀️" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="groceries"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="basket" emoji="🧺" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: 'Track',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="heart" emoji="💜" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
