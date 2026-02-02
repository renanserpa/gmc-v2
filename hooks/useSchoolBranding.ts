import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

/**
 * useSchoolBranding
 * Injeta variáveis CSS no root do documento baseadas no Tenant ativo.
 */
export function useSchoolBranding() {
    const { schoolId } = useAuth();

    useEffect(() => {
        if (!schoolId) {
            // Reset para as cores padrão Olie Music
            document.documentElement.style.setProperty('--brand-primary', '#38bdf8');
            document.documentElement.style.setProperty('--brand-secondary', '#a78bfa');
            return;
        }

        const fetchBranding = async () => {
            const { data, error } = await supabase
                .from('schools')
                .select('branding')
                .eq('id', schoolId)
                .single();

            if (data?.branding) {
                const b = data.branding;
                document.documentElement.style.setProperty('--brand-primary', b.primaryColor);
                document.documentElement.style.setProperty('--brand-secondary', b.secondaryColor || '#000000');
                if (b.borderRadius) {
                    document.documentElement.style.setProperty('--brand-radius', b.borderRadius);
                }
            }
        };

        fetchBranding();
    }, [schoolId]);
}