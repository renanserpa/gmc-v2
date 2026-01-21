
class AudioManager {
    private static instance: AudioManager;
    private ctx: AudioContext | null = null;
    private activeListeners: Set<string> = new Set();

    private constructor() {}

    static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    async getContext(): Promise<AudioContext> {
        if (!this.ctx || this.ctx.state === 'closed') {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioContextClass({ 
                latencyHint: 'interactive', 
                sampleRate: 44100 
            });
        }
        
        // Passive check: We do NOT call resume() here automatically.
        // It's up to the AppLoader or specific user interactions to unlock audio.
        return this.ctx;
    }

    async requestAccess(componentId: string): Promise<AudioContext> {
        this.activeListeners.add(componentId);
        console.debug(`[AudioManager] Access granted to ${componentId}. Active: ${this.activeListeners.size}`);
        const ctx = await this.getContext();
        
        // If we are requesting access, it usually implies a component mounted
        // which might have been triggered by a user action. Try to resume.
        if (ctx.state === 'suspended') {
            try {
                await ctx.resume();
            } catch (e) {
                console.warn("[AudioManager] Resume failed (likely needs user gesture).");
            }
        }
        return ctx;
    }

    release(componentId: string) {
        this.activeListeners.delete(componentId);
        if (this.activeListeners.size === 0 && this.ctx && this.ctx.state !== 'closed') {
            this.ctx.suspend();
            console.debug(`[AudioManager] All listeners released. Context suspended.`);
        }
    }
    
    get state() {
        return this.ctx?.state || 'closed';
    }
}

export const audioManager = AudioManager.getInstance();
