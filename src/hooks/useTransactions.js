/**
 * Hook useTransactions
 * Gerencia o estado e operações de transações
 */

import { useState, useEffect, useCallback } from 'react';
import storageService from '../services/storageService';
import { Transaction } from '../models';
import { sortByDate, getCurrentMonthTransactions, calculateTotal } from '../utils/helpers';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==================== CARREGAMENTO INICIAL ====================

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storageService.getTransactions();
      setTransactions(sortByDate(data));
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar transações:', err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== OPERAÇÕES CRUD ====================

  /**
   * Adiciona uma nova transação
   */
  const addTransaction = useCallback(async (transactionData) => {
    try {
      const newTransaction = new Transaction(transactionData);
      
      if (!newTransaction.isValid()) {
        throw new Error('Dados da transação inválidos');
      }

      await storageService.saveTransaction(newTransaction);
      setTransactions(prev => sortByDate([newTransaction, ...prev]));
      
      return newTransaction;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Atualiza uma transação existente
   */
  const updateTransaction = useCallback(async (id, updates) => {
    try {
      const updated = await storageService.updateTransaction(id, updates);
      
      setTransactions(prev =>
        sortByDate(prev.map(t => (t.id === id ? updated : t)))
      );
      
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Remove uma transação
   */
  const deleteTransaction = useCallback(async (id) => {
    try {
      await storageService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Remove múltiplas transações
   */
  const deleteMultipleTransactions = useCallback(async (ids) => {
    try {
      await Promise.all(ids.map(id => storageService.deleteTransaction(id)));
      setTransactions(prev => prev.filter(t => !ids.includes(t.id)));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ==================== FILTROS E BUSCAS ====================

  /**
   * Filtra transações por tipo
   */
  const getTransactionsByType = useCallback((type) => {
    return transactions.filter(t => t.type === type);
  }, [transactions]);

  /**
   * Filtra transações por categoria
   */
  const getTransactionsByCategory = useCallback((categoryId) => {
    return transactions.filter(t => t.category === categoryId);
  }, [transactions]);

  /**
   * Busca transações por texto
   */
  const searchTransactions = useCallback((query) => {
    const lowerQuery = query.toLowerCase();
    return transactions.filter(t =>
      t.description.toLowerCase().includes(lowerQuery) ||
      t.notes?.toLowerCase().includes(lowerQuery)
    );
  }, [transactions]);

  /**
   * Retorna transações do mês atual
   */
  const getMonthTransactions = useCallback(() => {
    return getCurrentMonthTransactions(transactions);
  }, [transactions]);

  // ==================== CÁLCULOS ====================

  /**
   * Calcula totais de receitas e despesas
   */
  const getTotals = useCallback(() => {
    const income = calculateTotal(transactions, 'income');
    const expenses = calculateTotal(transactions, 'expense');
    const balance = income - expenses;

    return { income, expenses, balance };
  }, [transactions]);

  /**
   * Calcula totais do mês atual
   */
  const getMonthTotals = useCallback(() => {
    const monthTransactions = getCurrentMonthTransactions(transactions);
    const income = calculateTotal(monthTransactions, 'income');
    const expenses = calculateTotal(monthTransactions, 'expense');
    const balance = income - expenses;

    return { income, expenses, balance };
  }, [transactions]);

  // ==================== UTILIDADES ====================

  /**
   * Recarrega todas as transações
   */
  const refresh = useCallback(() => {
    loadTransactions();
  }, []);

  /**
   * Limpa o erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    transactions,
    loading,
    error,

    // Operações CRUD
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteMultipleTransactions,

    // Filtros
    getTransactionsByType,
    getTransactionsByCategory,
    searchTransactions,
    getMonthTransactions,

    // Cálculos
    getTotals,
    getMonthTotals,

    // Utilidades
    refresh,
    clearError,
  };
};
