# Integrações & Notificações

## Atuais (Phase 0)
*   **Supabase Auth:** Email/Senha.
*   **Notificações In-App:** `react-toastify` para feedback de ações (sucesso/erro).
*   **Sons:** `uiSounds.ts` (Sintetizador local) para feedback auditivo.

## Futuras (Phase 1+)
*   **WhatsApp API:** Para enviar lembretes de aula automaticamente aos pais.
*   **Push Notifications:** (Se virar PWA/Mobile) "Você não praticou hoje!".
*   **Gateway de Pagamento:** (Stripe/Asaas) Para gestão de mensalidades no painel do Professor.

## Riscos
*   **LGPD:** Dados de menores de idade. O sistema isola dados via RLS, mas integrações externas exigirão cuidado redobrado.
