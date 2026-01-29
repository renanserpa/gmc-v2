export const config = {
  supabase: {
    url: 'https://omguwpcdhrhaekptmrwq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZ3V3cGNkaHJoYWVrcHRtcndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTEwMDAsImV4cCI6MjA3ODk2NzAwMH0.i5RFo_mT7gsx2lwAP0mpm--9pMSB87xaHLLrdcGrfrs',
  },
  app: {
    name: 'OlieMusic GCM',
    version: 'v1.1 Pilot-Stable',
    description: 'Plataforma de ensino musical gamificada com engine de áudio profissional.',
  },
  gamification: {
    levels: [
      0,    // Level 1
      100,  // Level 2
      250,  // Level 3
      450,  // Level 4
      700,  // Level 5
      1000, // Level 6
      1350, // Level 7
      1750, // Level 8
      2200, // Level 9
      2700, // Level 10
    ],
    defaultXpReward: 30,
    lessonXpReward: 40,
    achievementXpBonus: 50,
  }
};