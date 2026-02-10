/**
 * Componente TransactionItem
 * Item de transação na lista com animações e categorias
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { TRANSACTION_CATEGORIES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, getRelativeDate } from '../utils/helpers';

export const TransactionItem = ({
    transaction,
    onPress,
    onLongPress,
    categories = []
}) => {
    const { theme } = useTheme();

    // Garantir que theme existe
    const safeTheme = theme || {
        backgroundCard: '#F5F5F5',
        text: '#000000',
        textSecondary: '#333333',
        textMuted: '#666666',
        success: '#00C851',
        danger: '#FF4444',
        warning: '#FFBB33',
    };

    // Encontra a categoria da transação
    const allCategories = [
        ...TRANSACTION_CATEGORIES.EXPENSES,
        ...TRANSACTION_CATEGORIES.INCOME,
        ...categories,
    ];

    const category = allCategories.find(c => c.id === transaction.category);

    const isIncome = transaction.type === 'income';
    const amountColor = isIncome ? safeTheme.success : safeTheme.danger;
    const borderColor = category?.color || (isIncome ? safeTheme.success : safeTheme.danger);

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: safeTheme.backgroundCard, borderLeftColor: borderColor }]}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            {/* Ícone da categoria */}
            <View style={[styles.iconContainer, { backgroundColor: borderColor + '20' }]}>
                <FontAwesome5
                    name={category?.icon || 'circle'}
                    size={20}
                    color={borderColor}
                />
            </View>

            {/* Informações da transação */}
            <View style={styles.infoContainer}>
                <Text style={[styles.description, { color: safeTheme.text }]} numberOfLines={1}>
                    {transaction.description}
                </Text>

                <View style={styles.metaContainer}>
                    {category && (
                        <Text style={[styles.category, { color: safeTheme.textSecondary }]}>{category.name}</Text>
                    )}
                    <Text style={[styles.date, { color: safeTheme.textMuted }]}>• {getRelativeDate(transaction.date)}</Text>
                </View>

                {transaction.notes && (
                    <Text style={[styles.notes, { color: safeTheme.textMuted }]} numberOfLines={1}>
                        {transaction.notes}
                    </Text>
                )}
            </View>

            {/* Valor */}
            <View style={styles.amountContainer}>
                <Text style={[styles.amount, { color: amountColor }]}>
                    {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                </Text>

                {!transaction.isPaid && (
                    <View style={[styles.unpaidBadge, { backgroundColor: safeTheme.warning + '30' }]}>
                        <Text style={[styles.unpaidText, { color: safeTheme.warning }]}>Pendente</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
        marginRight: 12,
    },
    description: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    category: {
        fontSize: 12,
        fontWeight: '500',
    },
    date: {
        fontSize: 12,
        marginLeft: 4,
    },
    notes: {
        fontSize: 11,
        fontStyle: 'italic',
        marginTop: 2,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    unpaidBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    unpaidText: {
        fontSize: 10,
        fontWeight: '600',
    },
});

