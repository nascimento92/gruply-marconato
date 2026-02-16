# Como Aplicar as Regras do Firestore

## 🔒 Problema
A aplicação está retornando erro de permissão porque as regras de segurança do Firestore não estão configuradas.

## ✅ Solução Rápida (Recomendada)

### Opção 1: Aplicar via Firebase Console (Mais Rápido)

1. **Acesse o Firebase Console**
   - Vá para: https://console.firebase.google.com/
   - Selecione o projeto **gruply-marconato**

2. **Navegue até Firestore Database**
   - No menu lateral, clique em **Firestore Database**
   - Clique na aba **Regras** (Rules)

3. **Cole as Regras**
   - Copie o conteúdo do arquivo `firestore.rules` deste projeto
   - Cole no editor de regras do Firebase Console
   - Clique em **Publicar** (Publish)

4. **Aguarde alguns segundos**
   - As regras levam alguns segundos para serem aplicadas
   - Recarregue a aplicação web

### Opção 2: Aplicar via Firebase CLI

1. **Instale o Firebase CLI** (se ainda não tiver)
   ```bash
   npm install -g firebase-tools
   ```

2. **Faça login no Firebase**
   ```bash
   firebase login
   ```

3. **Deploy apenas das regras**
   ```bash
   firebase deploy --only firestore:rules
   ```

## 📝 Conteúdo das Regras

As regras criadas permitem acesso **apenas para usuários autenticados** às seguintes coleções:
- `customers` (clientes)
- `products` (produtos)
- `stock_movements` (movimentações de estoque)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Coleção de clientes
    match /customers/{customerId} {
      allow read, write: if request.auth != null;
    }
    
    // Coleção de produtos
    match /products/{productId} {
      allow read, write: if request.auth != null;
    }
    
    // Coleção de movimentações de estoque
    match /stock_movements/{movementId} {
      allow read, write: if request.auth != null;
    }
    
    // Bloquear acesso a qualquer outra coleção
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🔐 Segurança

Estas regras garantem que:
- ✅ Apenas usuários autenticados podem ler e escrever dados
- ✅ Usuários não autenticados são bloqueados
- ✅ Coleções não especificadas são bloqueadas

## ⚠️ Importante

Para **produção**, considere adicionar regras mais específicas:
- Validação de campos obrigatórios
- Limites de tamanho de dados
- Permissões baseadas em papéis (admin, usuário, etc.)
- Validação de tipos de dados

## 🧪 Testar

Após aplicar as regras:
1. Acesse a aplicação: https://gruply-marconato.web.app
2. Faça login
3. Verifique se os dados são carregados corretamente
4. O erro de permissão deve desaparecer
