# Domínios & Entidades

Mapeamento conceitual das tabelas do banco de dados (`src/sql/rls_policies.sql`).

## Gestão & Operação
| Entidade | Descrição |
| :--- | :--- |
| **Student** | Perfil do aluno. Contém nome, instrumento, avatar e vínculo com o professor (`teacher_id`). |
| **Lesson** | Evento de agenda. Tem data (`starts_at`) e status (agendada, concluída). |
| **Mission** | Tarefa de casa. Tem título, descrição, recompensa em XP e status. |

## Gamificação
| Entidade | Descrição |
| :--- | :--- |
| **Player** | O "avatar" do aluno. Guarda XP total, Nível atual, Saldo de Moedas e Streak (dias seguidos). |
| **XP Event** | Extrato bancário da gamificação. Log de tudo que gerou XP ou Moedas (histórico auditável). |
| **Achievement** | Definição da conquista (ex: "Primeira Aula"). |
| **Player Achievement** | Tabela pivô que registra quando um aluno desbloqueou uma conquista. |
| **Store Item** | Item vendável pelo professor (cosmético ou vantagem social). |
| **Store Order** | Registro de compra feita pelo aluno. |

## Segurança & Acesso
| Entidade | Descrição |
| :--- | :--- |
| **Guardian Student Link** | Tabela de junção que autoriza um Responsável (`guardian_auth_id`) a ver os dados de um Aluno. |
