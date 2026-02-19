import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'neutral', size = 'md' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], size === 'sm' && styles.sm]}>
      <Text style={[styles.text, styles[`${variant}Text`], size === 'sm' && styles.smText]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: 8, paddingVertical: 2 },
  text: { fontSize: 12, fontWeight: '600' },
  smText: { fontSize: 10 },

  success: { backgroundColor: COLORS.successLight },
  warning: { backgroundColor: COLORS.warningLight },
  danger: { backgroundColor: COLORS.dangerLight },
  info: { backgroundColor: COLORS.infoLight },
  neutral: { backgroundColor: COLORS.border },

  successText: { color: '#15803d' },
  warningText: { color: COLORS.primaryDark },
  dangerText: { color: '#b91c1c' },
  infoText: { color: '#1d4ed8' },
  neutralText: { color: COLORS.textMuted },
});
