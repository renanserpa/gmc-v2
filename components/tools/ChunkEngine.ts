
export interface Chunk {
    id: string;
    startMeasure: number;
    endMeasure: number;
    repeatsDone: number;
    isMastered: boolean;
}

export class ChunkEngine {
    private repeatsToMaster: number = 3;

    /**
     * Divide uma música em fatias de maestria (Ex: cada 4 compassos)
     */
    static generateChunks(totalMeasures: number, size: number = 4): Chunk[] {
        const chunks: Chunk[] = [];
        for (let i = 1; i <= totalMeasures; i += size) {
            chunks.push({
                id: `chunk_${i}`,
                startMeasure: i,
                endMeasure: Math.min(i + size - 1, totalMeasures),
                repeatsDone: 0,
                isMastered: false
            });
        }
        return chunks;
    }

    /**
     * Processa um acerto perfeito e retorna se o chunk foi dominado
     */
    static processAttempt(chunk: Chunk, isPerfect: boolean): { chunk: Chunk, justMastered: boolean } {
        if (!isPerfect) {
            return { chunk: { ...chunk, repeatsDone: 0 }, justMastered: false };
        }

        const newRepeats = chunk.repeatsDone + 1;
        const mastered = newRepeats >= 3;

        return {
            chunk: { 
                ...chunk, 
                repeatsDone: mastered ? 3 : newRepeats, 
                isMastered: mastered 
            },
            justMastered: mastered && !chunk.isMastered
        };
    }
}
