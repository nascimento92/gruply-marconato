# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o projeto Marconato! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Código de Conduta

- Seja respeitoso e profissional
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## 🚀 Como Contribuir

### Reportando Bugs

Antes de criar um issue, verifique se o bug já não foi reportado. Se não encontrar nada relacionado:

1. Use um título claro e descritivo
2. Descreva os passos exatos para reproduzir o problema
3. Forneça exemplos específicos
4. Descreva o comportamento observado e o esperado
5. Inclua screenshots se aplicável
6. Especifique a versão do navegador e sistema operacional

### Sugerindo Melhorias

Para sugerir melhorias:

1. Use um título claro e descritivo
2. Forneça uma descrição detalhada da melhoria sugerida
3. Explique por que essa melhoria seria útil
4. Liste exemplos de como a funcionalidade funcionaria

### Pull Requests

1. **Fork o repositório** e crie sua branch a partir da `main`
   ```bash
   git checkout -b feature/minha-feature
   ```

2. **Faça suas alterações** seguindo os padrões do projeto

3. **Teste suas alterações**
   ```bash
   npm run lint
   npm run build
   ```

4. **Commit suas alterações** com mensagens claras
   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   ```

5. **Push para sua branch**
   ```bash
   git push origin feature/minha-feature
   ```

6. **Abra um Pull Request**

## 📝 Padrões de Código

### Convenções de Nomenclatura

- **Componentes**: PascalCase (`CustomerCard.tsx`)
- **Funções/Variáveis**: camelCase (`getUserData`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_ITEMS`)
- **Interfaces/Types**: PascalCase (`User`, `Product`)

### Estrutura de Componentes

```typescript
// Imports
import { useState } from 'react'
import type { ComponentProps } from './types'

// Types/Interfaces
interface MyComponentProps {
  title: string
  onAction: () => void
}

// Component
export function MyComponent({ title, onAction }: MyComponentProps) {
  // Hooks
  const [state, setState] = useState(false)

  // Handlers
  const handleClick = () => {
    onAction()
  }

  // Render
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Ação</button>
    </div>
  )
}
```

### Mensagens de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Formatação, ponto e vírgula, etc
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Atualizações de build, configs, etc

Exemplos:
```
feat: adiciona filtro de produtos por categoria
fix: corrige cálculo de estoque na página de movimentações
docs: atualiza README com instruções de deploy
refactor: reorganiza estrutura de pastas dos componentes
```

## 🧪 Testes

Antes de submeter um PR:

1. Execute o linter:
   ```bash
   npm run lint
   ```

2. Faça o build:
   ```bash
   npm run build
   ```

3. Teste localmente:
   ```bash
   npm run dev
   ```

4. Teste a build:
   ```bash
   npm run preview
   ```

## 📁 Estrutura de Arquivos

Ao adicionar novos arquivos, siga a estrutura existente:

```
src/
├── app/              # Contextos globais
├── domain/           # Modelos e tipos
├── infrastructure/   # Configurações externas
└── presentation/     # UI
    ├── components/   # Componentes reutilizáveis
    ├── layout/       # Layouts
    └── pages/        # Páginas
```

## 🎨 Estilo e Design

- Use TailwindCSS para estilização
- Mantenha consistência com o design existente
- Suporte tema claro e escuro
- Garanta responsividade (mobile, tablet, desktop)

## 🔐 Segurança

- **NUNCA** commite credenciais ou chaves de API
- Use variáveis de ambiente para dados sensíveis
- Verifique o `.gitignore` antes de commitar
- Reporte vulnerabilidades de segurança de forma privada

## 📚 Documentação

- Documente funções complexas com JSDoc
- Atualize o README.md se necessário
- Adicione comentários para lógica não óbvia
- Mantenha os tipos TypeScript atualizados

## ✅ Checklist do Pull Request

Antes de submeter, verifique:

- [ ] O código segue os padrões do projeto
- [ ] Executei o linter sem erros
- [ ] O build foi bem-sucedido
- [ ] Testei as alterações localmente
- [ ] Atualizei a documentação se necessário
- [ ] As mensagens de commit seguem o padrão
- [ ] Não há credenciais ou dados sensíveis no código

## 🆘 Precisa de Ajuda?

- Abra uma issue com a tag `question`
- Entre em contato com os mantenedores
- Consulte a documentação existente

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

---

**Obrigado por contribuir! 🎉**
