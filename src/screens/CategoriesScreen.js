/**
 * CategoriesScreen - Gerenciamento de Categorias
 * Tela para visualizar e criar categorias personalizadas
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { ScreenContainer } from '../components/ScreenContainer';
import { TRANSACTION_CATEGORIES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency, calculateByCategory, getCurrentMonthTransactions } from '../utils/helpers';

export function CategoriesScreen() {
    const { theme, isLoading } = useTheme();
    const { transactions } = useTransactions();
    const [showAddModal, setShowAddModal] = useState(false);

    // Aguardar carregamento do tema
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00D4FF" />
            </View>
        );
    }

    // Garantir que theme existe
    const safeTheme = theme || {
        background: '#FFFFFF',
        backgroundCard: '#F5F5F5',
        backgroundModal: '#FFFFFF',
        text: '#000000',
        textSecondary: '#333333',
        textMuted: '#666666',
        primary: '#00D4FF',
        success: '#00C851',
        danger: '#FF4444',
        white: '#FFFFFF',
        overlay: 'rgba(0,0,0,0.5)',
    };

    const styles = getStyles(safeTheme);

    // Calcular gastos por categoria do mês atual
    const monthTransactions = getCurrentMonthTransactions(transactions);
    const expensesByCategory = calculateByCategory(
        monthTransactions.filter(t => t.type === 'expense'),
        TRANSACTION_CATEGORIES.EXPENSES
    );
    const incomeByCategory = calculateByCategory(
        monthTransactions.filter(t => t.type === 'income'),
        TRANSACTION_CATEGORIES.INCOME
    );

    const renderCategoryItem = (category, amount = 0) => {
        const total = amount || 0;
        const percentage = total > 0 ? Math.min((total / 5000) * 100, 100) : 0; // Mock max

        return (
            <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                activeOpacity={0.7}
            >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <FontAwesome5 name={category.icon} size={20} color={category.color} />
                </View>

                <View style={styles.categoryInfo}>
                    <View style={styles.categoryHeader}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryAmount}>{formatCurrency(total)}</Text>
                    </View>

                    {total > 0 && (
                        <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                    styles.progressBar,
                                    {
                                        width: `${percentage}%`,
                                        backgroundColor: category.color,
                                    },
                                ]}
                            />
                        </View>
                    )}
                </View>

                <FontAwesome5 name="chevron-right" size={16} color={safeTheme.textMuted} />
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Categorias</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddModal(true)}
                    >
                        <FontAwesome5 name="plus" size={16} color={safeTheme.white} />
                        <Text style={styles.addButtonText}>Nova</Text>
                    </TouchableOpacity>
                </View>

                {/* Despesas */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FontAwesome5 name="arrow-down" size={16} color={safeTheme.danger} />
                        <Text style={styles.sectionTitle}>Despesas</Text>
                    </View>

                    {TRANSACTION_CATEGORIES.EXPENSES.map((category) =>
                        renderCategoryItem(
                            category,
                            expensesByCategory[category.id]?.total || 0
                        )
                    )}
                </View>

                {/* Receitas */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FontAwesome5 name="arrow-up" size={16} color={safeTheme.success} />
                        <Text style={styles.sectionTitle}>Receitas</Text>
                    </View>

                    {TRANSACTION_CATEGORIES.INCOME.map((category) =>
                        renderCategoryItem(
                            category,
                            incomeByCategory[category.id]?.total || 0
                        )
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Modal de Adicionar Categoria */}
            <Modal
                visible={showAddModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nova Categoria</Text>
                        <Text style={styles.modalSubtitle}>
                            Em breve você poderá criar categorias personalizadas!
                        </Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowAddModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Ok, entendi</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.text,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    addButtonText: {
        color: theme.white,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    section: {
        padding: 20,
        paddingTop: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.text,
        marginLeft: 8,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.backgroundCard,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    categoryIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryInfo: { flex: 1, marginRight: 12 },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
    },
    categoryAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.text,
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: theme.background,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: theme.backgroundModal,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: theme.textSecondary,
        marginBottom: 20,
        lineHeight: 20,
    },
    modalButton: {
        backgroundColor: theme.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonText: {
        color: theme.white,
        fontSize: 16,
        fontWeight: '700',
    },
});

