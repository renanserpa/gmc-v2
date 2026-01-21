
import JSZip from 'jszip';
import { supabase } from './supabaseClient';

export interface ExtractedTrack {
    name: string;
    type: 'vocals' | 'drums' | 'bass' | 'backing';
    file: Blob;
    status: 'idle' | 'uploading' | 'success' | 'error';
    progress: number;
}

export class MaestroUploadEngine {
    /**
     * Auto-Metadata: Simula integração com AcoustID / Spotify Web API
     */
    static async detectMetadata(fileName: string): Promise<{ bpm: number, key: string }> {
        // Simulação de delay de processamento de áudio (FFT/Peak Detection)
        await new Promise(r => setTimeout(r, 1500));
        
        // Lógica heurística simples baseada em strings para o protótipo
        const isRock = fileName.toLowerCase().includes('rock');
        const isPop = fileName.toLowerCase().includes('pop');

        return {
            bpm: isRock ? 140 : isPop ? 110 : 120,
            key: isRock ? 'Em' : 'C'
        };
    }

    static async processZip(zipFile: File): Promise<ExtractedTrack[]> {
        const zip = new JSZip();
        const content = await zip.loadAsync(zipFile);
        const tracks: ExtractedTrack[] = [];

        for (const [filename, fileData] of Object.entries(content.files)) {
            const zipObject = fileData as any;
            if (zipObject.dir || !filename.match(/\.(mp3|wav|m4a|flac)$/i)) continue;

            const blob = await zipObject.async('blob');
            let type: ExtractedTrack['type'] = 'backing';

            if (filename.match(/vocals|voice/i)) type = 'vocals';
            else if (filename.match(/drums|perc/i)) type = 'drums';
            else if (filename.match(/bass/i)) type = 'bass';

            tracks.push({
                name: filename.split('/').pop() || filename,
                type,
                file: blob,
                status: 'idle',
                progress: 0
            });
        }
        return tracks;
    }

    static async uploadTrack(professorId: string, songId: string, track: ExtractedTrack, onProgress: (p: number) => void): Promise<string> {
        const fileExt = track.name.split('.').pop();
        const filePath = `${professorId}/${songId}/${track.type}_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('song-stems').upload(filePath, track.file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('song-stems').getPublicUrl(filePath);
        return publicUrl;
    }
}
