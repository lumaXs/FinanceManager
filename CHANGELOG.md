# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [2.0.0] - 2026-02-09

### 🎉 Lançamento Maior - Refatoração Completa

#### ✨ Adicionado

- **Categorias Personalizáveis**
  - 12 categorias de despesas pré-definidas
  - 7 categorias de receitas pré-definidas
  - Sistema de categorias customizadas
  - Ícones e cores configuráveis

- **Integração Open Finance**
  - Estrutura completa para Open Banking
  - Serviço de integração com APIs
  - Suporte a múltiplas instituições financeiras
  - Sincronização automática de transações
  - Categorização inteligente com IA

- **Suporte PF e PJ**
  - Modo Pessoa Física
  - Modo Pessoa Jurídica
  - Categorias específicas por tipo de conta
  - Relatórios adaptados

- **Arquitetura Melhorada**
  - Separação em camadas (Presentation, Business Logic, Service, Data)
  - Modelos de dados robustos (Transaction, Category, BankAccount, Budget)
  - Hooks personalizados (useTransactions)
  - Serviços modulares (Storage, Open Finance)

- **UI/UX Aprimorada**
  - Dashboard com cards de estatísticas
  - Modal de transação redesenhado
  - Seletor de categorias visual
  - Tema dark otimizado
  - Animações suaves

- **Funcionalidades**
  - Busca e filtros de transações
  - Notas e observações em transações
  - Status de pagamento (pago/pendente)
  - Exportação de dados
  - Cálculos e análises avançadas

- **Documentação**
  - README completo e profissional
  - Guia de contribuição
  - Documentação de arquitetura
  - Guia de integração Open Finance
  - Comentários detalhados no código

#### 🔧 Modificado

- Estrutura de pastas completamente reorganizada
- Sistema de cores centralizado em constantes
- Formatação de moeda melhorada
- Validação de dados aprimorada
- Performance otimizada

#### 🐛 Corrigido

- Bug de data com timezone
- Problema de formatação de valores decimais
- Renderização de listas longas
- Memory leaks em componentes

#### 🔒 Segurança

- Validação de inputs
- Sanitização de dados
- Estrutura preparada para criptografia
- Compliance LGPD

---

## [1.0.1] - 2025-12-15

### 🔧 Correções e Melhorias

#### Corrigido
- Bug ao editar transação com valor zero
- Problema de scroll na lista de transações
- Crash ao deletar última transação

#### Modificado
- Melhorias de performance na renderização
- Atualização de dependências

---

## [1.0.0] - 2025-11-01

### 🎉 Lançamento Inicial

#### Adicionado
- Registro de transações (receitas e despesas)
- Visualização de saldo
- Gráfico de balanço
- Lista de transações ordenada por data
- Edição e exclusão de transações
- Armazenamento local com AsyncStorage
- Tema dark

---

## Tipos de Mudanças

- `✨ Adicionado` para novas funcionalidades
- `🔧 Modificado` para mudanças em funcionalidades existentes
- `🗑️ Removido` para funcionalidades removidas
- `🐛 Corrigido` para correção de bugs
- `🔒 Segurança` para vulnerabilidades corrigidas
- `📚 Documentação` para mudanças na documentação
- `⚡ Performance` para melhorias de performance

---

## Links

- [2.0.0]: https://github.com/seu-usuario/finance-manager-pro/releases/tag/v2.0.0
- [1.0.1]: https://github.com/seu-usuario/finance-manager-pro/releases/tag/v1.0.1
- [1.0.0]: https://github.com/seu-usuario/finance-manager-pro/releases/tag/v1.0.0
