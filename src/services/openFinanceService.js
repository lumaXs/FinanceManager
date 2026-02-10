/**
 * Serviço de Open Finance
 * Gerencia a integração com APIs de Open Banking/Open Finance
 * 
 * IMPORTANTE: Este é um template/esqueleto para integração futura.
 * Para implementação real, será necessário:
 * 1. Registrar-se em uma plataforma Open Finance (ex: Belvo, Pluggy, etc)
 * 2. Obter credenciais de API
 * 3. Implementar fluxo OAuth para autenticação
 * 4. Seguir regulamentações do Banco Central
 */

import axios from 'axios';
import { API_CONFIG } from '../constants';
import { Transaction } from '../models';

class OpenFinanceService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_CONFIG.OPEN_FINANCE_BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.apiClient.interceptors.request.use(
      (config) => {
        // Aqui você adicionaria o token de autenticação
        // const token = await getAuthToken();
        // config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTENTICAÇÃO ====================

  /**
   * Inicia o fluxo de autenticação OAuth com uma instituição financeira
   * @param {string} institutionId - ID da instituição financeira
   * @returns {Promise<Object>} URL de autenticação e estado
   */
  async initiateConnection(institutionId) {
    try {
      // Implementação exemplo - ajustar conforme provedor
      const response = await this.apiClient.post('/auth/connect', {
        institution_id: institutionId,
        redirect_uri: 'financeapp://callback',
        scopes: ['transactions', 'accounts', 'balance'],
      });

      return {
        authUrl: response.data.auth_url,
        state: response.data.state,
      };
    } catch (error) {
      console.error('Erro ao iniciar conexão:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Completa o processo de autenticação após callback
   * @param {string} code - Código de autorização
   * @param {string} state - Estado da requisição
   * @returns {Promise<Object>} Dados da conta conectada
   */
  async completeConnection(code, state) {
    try {
      const response = await this.apiClient.post('/auth/token', {
        code,
        state,
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        accountId: response.data.account_id,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Erro ao completar conexão:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Desconecta uma conta bancária
   * @param {string} accountId - ID da conta
   * @returns {Promise<boolean>} true se desconectado com sucesso
   */
  async disconnectAccount(accountId) {
    try {
      await this.apiClient.delete(`/accounts/${accountId}`);
      return true;
    } catch (error) {
      console.error('Erro ao desconectar conta:', error);
      throw this.handleError(error);
    }
  }

  // ==================== DADOS BANCÁRIOS ====================

  /**
   * Busca informações da conta bancária
   * @param {string} accountId - ID da conta
   * @returns {Promise<Object>} Informações da conta
   */
  async getAccountInfo(accountId) {
    try {
      const response = await this.apiClient.get(`/accounts/${accountId}`);
      
      return {
        id: response.data.id,
        institutionName: response.data.institution.name,
        accountNumber: response.data.number,
        accountType: response.data.type,
        balance: response.data.balance.current,
        currency: response.data.balance.currency,
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Erro ao buscar informações da conta:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Busca o saldo atual da conta
   * @param {string} accountId - ID da conta
   * @returns {Promise<number>} Saldo atual
   */
  async getBalance(accountId) {
    try {
      const response = await this.apiClient.get(`/accounts/${accountId}/balance`);
      return response.data.current;
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Busca transações bancárias
   * @param {string} accountId - ID da conta
   * @param {Object} options - Opções de filtro (startDate, endDate, limit)
   * @returns {Promise<Array<Transaction>>} Lista de transações
   */
  async getTransactions(accountId, options = {}) {
    try {
      const params = {
        account_id: accountId,
        start_date: options.startDate || this.getDefaultStartDate(),
        end_date: options.endDate || new Date().toISOString(),
        limit: options.limit || 100,
      };

      const response = await this.apiClient.get('/transactions', { params });

      // Converte transações bancárias para o formato do app
      return response.data.results.map(t => this.convertBankTransaction(t));
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Sincroniza transações de uma conta
   * @param {string} accountId - ID da conta
   * @returns {Promise<Array<Transaction>>} Transações sincronizadas
   */
  async syncTransactions(accountId) {
    try {
      // Primeiro, força uma atualização dos dados
      await this.apiClient.post(`/accounts/${accountId}/refresh`);
      
      // Aguarda um pouco para processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Busca as transações atualizadas
      return await this.getTransactions(accountId, { limit: 50 });
    } catch (error) {
      console.error('Erro ao sincronizar transações:', error);
      throw this.handleError(error);
    }
  }

  // ==================== CATEGORIZAÇÃO AUTOMÁTICA ====================

  /**
   * Tenta categorizar automaticamente uma transação usando IA
   * @param {Object} transaction - Dados da transação
   * @returns {Promise<string>} ID da categoria sugerida
   */
  async suggestCategory(transaction) {
    try {
      const response = await this.apiClient.post('/ai/categorize', {
        description: transaction.description,
        amount: transaction.amount,
        merchant: transaction.merchant,
      });

      return response.data.suggested_category;
    } catch (error) {
      console.error('Erro ao sugerir categoria:', error);
      // Retorna categoria padrão em caso de erro
      return 'outros_gastos';
    }
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Converte transação bancária para formato do app
   * @param {Object} bankTransaction - Transação do banco
   * @returns {Transaction} Transação no formato do app
   */
  convertBankTransaction(bankTransaction) {
    return new Transaction({
      description: bankTransaction.description || bankTransaction.merchant?.name || 'Transação',
      amount: Math.abs(bankTransaction.amount),
      type: bankTransaction.amount > 0 ? 'income' : 'expense',
      date: bankTransaction.date,
      notes: `Importado automaticamente - ${bankTransaction.merchant?.name || ''}`,
      bankAccount: bankTransaction.account_id,
      isPaid: true,
      category: null, // Será categorizada depois
    });
  }

  /**
   * Retorna data padrão para busca (90 dias atrás)
   * @returns {string} Data em formato ISO
   */
  getDefaultStartDate() {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date.toISOString();
  }

  /**
   * Trata erros da API
   * @param {Error} error - Erro capturado
   * @returns {Error} Erro tratado
   */
  handleError(error) {
    if (error.response) {
      // Erro de resposta da API
      const message = error.response.data?.message || 'Erro na comunicação com o banco';
      return new Error(message);
    } else if (error.request) {
      // Erro de rede
      return new Error('Sem conexão com o servidor. Verifique sua internet.');
    } else {
      // Outros erros
      return error;
    }
  }

  // ==================== WEBHOOKS ====================

  /**
   * Registra webhook para receber notificações de novas transações
   * @param {string} accountId - ID da conta
   * @param {string} webhookUrl - URL do webhook
   * @returns {Promise<Object>} Dados do webhook registrado
   */
  async registerWebhook(accountId, webhookUrl) {
    try {
      const response = await this.apiClient.post('/webhooks', {
        account_id: accountId,
        url: webhookUrl,
        events: ['transaction.created', 'balance.updated'],
      });

      return {
        id: response.data.id,
        url: response.data.url,
        secret: response.data.secret,
      };
    } catch (error) {
      console.error('Erro ao registrar webhook:', error);
      throw this.handleError(error);
    }
  }

  // ==================== STATUS E SAÚDE ====================

  /**
   * Verifica se a integração está funcionando
   * @returns {Promise<boolean>} true se conectado
   */
  async checkHealth() {
    try {
      await this.apiClient.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Retorna lista de instituições financeiras disponíveis
   * @returns {Promise<Array>} Lista de instituições
   */
  async getAvailableInstitutions() {
    try {
      const response = await this.apiClient.get('/institutions');
      return response.data.results;
    } catch (error) {
      console.error('Erro ao buscar instituições:', error);
      return [];
    }
  }
}

// Exporta uma instância única do serviço (Singleton)
export default new OpenFinanceService();
