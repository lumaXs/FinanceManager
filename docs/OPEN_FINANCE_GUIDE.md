# 🏦 Guia de Integração Open Finance

Este guia explica como integrar o Finance Manager Pro com APIs de Open Banking/Open Finance para sincronizar automaticamente transações bancárias.

## 📋 Índice

- [O que é Open Finance?](#o-que-é-open-finance)
- [Provedores Recomendados](#provedores-recomendados)
- [Configuração Inicial](#configuração-inicial)
- [Implementação](#implementação)
- [Fluxo de Autenticação](#fluxo-de-autenticação)
- [Sincronização de Dados](#sincronização-de-dados)
- [Segurança](#segurança)
- [Troubleshooting](#troubleshooting)

## 🌐 O que é Open Finance?

Open Finance (ou Open Banking) é um sistema que permite compartilhamento de dados financeiros entre instituições, mediante autorização do cliente.

### Benefícios

✅ **Sincronização Automática**: Transações aparecem automaticamente no app
✅ **Múltiplas Contas**: Conecte vários bancos em um só lugar
✅ **Dados Reais**: Informações diretas da fonte
✅ **Categorização IA**: Categorização inteligente de transações
✅ **Saldo Atualizado**: Saldo em tempo real

### Como Funciona

```
1. Usuário autoriza acesso → 2. App conecta com banco → 3. Dados sincronizados
```

## 🔌 Provedores Recomendados

### 1. Pluggy (Recomendado para Brasil)

- ✅ Mais de 300 instituições brasileiras
- ✅ Documentação em português
- ✅ Suporte completo Open Finance Brasil
- ✅ Preço competitivo
- 🔗 [pluggy.ai](https://pluggy.ai)

**Plano Gratuito:**
- 100 usuários
- Sincronização a cada 6h
- Suporte por email

### 2. Belvo (Alternativa)

- ✅ Cobertura América Latina
- ✅ API bem documentada
- ✅ SDKs oficiais
- 🔗 [belvo.com](https://belvo.com)

### 3. Plaid (Internacional)

- ✅ Melhor para mercado americano
- ✅ Documentação excelente
- ⚠️ Poucos bancos brasileiros
- 🔗 [plaid.com](https://plaid.com)

## 🚀 Configuração Inicial

### Passo 1: Criar Conta no Provedor

Exemplo com Pluggy:

1. Acesse [dashboard.pluggy.ai](https://dashboard.pluggy.ai)
2. Crie uma conta
3. Crie um novo aplicativo
4. Copie as credenciais

### Passo 2: Obter Credenciais

Você receberá:

```
CLIENT_ID: "xxx-xxx-xxx"
CLIENT_SECRET: "yyy-yyy-yyy"
```

### Passo 3: Configurar o App

Edite `src/constants/index.js`:

```javascript
export const API_CONFIG = {
  OPEN_FINANCE_BASE_URL: 'https://api.pluggy.ai',
  CLIENT_ID: process.env.PLUGGY_CLIENT_ID,
  CLIENT_SECRET: process.env.PLUGGY_CLIENT_SECRET,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};
```

### Passo 4: Instalar Dependências

```bash
npm install axios
# ou
yarn add axios
```

## 💻 Implementação

### 1. Configurar API Client

Atualize `src/services/openFinanceService.js`:

```javascript
import axios from 'axios';
import { API_CONFIG } from '../constants';

class OpenFinanceService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_CONFIG.OPEN_FINANCE_BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_CONFIG.CLIENT_ID,
      },
    });

    // Interceptor para refresh de token
    this.apiClient.interceptors.request.use(
      async (config) => {
        const token = await this.getValidToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async getValidToken() {
    // Implementar lógica de refresh token
    const stored = await AsyncStorage.getItem('@api_token');
    if (stored) {
      const { token, expiresAt } = JSON.parse(stored);
      if (Date.now() < expiresAt) {
        return token;
      }
    }

    // Token expirado, renovar
    return await this.refreshToken();
  }

  async refreshToken() {
    const response = await axios.post(
      `${API_CONFIG.OPEN_FINANCE_BASE_URL}/auth`,
      {
        clientId: API_CONFIG.CLIENT_ID,
        clientSecret: API_CONFIG.CLIENT_SECRET,
      }
    );

    const { accessToken, expiresIn } = response.data;
    
    await AsyncStorage.setItem('@api_token', JSON.stringify({
      token: accessToken,
      expiresAt: Date.now() + (expiresIn * 1000),
    }));

    return accessToken;
  }
}
```

### 2. Implementar Fluxo de Conexão

```javascript
// Tela de Conexão Bancária
import { Linking } from 'react-native';
import openFinanceService from '../services/openFinanceService';

export const BankConnectionScreen = () => {
  const connectBank = async (institutionId) => {
    try {
      // 1. Inicia conexão
      const { connectToken } = await openFinanceService.createConnectToken();
      
      // 2. Abre widget de autenticação
      const authUrl = `https://connect.pluggy.ai?connectToken=${connectToken}`;
      
      // 3. Abre no navegador
      const supported = await Linking.canOpenURL(authUrl);
      if (supported) {
        await Linking.openURL(authUrl);
      }

      // 4. Aguarda callback (via deep link)
      // Implementar listener de deep link
      
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao banco');
    }
  };

  return (
    <View>
      {FINANCIAL_INSTITUTIONS.map(bank => (
        <BankButton
          key={bank.id}
          bank={bank}
          onPress={() => connectBank(bank.id)}
        />
      ))}
    </View>
  );
};
```

### 3. Configurar Deep Links

Edite `app.json`:

```json
{
  "expo": {
    "scheme": "financeapp",
    "ios": {
      "bundleIdentifier": "com.financeapp.app"
    },
    "android": {
      "package": "com.financeapp.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "data": {
            "scheme": "financeapp"
          },
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### 4. Tratar Callback

```javascript
// App.js
import { Linking } from 'react-native';

useEffect(() => {
  // Listener para deep links
  Linking.addEventListener('url', handleDeepLink);

  // Verifica se app foi aberto via link
  Linking.getInitialURL().then(url => {
    if (url) handleDeepLink({ url });
  });

  return () => {
    Linking.removeAllListeners('url');
  };
}, []);

const handleDeepLink = async ({ url }) => {
  // financeapp://callback?itemId=xxx&executionStatus=xxx
  
  const { queryParams } = Linking.parse(url);
  
  if (queryParams.executionStatus === 'SUCCESS') {
    const itemId = queryParams.itemId;
    
    // Salvar conexão
    await saveConnectionToStorage(itemId);
    
    // Sincronizar dados
    await syncBankData(itemId);
    
    Alert.alert('Sucesso!', 'Banco conectado com sucesso');
  } else {
    Alert.alert('Erro', 'Não foi possível conectar ao banco');
  }
};
```

## 🔄 Fluxo de Autenticação

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│   App    │         │  Pluggy  │         │  Banco   │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │ 1. createConnect   │                    │
     │─────────────────>  │                    │
     │                    │                    │
     │ 2. connectToken    │                    │
     │ <─────────────────│                    │
     │                    │                    │
     │ 3. Open widget     │                    │
     │─────────────────>  │                    │
     │                    │                    │
     │                    │ 4. Login request   │
     │                    │─────────────────>  │
     │                    │                    │
     │                    │ 5. Credentials     │
     │                    │ <─────────────────│
     │                    │                    │
     │ 6. Callback        │                    │
     │ <─────────────────│                    │
     │                    │                    │
     │ 7. Sync data       │                    │
     │─────────────────>  │                    │
     │                    │                    │
```

## 📥 Sincronização de Dados

### Sincronização Manual

```javascript
const syncButton = async () => {
  setLoading(true);
  
  try {
    const accounts = await storageService.getBankAccounts();
    
    for (const account of accounts) {
      // Buscar transações novas
      const newTransactions = await openFinanceService.syncTransactions(
        account.id
      );

      // Categorizar automaticamente
      for (const transaction of newTransactions) {
        const suggestedCategory = await openFinanceService.suggestCategory(
          transaction
        );
        transaction.category = suggestedCategory;
      }

      // Salvar no storage
      for (const transaction of newTransactions) {
        await storageService.saveTransaction(transaction);
      }
    }

    Alert.alert('Sucesso', `${newTransactions.length} transações sincronizadas`);
  } catch (error) {
    Alert.alert('Erro', 'Falha na sincronização');
  } finally {
    setLoading(false);
  }
};
```

### Sincronização Automática (Background)

```javascript
// Usar background fetch do Expo
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_SYNC_TASK = 'background-sync';

// Definir tarefa
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    await syncAllAccounts();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Registrar tarefa
async function registerBackgroundSync() {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
    minimumInterval: 60 * 60, // 1 hora
    stopOnTerminate: false,
    startOnBoot: true,
  });
}
```

### Webhooks (Alternativa)

```javascript
// Servidor backend recebe webhooks
// POST /webhook
{
  "event": "transaction.created",
  "data": {
    "itemId": "xxx",
    "accountId": "yyy",
    "transaction": { /* ... */ }
  }
}

// Servidor notifica app via push notification
```

## 🔐 Segurança

### Boas Práticas

1. **Nunca armazene credenciais do banco**
```javascript
// ❌ NUNCA FAÇA ISSO
const userPassword = 'senha123';
await AsyncStorage.setItem('bank_password', userPassword);

// ✅ Use apenas tokens de acesso
const accessToken = await openFinanceService.getToken();
await SecureStore.setItemAsync('access_token', accessToken);
```

2. **Use HTTPS sempre**
```javascript
const API_URL = 'https://api.pluggy.ai'; // ✅
const API_URL = 'http://api.pluggy.ai';  // ❌
```

3. **Valide dados recebidos**
```javascript
const validateTransaction = (data) => {
  if (!data.amount || typeof data.amount !== 'number') {
    throw new Error('Invalid amount');
  }
  if (!data.date || !isValidDate(data.date)) {
    throw new Error('Invalid date');
  }
  return true;
};
```

4. **Implemente rate limiting**
```javascript
const rateLimiter = {
  requests: 0,
  lastReset: Date.now(),
  
  canMakeRequest() {
    const now = Date.now();
    if (now - this.lastReset > 60000) {
      this.requests = 0;
      this.lastReset = now;
    }
    
    if (this.requests >= 30) {
      return false;
    }
    
    this.requests++;
    return true;
  }
};
```

### Compliance LGPD

- Informar claramente sobre coleta de dados
- Obter consentimento explícito
- Permitir exclusão de dados
- Criptografar dados sensíveis

```javascript
// Exemplo de consentimento
const requestConsent = async () => {
  const hasConsent = await AsyncStorage.getItem('data_consent');
  
  if (!hasConsent) {
    Alert.alert(
      'Consentimento de Dados',
      'Ao conectar sua conta bancária, você autoriza...',
      [
        { text: 'Recusar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            await AsyncStorage.setItem('data_consent', 'true');
            await AsyncStorage.setItem('consent_date', new Date().toISOString());
          }
        }
      ]
    );
  }
};
```

## 🐛 Troubleshooting

### Erro: "Authentication failed"

**Causa:** Token expirado ou inválido

**Solução:**
```javascript
// Limpar cache de token
await AsyncStorage.removeItem('@api_token');
// Tentar novamente
const newToken = await openFinanceService.refreshToken();
```

### Erro: "Institution not available"

**Causa:** Banco em manutenção ou não suportado

**Solução:**
```javascript
// Verificar status da instituição
const status = await openFinanceService.getInstitutionStatus(bankId);
if (status.available) {
  // Prosseguir
} else {
  Alert.alert('Banco Indisponível', status.message);
}
```

### Transações duplicadas

**Causa:** Múltiplas sincronizações

**Solução:**
```javascript
const deduplicateTransactions = (transactions) => {
  const seen = new Set();
  return transactions.filter(t => {
    const key = `${t.date}-${t.amount}-${t.description}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
```

## 📚 Recursos Adicionais

- [Documentação Pluggy](https://docs.pluggy.ai)
- [Open Finance Brasil](https://openbankingbrasil.org.br)
- [Banco Central - Open Finance](https://www.bcb.gov.br/estabilidadefinanceira/openbanking)

## 💡 Dicas

1. Comece com modo sandbox/teste
2. Teste com um único banco primeiro
3. Implemente logs detalhados
4. Monitore taxa de sucesso de conexões
5. Tenha fallback para entrada manual

---

**Precisa de ajuda?** Abra uma issue ou entre em contato no Discord!
