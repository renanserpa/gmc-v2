// src/config/constants.ts

// Paleta de Cores (baseada no Design System e Tailwind)
export const THEME = {
  colors: {
    primary: '#38bdf8',    // sky-400
    secondary: '#a78bfa',  // purple-400
    accent: '#facc15',     // amber-400 (similar to yellow)
    success: '#34d399',    // emerald-400
    error: '#f87171',      // red-400
  },
};

// Configurações de Gamificação
export const GAMIFICATION = {
  xp: {
    ATTENDANCE: 20,
    PERFECT_EXERCISE: 50,
  },
};

// Configurações do Motor de Áudio
export const AUDIO = {
  PITCH_TOLERANCE_CENTS: 15,
  SAMPLE_RATE: 44100,
};

// Mensagens Padrão do Maestro AI (antigo KNOWLEDGE_BASE)
export const MESSAGES = {
  greetings: [
    "Olá! Estou pronto para ajudar. Vamos tocar algo hoje?",
    "Oi! O violão já está afinado? Como posso ajudar?",
    "Olá Mestre! Qual é a dúvida musical de hoje?"
  ],
  tuning: [
    "Parece que você quer afinar. Lembre-se: Corda 6 é Mi (E). Quer que eu abra o afinador?",
    "Afinação é a base de tudo. Use o afinador do app para garantir que o Mizão está em E."
  ],
  posture: [
    "Lembre-se da regra da 'Concha de Mão': Deixe um espaço entre a palma da mão e o braço do violão.",
    "Coluna reta! Se você se curvar, vai cansar mais rápido. Respire fundo e relaxe os ombros.",
    "O polegar da mão esquerda deve ficar atrás do braço, não 'abraçando' o violão (exceto em alguns blues!)."
  ],
  pain: [
    "Dor na ponta dos dedos é normal no começo (são os calos se formando). Mas dor no pulso NÃO é normal. Pare e alongue.",
    "Se estiver doendo o pulso, verifique se você não está dobrando-o demais. Tente manter o pulso reto."
  ],
  rhythm: [
    "O segredo do ritmo é o pé. Você está batendo o pé no tempo?",
    "Tente contar em voz alta: '1 e 2 e 3 e 4 e'. Isso ajuda a sincronizar a mão direita.",
    "Se estiver rápido demais, diminua o BPM. É melhor tocar lento e certo do que rápido e errado."
  ],
  motivation: [
    "Não desista! Até o Jimi Hendrix teve que aprender o Dó Maior um dia.",
    "A prática consistente vence o talento. 15 minutos hoje valem mais que 2 horas no domingo.",
    "Errar faz parte. O erro é o degrau para o acerto. Tente de novo, mais devagar."
  ],
  unknown: [
    "Ainda estou aprendendo essa parte da teoria musical. Pode tentar reformular?",
    "Interessante... Não tenho certeza, mas sugiro focar na postura por enquanto.",
    "Minha rede neural está processando... Tente perguntar sobre 'Postura', 'Afinação' ou 'Ritmo'."
  ]
};
