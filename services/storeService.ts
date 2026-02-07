
import { supabase } from '../lib/supabaseClient.ts';
import { StoreItem, StoreOrder } from '../types.ts';

/**
 * CORE ECONOMY ENGINE - V4.0
 */

export const getAvatarAssets = async () => {
    const { data, error } = await supabase
        .from('avatar_assets')
        .select('*')
        .order('price_coins', { ascending: true });
    if (error) throw error;
    return data;
};

export const purchaseAsset = async (studentId: string, assetId: string, price: number) => {
    // 1. Verificação de Saldo Transacional (Simulada no client por agora, mas com check no banco)
    const { data: profile } = await supabase.from('profiles').select('coins').eq('id', studentId).single();
    
    if (!profile || profile.coins < price) {
        throw new Error("Saldo insuficiente");
    }

    // 2. Transação: Deduz moedas e Adiciona ao Inventário
    const newBalance = profile.coins - price;
    
    const { error: updateError } = await supabase.from('profiles').update({ coins: newBalance }).eq('id', studentId);
    if (updateError) throw updateError;

    const { error: invError } = await supabase.from('student_inventory').insert([{
        student_id: studentId,
        asset_id: assetId,
        acquired_at: new Date().toISOString()
    }]);

    if (invError) throw invError;

    return { newBalance };
};

export const getStudentInventory = async (studentId: string) => {
    const { data, error } = await supabase
        .from('student_inventory')
        .select('*, avatar_assets(*)')
        .eq('student_id', studentId);
    if (error) throw error;
    return data;
};

export const equipAsset = async (studentId: string, assetId: string) => {
    const { data: profile } = await supabase.from('profiles').select('metadata').eq('id', studentId).single();
    
    const updatedMetadata = {
        ...(profile?.metadata || {}),
        equipped_skin_id: assetId
    };

    const { error } = await supabase
        .from('profiles')
        .update({ metadata: updatedMetadata })
        .eq('id', studentId);
    
    if (error) throw error;
    return true;
};
