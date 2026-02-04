
import { FeatureItem, INITIAL_FEATURES, FeatureStatus } from '../data/featureRegistry.ts';
import { supabase } from '../lib/supabaseClient.ts';

const CONFIG_KEY = 'feature_flags';

export const orchestratorService = {
  async getFeatures(): Promise<FeatureItem[]> {
    try {
      const { data, error } = await supabase
        .from('system_configs')
        .select('value')
        .eq('key', CONFIG_KEY)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // First Boot: Provisiona features no banco
        await supabase.from('system_configs').upsert({
          key: CONFIG_KEY,
          value: INITIAL_FEATURES,
          description: 'Orchestrator Feature Flags'
        });
        return INITIAL_FEATURES;
      }

      // Garante que o retorno seja um array
      const val = data.value;
      return Array.isArray(val) ? (val as FeatureItem[]) : INITIAL_FEATURES;
    } catch (e) {
      console.warn("[Orchestrator] Cache Fallback:", e);
      return INITIAL_FEATURES;
    }
  },

  async toggleFeature(id: string): Promise<FeatureItem[]> {
    const features = await this.getFeatures();
    const updated = features.map(f => {
      if (f.id === id && f.toggleable) {
        return { ...f, isActive: !f.isActive };
      }
      return f;
    });

    const { error } = await supabase
      .from('system_configs')
      .update({ value: updated, updated_at: new Date().toISOString() })
      .eq('key', CONFIG_KEY);

    if (error) throw error;
    return updated;
  },

  async updateStatus(id: string, newStatus: FeatureStatus): Promise<FeatureItem[]> {
    const features = await this.getFeatures();
    const updated = features.map(f => f.id === id ? { ...f, status: newStatus } : f);
    
    await supabase.from('system_configs')
      .update({ value: updated, updated_at: new Date().toISOString() })
      .eq('key', CONFIG_KEY);
      
    return updated;
  },

  async runDiagnostic(id: string): Promise<'Pass' | 'Fail'> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const features = await this.getFeatures();
    const target = features.find(f => f.id === id);
    if (!target) return 'Fail';
    
    // Simula falha técnica baseada no status
    const failChance = (target.status === 'broken' || target.status === 'maintenance') ? 0.6 : 0.02;
    return Math.random() > failChance ? 'Pass' : 'Fail';
  }
};
