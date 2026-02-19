import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
  large?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = COLORS.primary,
  bgColor = COLORS.primaryLight,
  large = false,
}: StatCardProps) {
  return (
    <View style={[styles.card, large && styles.largeCard]}>
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            {icon}
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={[styles.value, { color }, large && styles.largeValue]}>
        {value}
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  largeCard: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  largeValue: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
});
