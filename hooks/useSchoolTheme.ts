import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabaseClient.ts';

/**
 * useSchoolTheme
 * Motor de injeção de CSS dinâmico. 
 * Transforma dados JSONB do Supabase em identidade visual no navegador.
 */
export function useSchoolTheme() {
    const { schoolId } = useAuth();

    useEffect(() => {
        const applyTheme = (branding: any) => {
            const root = document.documentElement;
            
            // Mapeamento de Variáveis CSS
            const themeMap: Record<string, string> = {
                '--brand-primary': branding?.primaryColor || '#38bdf8',
                '--brand-secondary': branding?.secondaryColor || '#0f172a',
                '--brand-radius': branding?.borderRadius || '24px',
                '--primary-glow': `${branding?.primaryColor || '#38bdf8'}33` // 20% alpha para brilhos
            };

            Object.entries(themeMap).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        };

        if (!schoolId) {
            applyTheme(null); // Reset para o padrão Olie Music
            return;
        }

        // Busca reativa da identidade da escola
        const fetchBranding = async () => {
            const { data, error } = await supabase
                .from('schools')
                .select('branding')
                .eq('id', schoolId)
                .single();

            if (!error && data?.branding) {
                applyTheme(data.branding);
                console.debug(`%c[Maestro Theme] Aplicando identidade: ${schoolId}`, `color: ${data.branding.primaryColor}; font-weight: bold;`);
            }
        };

        fetchBranding();
    }, [schoolId]);
}