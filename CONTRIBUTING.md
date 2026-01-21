# Guia de Contribuição - OlieMusic GCM

Bem-vindo ao time de desenvolvimento do GCM Maestro. Este documento define os padrões para garantir a qualidade e a consistência do código gerado por Humanos e IAs (Atlas Agents).

## 🤖 Padrões para Agentes de IA

1.  **Persona:** Mantenha a persona definida no `docs/07-blueprint-de-agentes.md`.
2.  **Contexto:** Antes de codar, leia o `README.md` e `docs/03-arquitetura-conceitual.md`.
3.  **Zero-Error:** Verifique se importações existem. Não use bibliotecas que não estejam no `importmap` do `index.html`.

## 🛠️ Stack Tecnológico

*   **Runtime:** Browser Native (ES Modules via Vite/CDN).
*   **Frontend:** React 18 + TypeScript.
*   **Estilização:** Tailwind CSS (Utility-first).
*   **Backend:** Supabase (PostgreSQL + Auth + RLS).
*   **State:** React Query (Server State) + Context API (Client State).

## 📝 Convenções de Código

### Estrutura de Pastas
*   `/pages`: Componentes que representam rotas completas.
*   `/components`: Componentes reutilizáveis (Botões, Cards, HUD).
*   `/hooks`: Lógica de estado e efeitos (ex: `useCurrentStudent`).
*   `/services`: Chamadas diretas ao Supabase (ex: `dataService.ts`).
*   `/lib`: Configurações puras e engines (ex: `audioEngine.ts`).

### Estilo (Clean Code)
*   Use **Componentes Funcionais**.
*   Use **Typed Props** (Interfaces TypeScript).
*   Evite `any` sempre que possível.
*   Nomeie funções de serviço como verbos: `createStudent`, `fetchMissions`.

## 🔐 Segurança (Crítico)

1.  **RLS:** Nunca desative o Row Level Security no Supabase.
2.  **RPC:** Use funções de banco (`.rpc`) para operações que cruzam fronteiras de permissão (ex: Vínculo de Aluno).
3.  **Validation:** Nunca confie em dados vindos do frontend para cálculos financeiros (moedas).

## 🚀 Fluxo de Deploy

1.  O branch `main` é produção.
2.  Testes manuais nos fluxos críticos (Login, Vínculo, Loja) são obrigatórios antes de releases.
3.  Atualize o `APP_VERSION` em `src/constants.ts` ao lançar novas features.

---
*Mantido pelo Atlas Docs & Knowledge Agent.*