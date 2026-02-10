/**
 * Componente DashboardCard
 * Card de estatísticas do dashboard
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/helpers';

export const DashboardCard = ({ title, value, icon, color, trend }) => {
    const { theme } = useTheme();

    // Garantir que theme existe
    const safeTheme = theme || {
        backgroundCard: '#F5F5F5',
        text: '#000000',
        textSecondary: '#333333',
        success: '#00C851',
        danger: '#FF4444',
    };

    return (
        <View style={[styles.card, { backgroundColor: safeTheme.backgroundCard, borderLeftColor: color }]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                    <FontAwesome5 name={icon} size={20} color={color} />
                </View>
                <Text style={[styles.title, { color: safeTheme.textSecondary }]}>{title}</Text>
            </View>

            <Text style={[styles.value, { color: safeTheme.text }]}>{formatCurrency(value)}</Text>

            {trend && (
                <View style={styles.trendContainer}>
                    <FontAwesome5
                        name={trend.isPositive ? 'arrow-up' : 'arrow-down'}
                        size={12}
                        color={trend.isPositive ? safeTheme.success : safeTheme.danger}
                    />
                    <Text
                        style={[
                            styles.trendText,
                            { color: trend.isPositive ? safeTheme.success : safeTheme.danger },
                        ]}
                    >
                        {trend.percentage}% vs mês anterior
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
    value: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        fontSize: 12,
        marginLeft: 6,
        fontWeight: '600',
    },
});

