// src/services/maestroBrain.ts
import { supabase } from '../lib/supabaseClient.ts';
import { notify } from '../lib/notification.ts';

// Tipos de resposta do Maestro
export type MaestroResponse = {
  text: string;
  action?: 'SHOW_TUNER' | 'OPEN_METRONOME' | 'SUGGEST_BREAK' | 'NONE';
  emotion?: 'happy' | 'thinking' | 'concerned' | 'celebrating';
};

// Base de Conhecimento Local (Simulando uma IA para resposta imediata)
const KNOWLEDGE_BASE = {
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

// Função auxiliar para detectar palavras-chave
const detectIntent = (input: string): keyof typeof KNOWLEDGE_BASE => {
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
    
    // 3. Seleciona uma resposta aleatória da categoria
    const responses = KNOWLEDGE_BASE[intent];
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