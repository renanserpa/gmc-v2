# Decisões de Arquitetura (ADRs)

## ADR-001: Supabase como Backend
*   **Decisão:** Usar Supabase (BaaS) em vez de backend customizado (Node/Nest).
*   **Motivo:** Velocidade de desenvolvimento, Auth pronto, Banco Realtime e RLS simplificam a segurança multi-tenant.

## ADR-002: Gamificação no Backend (Service Layer)
*   **Decisão:** A lógica de XP e Níveis reside em `gamificationService.ts` (frontend service) por enquanto, mas validada por RLS.
*   **Motivo:** Na Phase 0/1, reduz complexidade de Edge Functions. Na Phase 2, moveremos para Triggers de Banco para segurança total anti-cheat.

## ADR-003: Web Audio API Nativol
*   **Decisão:** Não usar bibliotecas pesadas (Tone.js) para Metrônomo/Afinador simples.
*   **Motivo:** Performance (bundle size), latência menor e controle total dos osciladores.

## ADR-004: Dupla Persistência de Avatar
*   **Decisão:** Salvar URL do avatar em `public.students` E `auth.users.user_metadata`.
*   **Motivo:** `students` permite que o professor veja o avatar. `user_metadata` permite que o header do aluno carregue instantaneamente sem query no banco.
