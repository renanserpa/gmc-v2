
export const config = {
  supabase: {
    url: 'https://omguwpcdhrhaekptmrwq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZ3V3cGNkaHJoYWVrcHRtcndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTEwMDAsImV4cCI6MjA3ODk2NzAwMH0.i5RFo_mT7gsx2lwAP0mpm--9pMSB87xaHLLrdcGrfrs',
  },
  app: {
    name: 'OlieMusic GCM',
    version: 'v1.2-Stable',
    description: 'Plataforma de ensino musical gamificada com engine de áudio profissional.',
  },
  theme: {
    colors: {
      primary: '#38bdf8',    // sky-400
      secondary: '#a78bfa',  // purple-400
      accent: '#facc15',     // amber-400
      success: '#34d399',    // emerald-400
      error: '#f87171',      // red-400
    },
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Toby',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe'
    ],
    instruments: [
      { id: 'Violão', label: 'Violão' },
      { id: 'Guitarra', label: 'Guitarra' },
      { id: 'Ukulele', label: 'Ukulele' },
      { id: 'Canto', label: 'Canto' }
    ]
  },
  gamification: {
    levels: [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700],
    defaultXpReward: 30,
    lessonXpReward: 40,
    achievementXpBonus: 50,
    coinRatio: 0.1,
  },
  messages: {
    greetings: ["Olá! Vamos tocar algo hoje?", "Olá Mestre! Qual a dúvida musical de hoje?"],
    tuning: ["Parece que você quer afinar. Corda 6 é Mi (E).", "Afinação é a base. Use o afinador do app."],
    posture: ["Mão em Concha: Espaço entre palma e braço.", "Coluna reta para evitar fadiga."],
    motivation: ["Errar faz parte do progresso.", "O erro é o degrau para o acerto."],
    unknown: ["Ainda estou processando... Tente perguntar sobre 'Postura' ou 'Ritmo'."]
  }
};
