/**
 * TransactionModal - Modal para criar/editar transações
 * CORRIGIDO: Sem loops, sem pisca-pisca
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TRANSACTION_TYPES, TRANSACTION_CATEGORIES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/helpers';

export const TransactionModal = ({
    visible,
    onClose,
    onSave,
    transaction = null,
    customCategories = [],
}) => {
    const { theme } = useTheme();

    const safeTheme = theme || {
        background: '#0A0A0A',
        backgroundCard: '#141414',
        backgroundModal: '#1A1A1A',
        text: '#EEEEEE',
        textSecondary: '#AAAAAA',
        textMuted: '#666666',
        primary: '#00D4FF',
        success: '#00FF88',
        danger: '#FF4444',
        warning: '#FFB800',
        white: '#FFFFFF',
        overlay: 'rgba(0,0,0,0.7)',
        cardBorder: '#333333',
    };

    // ✅ CORREÇÃO 1: useMemo para evitar recriação de estilos
    const styles = useMemo(() => getStyles(safeTheme), [safeTheme]);

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('0,00');
    const [type, setType] = useState(TRANSACTION_TYPES.EXPENSE);
    const [category, setCategory] = useState(null);
    const [date, setDate] = useState(new Date());
    const [notes, setNotes] = useState('');
    const [isPaid, setIsPaid] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    // Carregar dados da transação
    useEffect(() => {
        if (visible && transaction) {
            setDescription(transaction.description || '');
            setAmount(formatCurrency(transaction.amount, false));
            setType(transaction.type || TRANSACTION_TYPES.EXPENSE);
            setCategory(transaction.category);
            setDate(new Date(transaction.date));
            setNotes(transaction.notes || '');
            setIsPaid(transaction.isPaid !== undefined ? transaction.isPaid : true);
        } else if (visible && !transaction) {
            resetForm();
        }
    }, [transaction, visible]);

    const resetForm = () => {
        setDescription('');
        setAmount('0,00');
        setType(TRANSACTION_TYPES.EXPENSE);
        setCategory(null);
        setDate(new Date());
        setNotes('');
        setIsPaid(true);
        setShowCategoryPicker(false);
        setShowDatePicker(false);
    };

    const handleAmountChange = (text) => {
        const numbers = text.replace(/\D/g, '');
        const value = (parseInt(numbers) || 0) / 100;
        setAmount(value.toFixed(2).replace('.', ','));
    };

    const handleSave = () => {
        if (!description.trim() || !category) {
            alert('Preencha descrição e categoria');
            return;
        }

        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (numericAmount <= 0) {
            alert('Valor deve ser maior que zero');
            return;
        }

        onSave({
            description: description.trim(),
            amount: numericAmount,
            type,
            category,
            date: date.toISOString(),
            notes: notes.trim(),
            isPaid,
        });
        handleClose();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // ✅ CORREÇÃO 2: Garantir que pega TODAS as categorias
    const availableCategories = useMemo(() => {
        const baseCategories = type === TRANSACTION_TYPES.INCOME
            ? TRANSACTION_CATEGORIES.INCOME || []
            : TRANSACTION_CATEGORIES.EXPENSES || [];

        const customFiltered = customCategories.filter(c =>
            c.type === (type === TRANSACTION_TYPES.INCOME ? 'income' : 'expense')
        );

        return [...baseCategories, ...customFiltered];
    }, [type, customCategories]);

    const selectedCategory = availableCategories.find(c => c.id === category);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {transaction ? 'Editar Transação' : 'Nova Transação'}
                        </Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <FontAwesome5 name="times" size={20} color={safeTheme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Tipo */}
                        <View style={styles.typeContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    type === TRANSACTION_TYPES.EXPENSE && styles.typeButtonActive,
                                    { borderColor: safeTheme.danger },
                                ]}
                                onPress={() => {
                                    setType(TRANSACTION_TYPES.EXPENSE);
                                    setCategory(null);
                                }}
                            >
                                <FontAwesome5
                                    name="arrow-down"
                                    size={16}
                                    color={type === TRANSACTION_TYPES.EXPENSE ? safeTheme.white : safeTheme.danger}
                                />
                                <Text style={[styles.typeText, type === TRANSACTION_TYPES.EXPENSE && styles.typeTextActive]}>
                                    Despesa
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    type === TRANSACTION_TYPES.INCOME && styles.typeButtonActive,
                                    { borderColor: safeTheme.success },
                                ]}
                                onPress={() => {
                                    setType(TRANSACTION_TYPES.INCOME);
                                    setCategory(null);
                                }}
                            >
                                <FontAwesome5
                                    name="arrow-up"
                                    size={16}
                                    color={type === TRANSACTION_TYPES.INCOME ? safeTheme.white : safeTheme.success}
                                />
                                <Text style={[styles.typeText, type === TRANSACTION_TYPES.INCOME && styles.typeTextActive]}>
                                    Receita
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Descrição */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Descrição</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Supermercado, Salário..."
                                placeholderTextColor={safeTheme.textMuted}
                                value={description}
                                onChangeText={setDescription}
                                maxLength={100}
                            />
                        </View>

                        {/* Valor */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Valor</Text>
                            <View style={styles.amountInputContainer}>
                                <Text style={styles.currencySymbol}>R$</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    placeholder="0,00"
                                    placeholderTextColor={safeTheme.textMuted}
                                    value={amount}
                                    onChangeText={handleAmountChange}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Categoria */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Categoria</Text>
                            <TouchableOpacity
                                style={[styles.categoryButton, !category && styles.categoryButtonEmpty]}
                                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                            >
                                {selectedCategory ? (
                                    <View style={styles.categoryButtonContent}>
                                        <View style={[styles.categoryIcon, { backgroundColor: selectedCategory.color + '30' }]}>
                                            <FontAwesome5 name={selectedCategory.icon} size={18} color={selectedCategory.color} />
                                        </View>
                                        <Text style={styles.categoryButtonText}>{selectedCategory.name}</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.categoryButtonPlaceholder}>Selecione uma categoria</Text>
                                )}
                                <FontAwesome5
                                    name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                                    size={14}
                                    color={safeTheme.textSecondary}
                                />
                            </TouchableOpacity>

                            {/* ✅ CORREÇÃO 3: Condicional correta */}
                            {showCategoryPicker && (
                                <View style={styles.categoryPicker}>
                                    <ScrollView style={styles.categoryList} nestedScrollEnabled>
                                        {availableCategories.map((cat) => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={[
                                                    styles.categoryItem,
                                                    category === cat.id && styles.categoryItemSelected,
                                                ]}
                                                onPress={() => {
                                                    setCategory(cat.id);
                                                    setShowCategoryPicker(false);
                                                }}
                                            >
                                                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '30' }]}>
                                                    <FontAwesome5 name={cat.icon} size={18} color={cat.color} />
                                                </View>
                                                <Text style={styles.categoryItemText}>{cat.name}</Text>
                                                {category === cat.id && (
                                                    <FontAwesome5 name="check" size={16} color={safeTheme.primary} />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Data */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Data</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <FontAwesome5 name="calendar" size={16} color={safeTheme.primary} />
                                <Text style={styles.dateText}>{date.toLocaleDateString('pt-BR')}</Text>
                            </TouchableOpacity>

                            {/* ✅ CORREÇÃO 4: Condicional correta para iOS */}
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        if (Platform.OS === 'android') {
                                            setShowDatePicker(false);
                                        }
                                        if (selectedDate) {
                                            setDate(selectedDate);
                                        }
                                    }}
                                />
                            )}
                        </View>

                        {/* Notas */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Notas (opcional)</Text>
                            <TextInput
                                style={[styles.input, styles.notesInput]}
                                placeholder="Adicione observações..."
                                placeholderTextColor={safeTheme.textMuted}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Status */}
                        <View style={styles.inputGroup}>
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setIsPaid(!isPaid)}
                            >
                                <View style={[styles.checkbox, isPaid && styles.checkboxChecked]}>
                                    {isPaid && <FontAwesome5 name="check" size={12} color={safeTheme.white} />}
                                </View>
                                <Text style={styles.checkboxLabel}>
                                    {type === TRANSACTION_TYPES.EXPENSE ? 'Pago' : 'Recebido'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// ✅ CORREÇÃO 5: Usando o parâmetro 'theme' corretamente
const getStyles = (theme) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: 'center',
            padding: 16,
        },
        container: {
            backgroundColor: theme.backgroundModal,
            borderRadius: 20,
            maxHeight: '90%',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.cardBorder,
        },
        title: {
            color: theme.text,
            fontSize: 20,
            fontWeight: 'bold',
        },
        closeButton: {
            padding: 8,
        },
        content: {
            padding: 20,
        },
        typeContainer: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 20,
        },
        typeButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            borderWidth: 2,
            borderRadius: 12,
            gap: 8,
        },
        typeButtonActive: {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
        },
        typeText: {
            color: theme.text,
            fontSize: 14,
            fontWeight: '600',
        },
        typeTextActive: {
            color: theme.white,
        },
        inputGroup: {
            marginBottom: 20,
        },
        label: {
            color: theme.textSecondary,
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 8,
        },
        input: {
            backgroundColor: theme.backgroundCard,
            color: theme.text,
            padding: 12,
            borderRadius: 8,
            fontSize: 16,
        },
        notesInput: {
            height: 80,
            textAlignVertical: 'top',
        },
        amountInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.backgroundCard,
            borderRadius: 8,
            padding: 12,
        },
        currencySymbol: {
            color: theme.text,
            fontSize: 18,
            fontWeight: 'bold',
            marginRight: 8,
        },
        amountInput: {
            flex: 1,
            color: theme.text,
            fontSize: 18,
            fontWeight: 'bold',
        },
        categoryButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.backgroundCard,
            padding: 12,
            borderRadius: 8,
        },
        categoryButtonEmpty: {
            borderWidth: 1,
            borderColor: theme.textMuted,
            borderStyle: 'dashed',
        },
        categoryButtonContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        categoryButtonText: {
            color: theme.text,
            fontSize: 16,
        },
        categoryButtonPlaceholder: {
            color: theme.textMuted,
            fontSize: 16,
        },
        categoryIcon: {
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
        },
        categoryPicker: {
            marginTop: 8,
            backgroundColor: theme.backgroundCard,
            borderRadius: 8,
            maxHeight: 200,
        },
        categoryList: {
            padding: 8,
        },
        categoryItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            gap: 12,
            borderRadius: 8,
        },
        categoryItemSelected: {
            backgroundColor: theme.primary + '20',
        },
        categoryItemText: {
            flex: 1,
            color: theme.text,
            fontSize: 14,
        },
        dateButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.backgroundCard,
            padding: 12,
            borderRadius: 8,
            gap: 12,
        },
        dateText: {
            color: theme.text,
            fontSize: 16,
        },
        checkboxContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        checkbox: {
            width: 24,
            height: 24,
            borderWidth: 2,
            borderColor: theme.textMuted,
            borderRadius: 6,
            justifyContent: 'center',
            alignItems: 'center',
        },
        checkboxChecked: {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
        },
        checkboxLabel: {
            color: theme.text,
            fontSize: 16,
        },
        footer: {
            flexDirection: 'row',
            gap: 12,
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: theme.cardBorder,
        },
        cancelButton: {
            flex: 1,
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.textMuted,
            alignItems: 'center',
        },
        cancelButtonText: {
            color: theme.text,
            fontSize: 16,
            fontWeight: '600',
        },
        saveButton: {
            flex: 1,
            padding: 14,
            borderRadius: 12,
            backgroundColor: theme.primary,
            alignItems: 'center',
        },
        saveButtonText: {
            color: theme.white,
            fontSize: 16,
            fontWeight: 'bold',
        },
    });
