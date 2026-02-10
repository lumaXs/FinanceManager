# 🏗️ Documentação de Arquitetura

## Visão Geral

O Finance Manager Pro segue uma arquitetura modular baseada em camadas, separando responsabilidades e facilitando manutenção e testes.

## 📐 Arquitetura em Camadas

```
┌─────────────────────────────────────────┐
│           PRESENTATION LAYER            │
│  (Components, Screens, Navigation)      │
├─────────────────────────────────────────┤
│           BUSINESS LOGIC LAYER          │
│        (Hooks, Utils, Helpers)          │
├─────────────────────────────────────────┤
│            SERVICE LAYER                │
│   (Storage Service, API Service)        │
├─────────────────────────────────────────┤
│             DATA LAYER                  │
│       (Models, Constants)               │
└─────────────────────────────────────────┘
```

## 🔍 Detalhamento das Camadas

### 1. Presentation Layer (Camada de Apresentação)

**Responsabilidade:** Interface com o usuário

#### Components (Componentes)
- **DashboardCard**: Card de estatísticas
- **TransactionItem**: Item da lista de transações
- **TransactionModal**: Modal de criação/edição
- **CategoryPicker**: Seletor de categorias
- **FloatingButton**: Botão flutuante de ação

```javascript
// Exemplo de Componente
export const DashboardCard = ({ title, value, icon, color }) => {
  return (
    <View style={styles.card}>
      {/* UI do card */}
    </View>
  );
};
```

#### Screens (Telas)
- **HomeScreen**: Dashboard principal
- **TransactionsScreen**: Lista de transações
- **CategoriesScreen**: Gestão de categorias
- **SettingsScreen**: Configurações
- **BankConnectionScreen**: Conexão Open Finance

```javascript
// Exemplo de Screen
export const HomeScreen = () => {
  const { transactions, getTotals } = useTransactions();
  
  return (
    <SafeAreaView>
      <DashboardCard {...getTotals()} />
      <TransactionList data={transactions} />
    </SafeAreaView>
  );
};
```

### 2. Business Logic Layer (Camada de Lógica de Negócio)

**Responsabilidade:** Lógica de negócio e regras

#### Hooks Personalizados

```javascript
// useTransactions.js
export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Métodos CRUD
  const addTransaction = async (data) => { /* ... */ };
  const updateTransaction = async (id, updates) => { /* ... */ };
  const deleteTransaction = async (id) => { /* ... */ };

  // Filtros e buscas
  const getTransactionsByType = (type) => { /* ... */ };
  const searchTransactions = (query) => { /* ... */ };

  // Cálculos
  const getTotals = () => { /* ... */ };

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTotals,
  };
};
```

#### Utils (Utilitários)

```javascript
// helpers.js
export const formatCurrency = (value) => { /* ... */ };
export const formatDate = (date) => { /* ... */ };
export const calculateTotal = (transactions) => { /* ... */ };
export const groupBy = (array, key) => { /* ... */ };
```

### 3. Service Layer (Camada de Serviços)

**Responsabilidade:** Comunicação com APIs e armazenamento

#### Storage Service

```javascript
class StorageService {
  // Transações
  async getTransactions() { /* ... */ }
  async saveTransaction(transaction) { /* ... */ }
  async updateTransaction(id, updates) { /* ... */ }
  async deleteTransaction(id) { /* ... */ }

  // Categorias
  async getCategories() { /* ... */ }
  async saveCategory(category) { /* ... */ }

  // Contas bancárias
  async getBankAccounts() { /* ... */ }
  async saveBankAccount(account) { /* ... */ }

  // Configurações
  async getAccountType() { /* ... */ }
  async setAccountType(type) { /* ... */ }
}

export default new StorageService();
```

#### Open Finance Service

```javascript
class OpenFinanceService {
  // Autenticação
  async initiateConnection(institutionId) { /* ... */ }
  async completeConnection(code, state) { /* ... */ }

  // Dados bancários
  async getAccountInfo(accountId) { /* ... */ }
  async getBalance(accountId) { /* ... */ }
  async getTransactions(accountId, options) { /* ... */ }

  // Sincronização
  async syncTransactions(accountId) { /* ... */ }

  // IA
  async suggestCategory(transaction) { /* ... */ }
}

export default new OpenFinanceService();
```

### 4. Data Layer (Camada de Dados)

**Responsabilidade:** Estruturas de dados e constantes

#### Models (Modelos)

```javascript
// Transaction Model
export class Transaction {
  constructor({
    id,
    description,
    amount,
    type,
    category,
    date,
    notes,
    isPaid,
  }) {
    this.id = id || this.generateId();
    this.description = description;
    this.amount = parseFloat(amount);
    this.type = type;
    this.category = category;
    this.date = date;
    this.notes = notes;
    this.isPaid = isPaid;
  }

  isValid() {
    return this.description && this.amount > 0 && this.category;
  }

  toJSON() {
    return { /* ... */ };
  }

  static fromJSON(json) {
    return new Transaction(json);
  }
}
```

