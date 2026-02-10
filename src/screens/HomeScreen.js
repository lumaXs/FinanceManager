/**
 * HomeScreen - Dashboard Principal
 * Tela com dashboard funcional mostrando saldo, receitas, despesas e gráficos
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

import { ScreenContainer } from '../components/ScreenContainer';
import { DashboardCard } from '../components/DashboardCard';
import { TransactionItem } from '../components/TransactionItem';
import { TransactionModal } from '../components/TransactionModal';
import { useTransactions } from '../hooks/useTransactions';
import { TRANSACTION_CATEGORIES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, getCurrentMonthTransactions, calculateByCategory } from '../utils/helpers';

const screenWidth = Dimensions.get('window').width;

export function HomeScreen() {
    const { theme, isDark, isLoading } = useTheme();

    const {
        transactions,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getMonthTotals,
        refresh,
    } = useTransactions();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

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
        text: '#000000',
        textSecondary: '#333333',
        textMuted: '#666666',
        primary: '#00D4FF',
        success: '#00C851',
        danger: '#FF4444',
    };

    const styles = getStyles(safeTheme);

    // Cálculos de totais
    const { income, expenses, balance } = getMonthTotals();

    // Transações recentes (últimas 5)
    const recentTransactions = transactions.slice(0, 5);

    // Dados para gráfico de pizza (gastos por categoria)
    const monthTransactions = getCurrentMonthTransactions(transactions);
    const expensesByCategory = calculateByCategory(
        monthTransactions.filter(t => t.type === 'expense'),
        [...TRANSACTION_CATEGORIES.EXPENSES]
    );

    // Preparar dados do gráfico de pizza
    const pieData = Object.entries(expensesByCategory).map(([id, data]) => ({
        name: data.name,
        amount: data.total,
        color: data.color,
        legendFontColor: safeTheme.text,
        legendFontSize: 12,
    }));

    // Dados para gráfico de linha (últimos 7 dias)
    const last7Days = transactions
        .slice(0, 7)
        .reverse()
        .map(t => {
            const date = new Date(t.date);
            return {
                day: `${date.getDate()}/${date.getMonth() + 1}`,
                amount: t.type === 'income' ? t.amount : -t.amount,
            };
        });

    const lineChartData = {
        labels: last7Days.map(d => d.day),
        datasets: [{
            data: last7Days.map(d => d.amount),
            color: (opacity = 1) => `rgba(0, 212, 255, ${opacity})`,
            strokeWidth: 2,
        }],
    };

    const handleAddTransaction = async (transactionData) => {
        try {
            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, transactionData);
            } else {
                await addTransaction(transactionData);
            }
            setModalVisible(false);
            setEditingTransaction(null);
        } catch (error) {
            console.error('Erro ao salvar transação:', error);
        }
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setModalVisible(true);
    };

    const handleDeleteTransaction = async (id) => {
        try {
            await deleteTransaction(id);
        } catch (error) {
            console.error('Erro ao deletar transação:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    };

    return (
        <ScreenContainer>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={safeTheme.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Olá! 👋</Text>
                        <Text style={styles.subtitle}>Suas finanças de hoje</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <FontAwesome5 name="bell" size={20} color={safeTheme.text} />
                    </TouchableOpacity>
                </View>

                {/* Cards de Resumo */}
                <View style={styles.cardsContainer}>
                    <DashboardCard
                        title="Saldo Total"
                        value={balance}
                        icon="wallet"
                        color={balance >= 0 ? safeTheme.primary : safeTheme.danger}
                    />
                    <DashboardCard
                        title="Receitas do Mês"
                        value={income}
                        icon="arrow-up"
                        color={safeTheme.success}
                    />
                    <DashboardCard
                        title="Despesas do Mês"
                        value={expenses}
                        icon="arrow-down"
                        color={safeTheme.danger}
                    />
                </View>

                {/* Gráfico de Linha - Últimos 7 dias */}
                {last7Days.length > 0 && (
                    <View style={styles.chartContainer}>
                        <Text style={styles.sectionTitle}>Movimentação (7 dias)</Text>
                        <LineChart
                            data={lineChartData}
                            width={screenWidth - 40}
                            height={180}
                            chartConfig={{
                                backgroundColor: safeTheme.backgroundCard,
                                backgroundGradientFrom: safeTheme.backgroundCard,
                                backgroundGradientTo: safeTheme.backgroundCard,
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(0, 212, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(170, 170, 170, ${opacity})`,
                                style: {
                                    borderRadius: 16,
                                },
                                propsForDots: {
                                    r: "4",
                                    strokeWidth: "2",
                                    stroke: safeTheme.primary,
                                },
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                )}

                {/* Gráfico de Pizza - Gastos por Categoria */}
                {pieData.length > 0 && (
                    <View style={styles.chartContainer}>
                        <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
                        <PieChart
                            data={pieData}
                            width={screenWidth - 40}
                            height={200}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            }}
                            accessor="amount"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </View>
                )}

                {/* Transações Recentes */}
                <View style={styles.recentContainer}>
                    <View style={styles.recentHeader}>
                        <Text style={styles.sectionTitle}>Transações Recentes</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllButton}>Ver todas</Text>
                        </TouchableOpacity>
                    </View>

                    {recentTransactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <FontAwesome5 name="inbox" size={48} color={safeTheme.textMuted} />
                            <Text style={styles.emptyText}>Nenhuma transação ainda</Text>
                            <Text style={styles.emptySubtext}>
                                Toque no botão + para adicionar sua primeira transação
                            </Text>
                        </View>
                    ) : (
                        recentTransactions.map((transaction) => (
                            <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                                onPress={() => handleEditTransaction(transaction)}
                                onLongPress={() => handleDeleteTransaction(transaction.id)}
                            />
                        ))
                    )}
                </View>

                {/* Espaçamento no final */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Botão Flutuante de Adicionar */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    setEditingTransaction(null);
                    setModalVisible(true);
                }}
                activeOpacity={0.8}
            >
                <FontAwesome5 name="plus" size={24} color={safeTheme.white || '#FFFFFF'} />
            </TouchableOpacity>

            {/* Modal de Adicionar/Editar Transação */}
            <TransactionModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditingTransaction(null);
                }}
                onSave={handleAddTransaction}
                transaction={editingTransaction}
            />
        </ScreenContainer>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 10,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.text,
    },
    subtitle: {
        fontSize: 14,
        color: theme.textSecondary,
        marginTop: 4,
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.backgroundCard,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardsContainer: {
        padding: 20,
        paddingTop: 0,
    },
    chartContainer: {
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 16,
    },
    chart: {
        borderRadius: 16,
    },
    recentContainer: {
        padding: 20,
        paddingTop: 0,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllButton: {
        color: theme.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.textSecondary,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.textMuted,
        marginTop: 8,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});

