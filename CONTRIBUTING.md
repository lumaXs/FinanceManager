# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o Finance Manager Pro! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Features](#sugerindo-features)

## 📜 Código de Conduta

Este projeto adere ao código de conduta do Contributor Covenant. Ao participar, espera-se que você mantenha este código. Por favor, reporte comportamentos inaceitáveis.

## 🚀 Como Contribuir

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU-USUARIO/finance-manager-pro.git
cd finance-manager-pro

# Adicione o repositório original como upstream
git remote add upstream https://github.com/ORIGINAL/finance-manager-pro.git
```

### 2. Crie uma Branch

```bash
# Atualize sua main
git checkout main
git pull upstream main

# Crie uma branch para sua feature/fix
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 3. Faça suas Mudanças

- Siga os padrões de código do projeto
- Escreva código limpo e bem documentado
- Adicione testes quando aplicável
- Atualize a documentação

### 4. Commit

Usamos commits semânticos:

```bash
# Formato
tipo(escopo): descrição curta

# Exemplos
feat(transactions): adiciona filtro por categoria
fix(modal): corrige bug no salvamento
docs(readme): atualiza instruções de instalação
style(components): formata código com prettier
refactor(services): reorganiza lógica de storage
test(hooks): adiciona testes para useTransactions
chore(deps): atualiza dependências
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de build/config

### 5. Push e Pull Request

```bash
# Push para seu fork
git push origin feature/nome-da-feature

# Crie um Pull Request no GitHub
```

## 💻 Padrões de Código

### JavaScript/React Native

```javascript
// ✅ BOM
const calculateTotal = (transactions) => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
};

// ❌ RUIM
function calc(t) {
  var s = 0;
  for(var i=0;i<t.length;i++){s+=t[i].amount}
  return s
}
```

### Nomenclatura

```javascript
// ✅ Componentes: PascalCase
const TransactionModal = () => {};

// ✅ Funções: camelCase
const formatCurrency = (value) => {};

// ✅ Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// ✅ Arquivos de componentes: PascalCase
// TransactionModal.js

// ✅ Arquivos utilitários: camelCase
// storageService.js
```

### Estrutura de Componentes

```javascript
/**
 * Nome do Componente
 * Breve descrição do que o componente faz
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

export const MeuComponente = ({ prop1, prop2 }) => {
  // 1. Hooks
  const [state, setState] = useState(null);

  // 2. Efeitos
  useEffect(() => {
    // ...
  }, []);

  // 3. Handlers
  const handleAction = () => {
    // ...
  };

  // 4. Render
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{prop1}</Text>
    </View>
  );
};

// 5. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  text: {
    color: COLORS.text,
    fontSize: 16,
  },
});
```

### Documentação

```javascript
/**
 * Formata um valor numérico para moeda brasileira
 * 
 * @param {number} value - Valor a ser formatado
 * @param {boolean} showSymbol - Se deve mostrar o símbolo R$
 * @returns {string} Valor formatado (ex: "R$ 1.234,56")
 * 
 * @example
 * formatCurrency(1234.56) // "R$ 1.234,56"
 * formatCurrency(1234.56, false) // "1.234,56"
 */
export const formatCurrency = (value, showSymbol = true) => {
  // implementação
};
```

## 🔍 Processo de Pull Request

1. **Preencha o template**: Use o template de PR fornecido
2. **Descrição clara**: Explique o que foi mudado e por quê
3. **Screenshots**: Adicione capturas de tela para mudanças visuais
4. **Testes**: Certifique-se de que todos os testes passam
5. **Documentação**: Atualize docs se necessário
6. **Aguarde review**: Um mantenedor irá revisar seu PR

### Checklist do PR

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Commits seguem o padrão semântico
- [ ] Não há conflitos com a branch main
- [ ] Build passa sem erros

## 🐛 Reportando Bugs

### Antes de Reportar

1. Verifique se o bug já não foi reportado
2. Certifique-se de que está usando a versão mais recente
3. Tente reproduzir o bug em um ambiente limpo

### Ao Reportar

Use o template de issue e inclua:

- **Descrição clara**: O que aconteceu e o que deveria acontecer
- **Passos para reproduzir**: Como reproduzir o bug
- **Comportamento esperado**: O que deveria acontecer
- **Comportamento atual**: O que realmente acontece
- **Screenshots**: Se aplicável
- **Ambiente**: SO, versão do app, dispositivo, etc.
- **Logs**: Mensagens de erro relevantes

### Exemplo

```markdown
## Descrição
O app trava ao tentar salvar uma transação com valor acima de R$ 10.000

## Passos para Reproduzir
1. Abra o modal de nova transação
2. Digite um valor acima de 10.000
3. Pressione Salvar
4. App trava

## Comportamento Esperado
Transação deveria ser salva normalmente

## Comportamento Atual
App trava e fecha

## Ambiente
- SO: Android 14
- Versão: 2.0.0
- Dispositivo: Samsung Galaxy S21

## Logs
```
Error: Cannot save transaction...
```
```

## 💡 Sugerindo Features

### Antes de Sugerir

1. Verifique se a feature já não foi sugerida
2. Confirme que a feature se alinha com os objetivos do projeto
3. Pense em como seria implementada

### Ao Sugerir

Use o template de feature request e inclua:

- **Problema**: Que problema a feature resolve?
- **Solução proposta**: Como você imagina a feature?
- **Alternativas**: Outras soluções que você considerou?
- **Benefícios**: Quem se beneficiaria e como?
- **Exemplos**: Mockups, screenshots de apps similares, etc.

## 🧪 Testes

### Executando Testes

```bash
# Todos os testes
npm test

# Modo watch
npm run test:watch

# Com coverage
npm run test:coverage
```

### Escrevendo Testes

```javascript
// MeuComponente.test.js
import { render, fireEvent } from '@testing-library/react-native';
import { MeuComponente } from './MeuComponente';

describe('MeuComponente', () => {
  it('renderiza corretamente', () => {
    const { getByText } = render(<MeuComponente />);
    expect(getByText('Texto esperado')).toBeTruthy();
  });

  it('chama callback ao pressionar botão', () => {
    const onPress = jest.fn();
    const { getByText } = render(<MeuComponente onPress={onPress} />);
    
    fireEvent.press(getByText('Botão'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## 📚 Recursos Úteis

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🎉 Reconhecimento

Todos os contribuidores serão adicionados ao README na seção de agradecimentos!

## ❓ Dúvidas?

- Abra uma [Discussion](https://github.com/seu-usuario/finance-manager-pro/discussions)
- Entre no nosso [Discord](https://discord.gg/financemanagerpro)
- Envie um email para dev@financemanagerpro.com

---

**Obrigado por contribuir! 🚀**
