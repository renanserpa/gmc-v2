import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types";
import { SessionStats } from "../lib/audioPro";

export const getMaestroStudyPlan = async (studentName: string, trends: SessionStats[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analise o progresso técnico de ${studentName} baseado nestas sessões de prática: ${JSON.stringify(trends)}. Gere um plano de estudo focado para a próxima semana seguindo a Metodologia Renan Serpa (Elefante/Passarinho).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        focusArea: { type: Type.STRING, description: 'pitch | rhythm | technique' },
                        xpReward: { type: Type.NUMBER },
                        maestroInsight: { type: Type.STRING }
                    },
                    required: ['title', 'description', 'focusArea', 'xpReward', 'maestroInsight']
                }
            }
        });
        
        const resultText = response.text;
        if (!resultText) throw new Error("Resposta da AI vazia.");
        return JSON.parse(resultText);
    } catch (e) {
        console.warn("[AI Service] Falha ao gerar plano, usando fallback de segurança.", e);
        return {
            title: "Rotina de Base Maestro",
            description: "Continue praticando os fundamentos de Elefante e Passarinho para consolidar sua técnica.",
            focusArea: "technique",
            xpReward: 50,
            maestroInsight: "A consistência transforma o talento em maestria. Mantenha o foco nos exercícios fundamentais."
        };
    }
};

export const getCrucibleChallenge = async (studentName: string, lastStats: SessionStats) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Crie um desafio épico "Boss Battle" para o aluno ${studentName} focado em corrigir estes desvios técnicos: ${JSON.stringify(lastStats?.noteHeatmap || {})}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        bossName: { type: Type.STRING },
                        task: { type: Type.STRING },
                        targetNotes: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        winCondition: { type: Type.STRING },
                        xpReward: { type: Type.NUMBER },
                        maestroWarning: { type: Type.STRING }
                    },
                    required: ['bossName', 'task', 'targetNotes', 'winCondition', 'xpReward', 'maestroWarning']
                }
            }
        });
        
        const resultText = response.text;
        return resultText ? JSON.parse(resultText) : null;
    } catch (e) {
        console.error("[AI Service] Erro ao gerar desafio Crucible:", e);
        return null;
    }
};

export const getPracticeSessionFeedback = async (studentName: string, stats: SessionStats, bpm: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `O aluno ${studentName} praticou a ${bpm} BPM. Estatísticas: ${JSON.stringify(stats)}. Dê um feedback técnico encorajador e curto em português (máx 120 caracteres). Fale sobre ressonância e groove.`,
        });
        return response.text || "Excelente foco hoje! Sinto que sua ressonância está evoluindo.";
    } catch (e) {
        return "Sua prática de hoje foi inspiradora. Continue mantendo o pulso firme!";
    }
};

export const getMaestroAdvice = async (student: Student) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Como Maestro Virtual da OlieMusic, dê um conselho técnico direto para um aluno de nível ${student.current_level} que toca ${student.instrument}. Use a metáfora do Elefante e Passarinho.`,
        });
        return response.text || "Sinta o peso do Elefante nas notas graves e a leveza do Passarinho nos agudos.";
    } catch (e) {
        return "A música vive no silêncio entre as notas. Respire e sinta o ritmo.";
    }
};

export const getParentEducationalInsight = async (activityType: string) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Gere uma curiosidade neurocientífica curta para pais sobre como a prática de "${activityType}" ajuda no desenvolvimento cognitivo de uma criança.`,
        });
        return response.text || "Estudos mostram que a prática rítmica fortalece as conexões neurais ligadas à lógica matemática.";
    } catch (e) {
        return "A música é a única atividade que ativa quase todas as áreas do cérebro simultaneamente.";
    }
};

export const getClassVerdict = async (hits: number, participants: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Numa jam coletiva, a turma atingiu ${hits} acertos com ${participants} alunos. Dê um veredito épico e curto em português.`,
        });
        return response.text || "A sinfonia de hoje vibrou em harmonia perfeita!";
    } catch (e) {
        return "Unidos pelo som, vocês criaram algo magnífico hoje.";
    }
};

export const getCreativeLyrics = async (chords: string[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Componha 4 versos rítmicos para crianças baseados nesta progressão harmônica: ${chords.join(' - ')}.`,
        });
        return response.text || "Vibrando no som que eu criei...\nNo ritmo do meu coração...";
    } catch (e) {
        return "Notas voam pelo ar,\nNossa canção vai começar!";
    }
};

export const getTechnicalIntervention = async (stats: SessionStats) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Sugira um ajuste técnico ou postural imediato para o aluno baseado nestes dados de erro: ${JSON.stringify(stats?.noteHeatmap || {})}. Curto e direto.`,
        });
        return response.text || "Tente relaxar os ombros e focar na ponta dos dedos.";
    } catch (e) {
        return "Verifique se o seu polegar está bem posicionado atrás do braço do violão.";
    }
};