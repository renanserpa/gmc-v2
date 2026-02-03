
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabaseClient.ts';

/**
 * useSchoolTheme
 * Motor de injeção de CSS dinâmico e branding. 
 * Centraliza a identidade visual do Tenant no Kernel.
 */
export function useSchoolTheme() {
    const { schoolId } = useAuth();

    useEffect(() => {
        const applyTheme = (branding: any) => {
            const root = document.documentElement;
            
            // Design Tokens Padrão Olie
            const themeMap: Record<string, string> = {
                '--brand-primary': branding?.primaryColor || '#38bdf8',
                '--brand-secondary': branding?.secondaryColor || '#0f172a',
                '--brand-radius': branding?.borderRadius || '24px',
                '--primary-glow': `${branding?.primaryColor || '#38bdf8'}33`
            };

            Object.entries(themeMap).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        };

        if (!schoolId) {
            applyTheme(null);
            return;
        }

        const fetchBranding = async () => {
            try {
                const { data, error } = await supabase
                    .from('schools')
                    .select('branding')
                    .eq('id', schoolId)
                    .single();

                if (!error && data?.branding) {
                    applyTheme(data.branding);
                }
            } catch (err) {
                console.warn("[Maestro Theme] Fallback to default branding applied.");
                applyTheme(null);
            }
        };

        fetchBranding();
    }, [schoolId]);
}
