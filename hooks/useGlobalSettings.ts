import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.ts';

export function useGlobalSettings() {
    const [xpMultiplier, setXpMultiplier] = useState(1.0);
    const [activeBroadcast, setActiveBroadcast] = useState<string | null>(null);

    useEffect(() => {
        // 1. Busca Multiplicador Inicial (Mocked logic ou tabela config_global)
        const fetchConfig = async () => {
            const { data } = await supabase.from('knowledge_docs').select('content').eq('title', 'GLOBAL_XP_MULTIPLIER').maybeSingle();
            if (data) setXpMultiplier(parseFloat(data.content));
        };

        // 2. Escuta Broadcasts de Alerta Master
        // Fix: Explicitly cast 'postgres_changes' to any to avoid type overload mismatch in strict environments
        const channel = supabase.channel('global_broadcast')
            .on('postgres_changes' as any, { event: 'INSERT', table: 'notices', filter: 'target_audience=eq.all' } as any, (payload: any) => {
                setActiveBroadcast(payload.new.message);
            })
            .subscribe();

        fetchConfig();
        return () => { supabase.removeChannel(channel); };
    }, []);

    return { xpMultiplier, activeBroadcast, clearBroadcast: () => setActiveBroadcast(null) };
}
