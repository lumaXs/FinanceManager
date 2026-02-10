/**
 * Modelo de Transação
 * Define a estrutura de dados para transações financeiras
 */

import { TRANSACTION_TYPES, RECURRENCE_TYPES } from '../constants';

/**
 * Classe que representa uma transação financeira
 */
export class Transaction {
  constructor({
    id = null,
    description = '',
    amount = 0,
    type = TRANSACTION_TYPES.EXPENSE,
    category = null,
    date = new Date().toISOString(),
    notes = '',
    recurrence = RECURRENCE_TYPES.NONE,
    isPaid = true,
    bankAccount = null,
    tags = [],
    attachments = [],
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
  }) {
    this.id = id || this.generateId();
    this.description = description;
    this.amount = parseFloat(amount);
    this.type = type;
    this.category = category;
    this.date = date;
    this.notes = notes;
    this.recurrence = recurrence;
    this.isPaid = isPaid;
    this.bankAccount = bankAccount;
    this.tags = tags;
    this.attachments = attachments;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Gera um ID único para a transação
   * @returns {string} ID único
   */
  generateId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Valida se a transação está completa
   * @returns {boolean} true se válida
   */
  isValid() {
    return (
      this.description.trim().length > 0 &&
      this.amount > 0 &&
      this.category !== null &&
      this.date !== null
    );
  }

  /**
   * Converte a transação para formato JSON
   * @returns {Object} Objeto JSON
   */
  toJSON() {
    return {
      id: this.id,
      description: this.description,
      amount: this.amount,
      type: this.type,
      category: this.category,
      date: this.date,
      notes: this.notes,
      recurrence: this.recurrence,
      isPaid: this.isPaid,
      bankAccount: this.bankAccount,
      tags: this.tags,
      attachments: this.attachments,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Cria uma transação a partir de um objeto JSON
   * @param {Object} json - Objeto JSON
   * @returns {Transaction} Instância de Transaction
   */
  static fromJSON(json) {
    return new Transaction(json);
  }

  /**
   * Atualiza os dados da transação
   * @param {Object} updates - Dados a serem atualizados
   */
  update(updates) {
    Object.keys(updates).forEach(key => {
      if (this.hasOwnProperty(key) && key !== 'id' && key !== 'createdAt') {
        this[key] = updates[key];
      }
    });
    this.updatedAt = new Date().toISOString();
  }
}

/**
 * Modelo de Categoria
 */
export class Category {
  constructor({
    id = null,
    name = '',
    icon = 'circle',
    color = '#888888',
    type = TRANSACTION_TYPES.EXPENSE,
    isCustom = false,
  }) {
    this.id = id || this.generateId();
    this.name = name;
    this.icon = icon;
    this.color = color;
    this.type = type;
    this.isCustom = isCustom;
  }

  generateId() {
    return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      color: this.color,
      type: this.type,
      isCustom: this.isCustom,
    };
  }

  static fromJSON(json) {
    return new Category(json);
  }
}

/**
 * Modelo de Conta Bancária (para Open Finance)
 */
export class BankAccount {
  constructor({
    id = null,
    institutionId = null,
    institutionName = '',
    accountNumber = '',
    accountType = 'checking', // checking, savings, investment
    balance = 0,
    currency = 'BRL',
    isConnected = false,
    lastSync = null,
    accessToken = null,
  }) {
    this.id = id || this.generateId();
    this.institutionId = institutionId;
    this.institutionName = institutionName;
    this.accountNumber = accountNumber;
    this.accountType = accountType;
    this.balance = balance;
    this.currency = currency;
    this.isConnected = isConnected;
    this.lastSync = lastSync;
    this.accessToken = accessToken;
  }

  generateId() {
    return `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      id: this.id,
      institutionId: this.institutionId,
      institutionName: this.institutionName,
      accountNumber: this.accountNumber,
      accountType: this.accountType,
      balance: this.balance,
      currency: this.currency,
      isConnected: this.isConnected,
      lastSync: this.lastSync,
      // Não incluir accessToken no JSON por segurança
    };
  }

  static fromJSON(json) {
    return new BankAccount(json);
  }
}

/**
 * Modelo de Orçamento
 */
export class Budget {
  constructor({
    id = null,
    categoryId = null,
    amount = 0,
    period = 'monthly', // monthly, yearly
    startDate = new Date().toISOString(),
    alertThreshold = 80, // Porcentagem para alerta
    isActive = true,
  }) {
    this.id = id || this.generateId();
    this.categoryId = categoryId;
    this.amount = amount;
    this.period = period;
    this.startDate = startDate;
    this.alertThreshold = alertThreshold;
    this.isActive = isActive;
  }

  generateId() {
    return `bdg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      id: this.id,
      categoryId: this.categoryId,
      amount: this.amount,
      period: this.period,
      startDate: this.startDate,
      alertThreshold: this.alertThreshold,
      isActive: this.isActive,
    };
  }

  static fromJSON(json) {
    return new Budget(json);
  }
}
