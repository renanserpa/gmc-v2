import { GoogleGenAI } from "@google/genai";
import { supabase } from "../lib/supabaseClient";
import { LessonStep } from "../types";
import { notify } from "../lib/notification";

export const lessonGenerator = {
    async generateFromAcademyTopic(professorId: string, topic: string): Promise<string | null> {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            notify.info("Maestro AI está compondo novos exercícios baseados no seu estudo...");

            const prompt = `
                Você é o Assistente Pedagógico da OlieMusic.
                O professor acabou de completar o curso sobre "${topic}".
                Crie um exercício de guitarra/violão LÚDICO para crianças de 7-10 anos baseado neste tema.
                Use a metáfora do personagem "Lucca" (nosso mascote).
                
                Retorne apenas um JSON válido com a seguinte estrutura:
                {
                    "title": "Título da Aventura",
                    "description": "Narrativa lúdica do exercício",
                    "alphaTex": "Conteúdo AlphaTab (ex: \\\\tuning E2 A2 D3 G3 B3 E4 . 0.6 2.6)",
                    "target_bpm": 80,
                    "reward_xp": 150
                }
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });

            const resultText = response.text;
            if (!resultText) throw new Error("IA retornou resposta vazia");

            const data = JSON.parse(resultText);

            const step: LessonStep = {
                id: `gen_${Date.now()}`,
                title: data.title,
                type: 'exercise',
                duration_mins: 15,
                content: data.alphaTex,
                metadata: {
                    target_bpm: data.target_bpm,
                    reward_xp: data.reward_xp
                }
            };

            const { data: lesson, error } = await supabase
                .from('lessons')
                .insert({
                    professor_id: professorId,
                    title: `[IA] ${data.title}`,
                    description: data.description,
                    steps: [step]
                } as any)
                .select()
                .single();

            if (error) throw error;

            notify.success(`Nova aula "${data.title}" gerada e adicionada ao seu catálogo!`);
            return (lesson as any).id;

        } catch (e) {
            console.error("[LessonGenerator] Error:", e);
            notify.error("O Maestro AI desafinou ao gerar o material. Tente novamente.");
            return null;
        }
    }
};