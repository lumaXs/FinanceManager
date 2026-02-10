import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { ScreenContainer } from '../components/ScreenContainer.js';
import { TransactionItem } from '../components/TransactionItem.js';
import { TransactionModal } from '../components/TransactionModal';
import { useTransactions } from '../hooks/useTransactions';
import { TRANSACTION_TYPES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, groupBy } from '../utils/helpers';

export function TransactionsScreen() {
    const { theme, isLoading } = useTheme();

    if (isLoading) return null;

    // Garante que theme sempre exista
    const safeTheme = theme || {
        background: '#fff',
        backgroundCard: '#f0f0f0',
        text: '#000',
        textSecondary: '#555',
        textMuted: '#888',
        primary: '#007AFF',
        success: '#28a745',
        danger: '#dc3545',
        white: '#fff',
        cardBorder: '#ddd',
    };

    // Gerar styles só quando theme estiver definido
    const styles = useMemo(() => getStyles(safeTheme), [safeTheme]);

    const {
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        searchTransactions,
        getTransactionsByType,
        getTotals,
    } = useTransactions();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    const getFilteredTransactions = () => {
        let filtered = transactions;

        if (filterType === 'income') filtered = getTransactionsByType(TRANSACTION_TYPES.INCOME);
        else if (filterType === 'expense') filtered = getTransactionsByType(TRANSACTION_TYPES.EXPENSE);

        if (searchQuery.trim()) filtered = searchTransactions(searchQuery);

        return filtered;
    };

    const filteredTransactions = getFilteredTransactions();

    const groupedTransactions = groupBy(filteredTransactions, (t) =>
        new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    );

    const totals = getTotals();

    const handleSaveTransaction = async (transactionData) => {
        try {
            if (editingTransaction) await updateTransaction(editingTransaction.id, transactionData);
            else await addTransaction(transactionData);
            setModalVisible(false);
            setEditingTransaction(null);
        } catch (error) {
            console.error('Erro ao salvar transação:', error);
            Alert.alert('Erro', 'Não foi possível salvar a transação');
        }
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setModalVisible(true);
    };

    const handleDeleteTransaction = (transaction) => {
        Alert.alert(
            'Excluir Transação',
            `Tem certeza que deseja excluir "${transaction.description}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTransaction(transaction.id);
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir a transação');
                        }
                    },
                },
            ]
        );
    };

    const renderFilterButton = (type, label, icon) => (
        <TouchableOpacity
            style={[styles.filterButton, filterType === type && styles.filterButtonActive]}
            onPress={() => setFilterType(type)}
        >
            <FontAwesome5
                name={icon}
                size={14}
                color={filterType === type ? safeTheme.white : safeTheme.textSecondary}
            />
            <Text style={[styles.filterButtonText, filterType === type && styles.filterButtonTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <View style={styles.container}>
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Transações</Text>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Receitas</Text>
                                <Text style={[styles.summaryValue, { color: safeTheme.success }]}>
                                    {formatCurrency(totals.income)}
                                </Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Despesas</Text>
                                <Text style={[styles.summaryValue, { color: safeTheme.danger }]}>
                                    {formatCurrency(totals.expenses)}
                                </Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Saldo</Text>
                                <Text style={[styles.summaryValue, { color: totals.balance >= 0 ? safeTheme.primary : safeTheme.danger }]}>
                                    {formatCurrency(totals.balance)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Busca */}
                    <View style={styles.searchContainer}>
                        <FontAwesome5 name="search" size={16} color={safeTheme.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar transações..."
                            placeholderTextColor={safeTheme.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <FontAwesome5 name="times-circle" size={16} color={safeTheme.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filtros */}
                    <View style={styles.filterContainer}>
                        {renderFilterButton('all', 'Todas', 'list')}
                        {renderFilterButton('income', 'Receitas', 'arrow-up')}
                        {renderFilterButton('expense', 'Despesas', 'arrow-down')}
                    </View>
                </View>

                {/* Lista */}
                {filteredTransactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="inbox" size={64} color={safeTheme.textMuted} />
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'Nenhuma transação encontrada' : 'Nenhuma transação ainda'}
                        </Text>
                        {!searchQuery && (
                            <Text style={styles.emptySubtext}>Toque no botão + para adicionar sua primeira transação</Text>
                        )}
                    </View>
                ) : (
                    <FlatList
                        data={filteredTransactions}
                        renderItem={({ item }) => (
                            <TransactionItem
                                transaction={item}
                                onPress={() => handleEditTransaction(item)}
                                onLongPress={() => handleDeleteTransaction(item)}
                            />
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Botão flutuante */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => {
                        setEditingTransaction(null);
                        setModalVisible(true);
                    }}
                    activeOpacity={0.8}
                >
                    <FontAwesome5 name="plus" size={24} color={safeTheme.white} />
                </TouchableOpacity>

                {/* Modal */}
                <TransactionModal
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setEditingTransaction(null);
                    }}
                    onSave={handleSaveTransaction}
                    transaction={editingTransaction}
                />
            </View>
        </ScreenContainer>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        container: { flex: 1 },
        header: { padding: 20, backgroundColor: theme.background },
        titleContainer: { marginBottom: 20 },
        title: { fontSize: 28, fontWeight: '700', color: theme.text, marginBottom: 16 },
        summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        summaryItem: { flex: 1, alignItems: 'center' },
        summaryDivider: { width: 1, height: 32, backgroundColor: theme.cardBorder },
        summaryLabel: { fontSize: 12, color: theme.textSecondary, marginBottom: 4 },
        summaryValue: { fontSize: 16, fontWeight: '700' },
        searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.backgroundCard, borderRadius: 12, padding: 12, marginBottom: 16, gap: 10 },
        searchInput: { flex: 1, fontSize: 16, color: theme.text },
        filterContainer: { flexDirection: 'row', gap: 8 },
        filterButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, backgroundColor: theme.backgroundCard, gap: 6 },
        filterButtonActive: { backgroundColor: theme.primary },
        filterButtonText: { fontSize: 14, fontWeight: '600', color: theme.textSecondary },
        filterButtonTextActive: { color: theme.white },
        listContent: { padding: 20, paddingBottom: 100 },
        sectionHeader: { paddingVertical: 8, paddingHorizontal: 20, backgroundColor: theme.background },
        sectionHeaderText: { fontSize: 14, fontWeight: '600', color: theme.textSecondary, textTransform: 'uppercase' },
        emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
        emptyText: { fontSize: 18, fontWeight: '600', color: theme.textSecondary, marginTop: 16, textAlign: 'center' },
        emptySubtext: { fontSize: 14, color: theme.textMuted, marginTop: 8, textAlign: 'center' },
        fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
    });
