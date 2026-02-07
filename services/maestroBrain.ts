
import { supabase } from '../lib/supabaseClient.ts';
import { notify } from '../lib/notification.ts';
import { MESSAGES } from '../config/constants.ts';

export type MaestroResponse = {
  text: string;
  action?: 'SHOW_TUNER' | 'OPEN_METRONOME' | 'SUGGEST_BREAK' | 'NONE';
  emotion?: 'happy' | 'thinking' | 'concerned' | 'celebrating';
};

const detectIntent = (input: string): keyof typeof MESSAGES => {
  const text = input.toLowerCase();

  if (text.includes('olá') || text.includes('oi') || text.includes('bom dia') || text.includes('boa tarde')) return 'greetings';
  if (text.includes('afina') || text.includes('tom') || text.includes('corda')) return 'tuning';
  if (text.includes('postura') || text.includes('mão') || text.includes('dedo') || text.includes('braço')) return 'posture';
  if (text.includes('dor') || text.includes('doendo') || text.includes('machuca')) return 'pain';
  if (text.includes('ritmo') || text.includes('tempo') || text.includes('rápido') || text.includes('lento') || text.includes('bpm')) return 'rhythm';
  if (text.includes('desistir') || text.includes('difícil') || text.includes('chato') || text.includes('consigo')) return 'motivation';
  
  return 'unknown';
};

export const maestroBrain = {
  /**
   * Verifica se o usuário logado tem privilégios de Super Admin.
   * Isso é usado para habilitar ferramentas de debug em todo o ecossistema.
   */
  canBypassRLS: async (): Promise<boolean> => {
    // FIX: Cast supabase.auth to any to resolve getUser() missing property error
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) return false;
    
    // Verifica por email root ou por role no banco
    if (user.email === 'serparenan@gmail.com' || user.email === 'adm@adm.com') return true;

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    return profile?.role === 'super_admin';
  },

  ask: async (question: string): Promise<string> => {
    const delay = Math.floor(Math.random() * 900) + 600;
    await new Promise(resolve => setTimeout(resolve, delay));

    const intent = detectIntent(question);
    const responses = MESSAGES[intent];
    const responseText = responses[Math.floor(Math.random() * responses.length)];

    return responseText;
  },

  analyzePerformance: (errors: number, duration: number) => {
    if (errors > 5) return "Notei que esse trecho está difícil. Que tal reduzirmos a velocidade para 70%?";
    if (duration > 20 * 60) return "Você já praticou por 20 minutos! Ótimo foco. Lembre-se de beber água.";
    return "Continue assim!";
  },
  
  ingestDocument: async (title: string, content: string): Promise<boolean> => {
    try {
        const tokenCount = content.split(' ').length;
        const { error } = await supabase.from('knowledge_docs').insert({
            title,
            content,
            tokens: tokenCount
        });

        if (error) throw error;

        notify.success("Documento assimilado pela Rede Neural!");
        return true;
    } catch (e) {
        console.error("Erro de ingestão:", e);
        notify.error("Falha ao treinar o cérebro do Maestro.");
        return false;
    }
  }
};
