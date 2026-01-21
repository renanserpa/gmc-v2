# Guia de Deploy (Operações)

Este documento descreve como levar o **GCM Maestro** do ambiente de desenvolvimento para a produção.

## 1. Requisitos de Infraestrutura

O sistema depende de dois serviços principais:
1.  **Frontend Hosting:** Qualquer serviço que suporte SPAs estáticos (Vercel, Netlify, Cloudflare Pages).
2.  **Backend:** Um projeto Supabase (PostgreSQL).

## 2. Configuração do Backend (Supabase)

1.  Crie um novo projeto no [Supabase](https://supabase.com).
2.  Acesse o **SQL Editor**.
3.  Execute o script mestre localizado em `src/sql/rls_policies.sql`.
    *   *Nota: Este script cria tabelas, policies RLS e funções RPC.*
4.  Vá em **Project Settings > API**.
5.  Copie a `URL` e a `anon public key`.

## 3. Configuração do Frontend

### Variáveis de Ambiente
No ambiente de deploy (ex: Vercel), configure as variáveis de ambiente (se estiver usando build step) ou edite o arquivo `src/lib/supabaseClient.ts` (se estiver usando o método atual de sandbox).

Para produção real, recomenda-se usar `.env`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Build & Deploy
O projeto usa Vite. O comando de build padrão é:
```bash
npm run build
```
O diretório de saída será `/dist`.

## 4. Verificação Pós-Deploy (Smoke Test)

Após o deploy, execute o seguinte checklist:
1.  [ ] Acessar a URL pública.
2.  [ ] Criar uma conta de Professor.
3.  [ ] Criar um Aluno e copiar o Invite Code.
4.  [ ] Abrir aba anônima, criar conta de Aluno e usar o código.
5.  [ ] Verificar se o vínculo ocorreu e o Dashboard do Aluno carregou.

## 5. Domínios e SSL
O sistema funciona em qualquer domínio HTTPS. Certifique-se de adicionar o domínio de produção na lista de **Redirect URLs** no painel de Autenticação do Supabase se for usar Magic Links ou OAuth (Google/Facebook).