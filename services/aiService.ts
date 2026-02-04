
import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types.ts";
// Added missing import for SessionStats from audioPro
import { SessionStats } from "../lib/audioPro.ts";

export const aiPedagogy = {
    async getLessonDynamic(topic: string, ageGroup: string, vibe: string = 'standard') {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const styleContext = vibe === 'rock' ? "Use analogias de rockstar, guitarras distorcidas e ritmo de bateria." :
                                 vibe === 'classical' ? "Use analogias de orquestra, pianos de cauda e partituras clássicas." :
                                 "Foque em sintetizadores e tecnologia.";

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Aja como um mestre em pedagogia musical (Metodologia Renan Serpa). 
                Estilo atual da aula: ${vibe.toUpperCase()}. ${styleContext}
                Sugira uma dinâmica curta (5 min) para o tópico "${topic}" para crianças de ${ageGroup}.`,
                config: { temperature: 0.8 }
            });
            return response.text;
        } catch (e) {
            return "Erro ao sintonizar rede neural Maestro.";
        }
    },

    async generateCustomExercise(goal: string, difficulty: string) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `Gere um código AlphaTex para um exercício de violão focado em: "${goal}". Dificuldade: ${difficulty}. Retorne apenas o código AlphaTex.`,
                config: { thinkingConfig: { thinkingBudget: 2000 } }
            });
            return response.text?.trim() || "1.6 2.6 3.6 4.6 | 1.5 2.5 3.5 4.5";
        } catch (e) {
            return "1.6 2.6 3.6 4.6 | 1.5 2.5 3.5 4.5"; 
        }
    },

    async generateParentReport(studentName: string, recentXp: number, instrument: string, stats: any) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Persona: Maestro Renan Serpa. Escreva um feedback acolhedor para os pais do aluno ${studentName}. 
                Instrumento: ${instrument}. XP da semana: ${recentXp}. 
                Mencione evolução e use emojis musicais. Seja diplomático e inspirador. Máximo 100 palavras.`,
            });
            return response.text;
        } catch (e) {
            return "O aluno está progredindo muito bem na jornada musical! Continue incentivando o hábito da prática diária.";
        }
    }
};

export const generateNeuralArt = async (prompt: string) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: prompt,
            config: {
                imageConfig: { aspectRatio: "16:9" }
            }
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        return null;
    }
};

export const getMaestroAdvice = async (student: Student) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Persona: Maestro Renan Serpa. Dê uma dica rápida técnica ou motivacional para um aluno de ${student.instrument} nível ${student.current_level}.`,
        });
        return response.text;
    } catch (e) { 
        return "Respire, sinta o pulso e deixe a música fluir naturalmente!"; 
    }
};

export const getCreativeLyrics = async (degrees: string[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Componha uma letra curta (4 versos) para uma música baseada nesta progressão de graus: ${degrees.join('-')}.`,
        });
        return response.text;
    } catch (e) { 
        return "A melodia está nascendo em silêncio..."; 
    }
};

export const getParentEducationalInsight = async (studentActivity: string) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Explique pedagogicamente a importância desta atividade para o desenvolvimento cerebral infantil: "${studentActivity}". Use referências de Suzuki ou Gordon.`,
        });
        return response.text;
    } catch (e) { 
        return "A repetição consciente é a base para a fluência rítmica e cognitiva."; 
    }
};

/**
 * DNA OLIE: Analisa a performance da sessão de prática e gera um feedback reativo via IA.
 */
export const getPracticeSessionFeedback = async (studentName: string, stats: SessionStats, bpm: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Persona: Maestro Renan Serpa. Analise os resultados desta sessão de prática e dê um feedback encorajador e técnico para o aluno ${studentName}.
            Estatísticas:
            - Duração: ${stats.durationSeconds}s
            - Precisão Média: ${stats.averagePrecision.toFixed(1)}%
            - Combo Máximo: ${stats.maxCombo}
            - Fator de Flow: ${stats.flowFactor.toFixed(2)}
            - BPM: ${bpm}
            
            Seja breve (máximo 60 palavras) e use emojis musicais.`,
        });
        return response.text || "Ótima sessão! Continue praticando para masterizar sua técnica. 🎸✨";
    } catch (e) {
        return "Ótima sessão! Continue praticando para masterizar sua técnica. 🎸✨";
    }
};
