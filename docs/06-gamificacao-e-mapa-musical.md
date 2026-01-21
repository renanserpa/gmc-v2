# Gamificação & Mapa Musical (v1)

## Visão Geral
A gamificação no GCM Maestro não é para "distrair", mas para **tangibilizar o progresso**. Aprender música é lento; ganhar XP é imediato.

## Regras de Economia (v1)

### Ganhando XP (Experiência)
*   **Missão Concluída:** +30 a +100 XP (definido pelo professor).
*   **Aula Assistida (Presença):** +40 XP.
*   **Bônus de Streak:** Variável conforme dias consecutivos.

### Níveis (Tabela de Progressão)
O sistema usa uma curva de dificuldade progressiva:
*   Nível 1: 0 XP
*   Nível 2: 100 XP
*   Nível 3: 250 XP
*   ...até Nível 10 (2700 XP).

### Moedas (Olie Coins)
*   **Taxa de Conversão:** Geralmente 10% do XP ganho vira Moedas (ex: Ganhou 50 XP -> Ganha 5 Moedas).
*   **Uso:** Compra de itens na Loja.

## Mecânica de Streak (Fogo)
*   **Regra:** Qualquer atividade (login, missão, aula) conta como atividade do dia.
*   **Log:** Armazenado em `players.last_activity_date`.
*   **Quebra:** Se passar mais de 1 dia sem atividade, reseta para 1.

## Loja (Store)
Itens cadastrados pelo professor.
*   **Tipo Cosmético:** "Skin de Guitarra", "Avatar Dourado" (v2).
*   **Tipo Social:** "Escolher música da próxima aula", "Aula ao ar livre".

## Mapa Musical (Visão Futura)
Na v2, as missões não serão uma lista, mas "fases" em um mapa interativo, onde cada ilha representa um tema (ex: "Ilha dos Acordes", "Montanha do Ritmo").
