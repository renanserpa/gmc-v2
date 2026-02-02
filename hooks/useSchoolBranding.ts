import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabaseClient.ts';

/**
 * useSchoolBranding
 * Escuta mudanças de Tenant no Kernel e atualiza o CSS :root em tempo real.
 * Injeta variáveis que adaptam todo o Design System (Tailwind + Componentes).
 */
export function useSchoolBranding() {
    const { schoolId } = useAuth();

    useEffect(() => {
        // Reset para o padrão Olie Music se não houver escola selecionada
        const resetBranding = () => {
            document.documentElement.style.setProperty('--brand-primary', '#38bdf8');
            document.documentElement.style.setProperty('--primary-color', '#38bdf8'); // Alias de compatibilidade
            document.documentElement.style.setProperty('--brand-secondary', '#0f172a');
            document.documentElement.style.setProperty('--brand-radius', '24px');
        };

        if (!schoolId) {
            resetBranding();
            return;
        }

        const fetchBranding = async () => {
            try {
                const { data, error } = await supabase
                    .from('schools')
                    .select('branding')
                    .eq('id', schoolId)
                    .single();

                if (error) throw error;

                if (data?.branding) {
                    const b = data.branding;
                    
                    // Injeção Reativa de Variáveis CSS
                    if (b.primaryColor) {
                        document.documentElement.style.setProperty('--brand-primary', b.primaryColor);
                        document.documentElement.style.setProperty('--primary-color', b.primaryColor);
                    }
                    
                    if (b.secondaryColor) {
                        document.documentElement.style.setProperty('--brand-secondary', b.secondaryColor);
                    }
                    
                    if (b.borderRadius) {
                        document.documentElement.style.setProperty('--brand-radius', b.borderRadius);
                    }
                    
                    console.debug(`%c[Maestro Style] White Label Ativado: ${b.primaryColor}`, `color: ${b.primaryColor}; font-weight: bold;`);
                }
            } catch (err) {
                console.warn("[Maestro Style] Falha ao carregar branding, usando fallback.", err);
                resetBranding();
            }
        };

        fetchBranding();
    }, [schoolId]);
}