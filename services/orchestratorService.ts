import { FeatureItem, INITIAL_FEATURES, FeatureStatus } from '../data/featureRegistry';

const STORAGE_KEY = 'maestro_feature_flags';

export const orchestratorService = {
  getFeatures(): FeatureItem[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FEATURES));
      return INITIAL_FEATURES;
    }
    return JSON.parse(stored);
  },

  updateStatus(id: string, newStatus: FeatureStatus): FeatureItem[] {
    const features = this.getFeatures();
    const updated = features.map(f => f.id === id ? { ...f, status: newStatus } : f);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  toggleFeature(id: string): FeatureItem[] {
    const features = this.getFeatures();
    const updated = features.map(f => {
      if (f.id === id && f.toggleable) {
        return { ...f, isActive: !f.isActive };
      }
      return f;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  async runDiagnostic(id: string): Promise<'Pass' | 'Fail'> {
    // Simula processamento de diagnóstico
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Heurística de falha mockada: 
    // Features em beta ou maintenance tem 30% de chance de falhar
    const features = this.getFeatures();
    const target = features.find(f => f.id === id);
    
    if (!target) return 'Fail';
    
    const failChance = (target.status === 'beta' || target.status === 'maintenance') ? 0.3 : 0.05;
    return Math.random() > failChance ? 'Pass' : 'Fail';
  }
};