# Deploy Automático - Firebase Hosting

## 📋 Pré-requisitos

1. Ter um projeto no Firebase Console
2. Ter uma conta no GitHub
3. Repositório Git configurado

## 🚀 Configuração Inicial

### 1. Configurar o Projeto Firebase

Edite o arquivo `.firebaserc` e substitua `seu-projeto-firebase-id` pelo ID do seu projeto Firebase:

```json
{
  "projects": {
    "default": "seu-projeto-real-id"
  }
}
```

Também edite `.github/workflows/firebase-hosting-deploy.yml` na linha `projectId`:

```yaml
projectId: seu-projeto-real-id
```

### 2. Criar Service Account no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Project Settings** (ícone de engrenagem) → **Service Accounts**
4. Clique em **Generate New Private Key**
5. Salve o arquivo JSON gerado

### 3. Adicionar Secret no GitHub

1. Vá para o seu repositório no GitHub
2. Acesse **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Nome: `FIREBASE_SERVICE_ACCOUNT`
5. Valor: Cole todo o conteúdo do arquivo JSON baixado no passo anterior
6. Clique em **Add secret**

## 🔄 Como Funciona

O deploy automático acontece quando você:

1. Faz push para a branch `main` ou `master`
2. Ou manualmente através da aba **Actions** no GitHub

### Processo Automático:

1. ✅ Checkout do código
2. ✅ Instalação do Node.js 20
3. ✅ Instalação das dependências (`npm ci`)
4. ✅ Build da aplicação (`npm run build`)
5. ✅ Deploy para Firebase Hosting

## 🧪 Testar Localmente

Antes de fazer deploy, teste localmente:

```bash
# Instalar Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# Login no Firebase
firebase login

# Build da aplicação
npm run build

# Testar localmente
firebase serve

# Deploy manual (opcional)
firebase deploy --only hosting
```

## 📝 Estrutura de Arquivos

```
.
├── .github/
│   └── workflows/
│       └── firebase-hosting-deploy.yml  # GitHub Action
├── .firebaserc                          # Configuração do projeto
├── firebase.json                        # Configuração do hosting
└── dist/                                # Build da aplicação (gerado)
```

## 🔧 Troubleshooting

### Erro: "Project ID not found"
- Verifique se o ID do projeto está correto em `.firebaserc` e no workflow

### Erro: "Permission denied"
- Verifique se o Service Account tem permissões de **Firebase Hosting Admin**

### Build falha no GitHub Actions
- Teste o build localmente: `npm run build`
- Verifique se todas as dependências estão no `package.json`

## 📚 Recursos

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
