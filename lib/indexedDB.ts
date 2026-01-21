
export interface AudioTake {
    id: string;
    blob: Blob;
    timestamp: number;
    title: string;
}

const DB_NAME = 'OlieMusicCache';
const STORE_NAME = 'audio_sketches';

export const audioDB = {
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async saveTake(take: AudioTake): Promise<void> {
        const db: any = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(take);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async updateTakeTitle(id: string, newTitle: string): Promise<void> {
        const db: any = await this.init();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const data = request.result;
                if (data) {
                    data.title = newTitle;
                    store.put(data);
                    resolve();
                }
            };
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async getLatest(limit: number = 5): Promise<AudioTake[]> {
        const db: any = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => {
                const results = request.result.sort((a: any, b: any) => b.timestamp - a.timestamp);
                resolve(results.slice(0, limit));
            };
            request.onerror = () => reject(request.error);
        });
    },

    async deleteTake(id: string): Promise<void> {
        const db: any = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
};
