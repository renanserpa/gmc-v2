// src/services/maestroBrain.ts
import { supabase } from '../lib/supabaseClient';
import { notify } from '../lib/notification';
// Importa as mensagens do novo arquivo de constantes
import { MESSAGES } from '../config/constants';

// Tipos de resposta do Maestro
export type MaestroResponse = {
  text: string;
  action?: 'SHOW_TUNER' | 'OPEN_METRONOME' | 'SUGGEST_BREAK' | 'NONE';
  emotion?: 'happy' | 'thinking' | 'concerned' | 'celebrating';
};

// Função auxiliar para detectar palavras-chave
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
   * Processa uma pergunta do usuário e retorna uma resposta pedagógica.
   * Simula um tempo de processamento para parecer natural.
   */
  ask: async (question: string): Promise<string> => {
    // 1. Simula delay de "pensamento" da IA (entre 600ms e 1500ms)
    const delay = Math.floor(Math.random() * 900) + 600;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 2. Analisa a intenção
    const intent = detectIntent(question);
    
    // 3. Seleciona uma resposta aleatória da categoria usando o MESSAGES importado
    const responses = MESSAGES[intent];
    const responseText = responses[Math.floor(Math.random() * responses.length)];

    return responseText;
  },

  /**
   * (Futuro) Função para analisar dados de performance
   * Ex: Se o aluno errou muito, o Maestro sugere algo específico.
   */
  analyzePerformance: (errors: number, duration: number) => {
    if (errors > 5) return "Notei que esse trecho está difícil. Que tal reduzirmos a velocidade para 70%?";
    if (duration > 20 * 60) return "Você já praticou por 20 minutos! Ótimo foco. Lembre-se de beber água.";
    return "Continue assim!";
  },
  
  /**
   * Ingest a document into the knowledge base for the AI to learn from.
   */
  ingestDocument: async (title: string, content: string): Promise<boolean> => {
    try {
        const tokenCount = content.split(' ').length; // Simple token count
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