#### Constants (Constantes)

```javascript
export const COLORS = { /* ... */ };
export const TRANSACTION_CATEGORIES = { /* ... */ };
export const ACCOUNT_TYPES = { /* ... */ };
export const STORAGE_KEYS = { /* ... */ };
```

## 🔄 Fluxo de Dados

### Criação de Transação

```
User Action (Modal)
      ↓
Component (TransactionModal)
      ↓
Hook (useTransactions.addTransaction)
      ↓
Model (new Transaction)
      ↓
Service (storageService.saveTransaction)
      ↓
Storage (AsyncStorage)
      ↓
Hook Update (setTransactions)
      ↓
Component Re-render
      ↓
UI Updated
```

### Leitura de Dados

```
Component Mount
      ↓
Hook (useTransactions)
      ↓
Service (storageService.getTransactions)
      ↓
Storage (AsyncStorage)
      ↓
Model (Transaction.fromJSON)
      ↓
Hook State (setTransactions)
      ↓
Component Render
```

## 🎨 Padrões de Design

### Singleton Pattern (Services)

```javascript
class StorageService {
  // Implementação
}

// Exporta instância única
export default new StorageService();
```

**Por quê?**
- Garante uma única instância do serviço
- Evita múltiplas conexões/inicializações
- Facilita o gerenciamento de estado global

### Factory Pattern (Models)

```javascript
class Transaction {
  static fromJSON(json) {
    return new Transaction(json);
  }
}

// Uso
const transaction = Transaction.fromJSON(jsonData);
```

**Por quê?**
- Encapsula a criação de objetos
- Valida dados antes de criar instância
- Facilita conversão entre formatos

### Observer Pattern (Hooks)

```javascript
export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Observa mudanças
    loadTransactions();
  }, []);

  return { transactions };
};
```

**Por quê?**
- Componentes reagem automaticamente a mudanças
- Desacopla lógica de apresentação
- Facilita testes

## 🔐 Segurança

### Validação de Dados

```javascript
class Transaction {
  isValid() {
    if (!this.description || this.description.trim().length === 0) {
      return false;
    }
    if (this.amount <= 0) {
      return false;
    }
    if (!this.category) {
      return false;
    }
    return true;
  }
}
```

### Sanitização de Inputs

```javascript
const sanitizeDescription = (text) => {
  return text
    .trim()
    .replace(/<script>/gi, '')
    .substring(0, MAX_DESCRIPTION_LENGTH);
};
```

### Criptografia (Planejado)

```javascript
// Futuro: Criptografia de dados sensíveis
import CryptoJS from 'crypto-js';

const encryptData = (data, key) => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    key
  ).toString();
};
```

## 📊 Performance

### Otimizações Implementadas

1. **Memoization**
```javascript
const memoizedTotals = useMemo(() => {
  return calculateTotals(transactions);
}, [transactions]);
```

2. **Lazy Loading**
```javascript
const TransactionModal = lazy(() => import('./TransactionModal'));
```

3. **Virtualized Lists**
```javascript
<FlatList
  data={transactions}
  renderItem={renderTransaction}
  keyExtractor={item => item.id}
  windowSize={10}
  maxToRenderPerBatch={20}
/>
```

4. **Debouncing**
```javascript
const debouncedSearch = debounce((query) => {
  searchTransactions(query);
}, 300);
```

## 🧪 Testabilidade

### Estrutura Testável

```javascript
// ✅ Função pura - fácil de testar
export const calculateTotal = (transactions, type) => {
  return transactions
    .filter(t => !type || t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
};

// ✅ Componente isolado
export const TransactionItem = ({ transaction, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      {/* ... */}
    </TouchableOpacity>
  );
};
```

### Injeção de Dependências

```javascript
// Service pode ser mockado
export const useTransactions = (
  storage = storageService
) => {
  const loadTransactions = async () => {
    const data = await storage.getTransactions();
    setTransactions(data);
  };
};
```

## 🚀 Escalabilidade

### Preparado para Crescimento

1. **Modular**: Fácil adicionar novos módulos
2. **Extensível**: Categorias e tipos customizáveis
3. **Abstraído**: Services podem ser trocados
4. **Documentado**: Código auto-explicativo

### Futuras Expansões

- **Multi-idioma**: i18n preparado
- **Multi-moeda**: Estrutura suporta
- **Multi-conta**: Já modelado
- **Sync Cloud**: Service layer preparado
- **Real-time**: WebSocket structure ready

## 📖 Referências

- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Design Patterns](https://refactoring.guru/design-patterns)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Mantido por:** Finance Manager Pro Team
**Última atualização:** Fevereiro 2026
