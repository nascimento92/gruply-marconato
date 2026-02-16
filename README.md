# 🏪 Marconato - Sistema de Gestão de Estoque

Sistema completo de gestão de estoque e vendas desenvolvido com React, TypeScript e Firebase. Ideal para pequenos e médios negócios que precisam controlar produtos, clientes, movimentações de estoque e acompanhar métricas de vendas.

[![Deploy Status](https://img.shields.io/badge/deploy-live-success)](https://gruply-marconato.web.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.9-orange)](https://firebase.google.com/)

## 🌐 Demo

**Aplicação em produção:** [https://gruply-marconato.web.app](https://gruply-marconato.web.app)

## ✨ Funcionalidades

### 📊 Dashboard
- Visão geral de vendas e métricas do negócio
- Gráficos interativos de vendas diárias e mensais
- Indicadores de produtos mais vendidos
- Resumo de estoque e movimentações

### 👥 Gestão de Clientes
- Cadastro completo de clientes
- Registro de CPF/CNPJ e telefone
- Histórico de compras por cliente
- Busca e filtros avançados

### 📦 Gestão de Produtos
- Cadastro de produtos com SKU
- Controle de preço de venda e custo
- Acompanhamento de estoque em tempo real
- Descrições e categorização

### 📈 Movimentações de Estoque
- Registro de entradas e saídas
- Controle de vendas (à vista e fiado)
- Registro de compras de fornecedores
- Histórico completo de movimentações
- Controle de pagamentos pendentes
- Data de registro e data de pagamento separadas

### 🎨 Interface
- Design moderno e responsivo
- Tema claro/escuro
- Notificações toast para feedback ao usuário
- Navegação intuitiva

## 🛠️ Tecnologias

### Frontend
- **React 19.2** - Biblioteca UI
- **TypeScript 5.9** - Tipagem estática
- **Vite 7.3** - Build tool e dev server
- **TailwindCSS 4.1** - Framework CSS utilitário
- **Recharts 3.7** - Biblioteca de gráficos

### Backend & Infraestrutura
- **Firebase Authentication** - Autenticação de usuários
- **Cloud Firestore** - Banco de dados NoSQL em tempo real
- **Firebase Hosting** - Hospedagem web
- **GitHub Actions** - CI/CD automático

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **PostCSS** - Processamento de CSS
- **Autoprefixer** - Prefixos CSS automáticos

## 📁 Estrutura do Projeto

```
src/
├── app/                      # Contextos e estado global
│   ├── AppStateContext.tsx   # Estado principal da aplicação
│   ├── ThemeContext.tsx      # Gerenciamento de tema
│   └── ToastContext.tsx      # Sistema de notificações
├── domain/                   # Modelos e tipos de domínio
│   └── models.ts             # Interfaces TypeScript
├── infrastructure/           # Configurações externas
│   └── firebase/
│       └── config.ts         # Configuração do Firebase
├── presentation/             # Camada de apresentação
│   ├── components/           # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Select.tsx
│   │   ├── Table.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── Toast.tsx
│   ├── layout/               # Componentes de layout
│   │   └── AppLayout.tsx     # Layout principal com sidebar
│   └── pages/                # Páginas da aplicação
│       ├── CustomersPage.tsx
│       ├── DashboardPage.tsx
│       ├── LoginPage.tsx
│       ├── MovementsPage.tsx
│       ├── ProductsPage.tsx
│       └── StockPage.tsx
├── App.tsx                   # Componente raiz
├── main.tsx                  # Entry point
└── vite-env.d.ts            # Definições de tipos do Vite
```

## 🚀 Começando

### Pré-requisitos

- Node.js 20.x ou superior
- npm ou yarn
- Conta no Firebase

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/nascimento92/gruply-marconato.git
   cd gruply-marconato
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   VITE_FIREBASE_API_KEY=sua-api-key
   VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=seu-projeto-id
   VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
   VITE_FIREBASE_APP_ID=seu-app-id
   ```

4. **Configure o Firebase**
   
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative **Authentication** (Email/Password)
   - Ative **Cloud Firestore**
   - Copie as credenciais para o arquivo `.env`

5. **Configure as regras do Firestore**
   
   Aplique as regras de segurança:
   ```bash
   firebase deploy --only firestore:rules
   ```
   
   Ou copie manualmente o conteúdo de `firestore.rules` no Firebase Console.

### Desenvolvimento

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

### Preview da Build

```bash
npm run preview
```

## 🔐 Autenticação

O sistema utiliza Firebase Authentication com email e senha. Para criar o primeiro usuário:

1. Acesse o Firebase Console
2. Vá em **Authentication** → **Users**
3. Clique em **Add User**
4. Cadastre email e senha

## 📊 Banco de Dados

### Coleções do Firestore

#### `customers`
```typescript
{
  id: string
  name: string
  identification?: string  // CPF/CNPJ
  phone?: string
}
```

#### `products`
```typescript
{
  id: string
  name: string
  description?: string
  sku: string
  unitPrice: number        // Preço de venda
  costPrice: number        // Preço de custo médio
  stockQuantity: number
}
```

#### `stock_movements`
```typescript
{
  id: string
  productId: string
  customerId?: string
  type: 'in' | 'out'      // Entrada ou saída
  quantity: number
  unitPrice?: number       // Preço da transação
  originalPrice?: number   // Preço original (vendas)
  discount?: number        // Desconto aplicado
  isPaid?: boolean         // Status de pagamento
  paymentDate?: string     // Data do pagamento
  totalValue?: number
  date: string            // Data de registro
}
```

## 🚀 Deploy Automático

O projeto está configurado com GitHub Actions para deploy automático no Firebase Hosting.

### Configuração do CI/CD

1. **Crie um Service Account no Firebase**
   - Firebase Console → Project Settings → Service Accounts
   - Generate New Private Key

2. **Adicione o Secret no GitHub**
   - GitHub Repository → Settings → Secrets and variables → Actions
   - Nome: `FIREBASE_SERVICE_ACCOUNT`
   - Valor: Conteúdo do arquivo JSON baixado

3. **Push para a branch main**
   ```bash
   git push origin main
   ```

O deploy será executado automaticamente! 🎉

Para mais detalhes, consulte [DEPLOY.md](./DEPLOY.md).

## 📝 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Cria build de produção |
| `npm run preview` | Preview da build de produção |
| `npm run lint` | Executa o linter |

## 🎨 Tema

O sistema suporta tema claro e escuro, com alternância automática baseada na preferência do usuário. O tema pode ser alterado manualmente através do botão no canto superior direito.

## 🔧 Configuração do TypeScript

O projeto utiliza três arquivos de configuração TypeScript:

- **tsconfig.json** - Configuração raiz com referências
- **tsconfig.app.json** - Configuração para código da aplicação
- **tsconfig.node.json** - Configuração para scripts Node.js

## 🐛 Troubleshooting

### Erro de permissão no Firestore

Se você receber erros de permissão:
1. Verifique se as regras do Firestore foram aplicadas
2. Consulte [FIRESTORE_RULES.md](./FIRESTORE_RULES.md)

### Build falhando

Se o build falhar:
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Execute `npm ci` para reinstalar dependências
3. Limpe o cache: `rm -rf node_modules dist .vite`

### Gráficos não aparecem

Se os gráficos do Recharts não aparecerem:
1. Verifique o console do navegador
2. Certifique-se de que há dados nas coleções
3. Faça um hard refresh (Ctrl + Shift + R)

## 📄 Licença

Este projeto é privado e de uso exclusivo.

## 👨‍💻 Autor

**Gabriel Nascimento**
- GitHub: [@nascimento92](https://github.com/nascimento92)
- Email: gabriel_maker@hotmail.com

## 🤝 Contribuindo

Este é um projeto privado. Para sugestões ou melhorias, entre em contato com o autor.

## 📚 Recursos Adicionais

- [Documentação do React](https://react.dev/)
- [Documentação do TypeScript](https://www.typescriptlang.org/docs/)
- [Documentação do Firebase](https://firebase.google.com/docs)
- [Documentação do Vite](https://vite.dev/)
- [Documentação do TailwindCSS](https://tailwindcss.com/docs)
- [Documentação do Recharts](https://recharts.org/)

---

⭐ **Desenvolvido com React, TypeScript e Firebase**
