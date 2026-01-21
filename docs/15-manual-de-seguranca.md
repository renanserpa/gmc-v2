
# Manual de Segurança e Privacidade

O OlieMusic GCM lida com dados de **menores de idade** (alunos). A segurança e a privacidade não são opcionais, são a fundação do sistema.

## 1. Arquitetura de Dados (RLS)

Utilizamos **Row Level Security (RLS)** nativo do PostgreSQL. Isso significa que a segurança está nos dados, não na aplicação. Mesmo que o frontend seja hackeado, o banco de dados rejeitará consultas não autorizadas.

### Regras Fundamentais da Tabela `students`:
*   **Visibilidade (`SELECT`)**: O acesso é concedido se o usuário for o professor dono (`professor_id`), o próprio aluno usuário (`auth_user_id`) ou o responsável vinculado (`guardian_id`).
*   **Criação (`INSERT`)**: Apenas usuários com perfil de professor podem criar alunos, e o `professor_id` deve obrigatoriamente ser igual ao `auth.uid()` de quem está inserindo. Isso garante que um professor não "atribua" alunos a outros.
*   **Gestão (`UPDATE/DELETE`)**: Restrito ao professor dono do registro.

## 2. Fluxos de Vínculo (Invite Codes)

Para evitar expor listas de alunos publicamente, utilizamos **Invite Codes** e **RPCs (Remote Procedure Calls)**.

*   **O Problema:** Como um aluno recém-cadastrado encontra seu perfil se o RLS o proíbe de buscar alunos?
*   **A Solução:** A função SQL `link_student_account` roda com privilégios elevados (`SECURITY DEFINER`) apenas por milissegundos para validar o código e fazer o vínculo. Assim que o vínculo é feito (o `auth_user_id` é preenchido), as regras normais de RLS passam a valer e o aluno ganha visibilidade automática do seu próprio registro.

## 3. Dados Sensíveis (LGPD/GDPR)

*   **Dados Armazenados:** Nome, E-mail (auth), Instrumento, Progresso.
*   **Dados NÃO Armazenados:** Endereço físico, Telefone (v1), Dados financeiros completos (apenas status).
*   **Direito ao Esquecimento:** Se um usuário deletar a conta no Auth, o `ON DELETE CASCADE` limpa os dados relacionados (missões, histórico).

## 4. Prevenção de Trapaças (Anti-Cheat)

Embora seja uma plataforma educativa, a gamificação atrai tentativas de fraude.
*   **Validação:** Na v1, o frontend envia comandos de XP, mas o banco registra o log em `xp_events`.
*   **Mitigação:** Logs em `xp_events` permitem auditoria. Se um aluno ganhar 10.000 XP em 1 minuto, isso ficará registrado e o professor poderá ver.
*   **Futuro (v2):** Mover toda a lógica de atribuição de XP para `Database Triggers` e RPCs, tornando o ganho de XP imune a manipulações de console do navegador.
