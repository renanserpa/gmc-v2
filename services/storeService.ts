
import { supabase } from '../lib/supabaseClient';
import { StoreItem, StoreOrder } from '../types';

export const getStoreItems = async (): Promise<StoreItem[]> => {
  try {
    const { data, error } = await supabase
      .from('store_items')
      .select('*')
      .eq('is_active', true)
      .order('price_coins', { ascending: true });

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
};

export const fetchStoreItemsForStudent = getStoreItems;

export const purchaseStoreItem = async (params: { studentId: string; storeItemId: string }) => {
  try {
    // 1. Pegar preço do item
    const { data: item } = await supabase.from('store_items').select('price_coins').eq('id', params.storeItemId).single();
    if (!item) return { success: false, error: 'Item não encontrado.' };

    // 2. Pegar saldo do aluno
    const { data: student } = await supabase.from('students').select('coins').eq('id', params.studentId).single();
    if (!student || student.coins < item.price_coins) return { success: false, error: 'Saldo insuficiente.' };

    // 3. Deduzir moedas e criar pedido (Transação simulada)
    const { error: updateError } = await supabase.from('students').update({ coins: student.coins - item.price_coins }).eq('id', params.studentId);
    if (updateError) throw updateError;

    const { error: orderError } = await supabase.from('store_orders').insert([{
      player_id: params.studentId,
      store_item_id: params.storeItemId,
      coins_spent: item.price_coins,
      is_equipped: false
    }]);

    if (orderError) throw orderError;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getStudentInventory = async (studentId: string): Promise<StoreOrder[]> => {
  const { data, error } = await supabase
    .from('store_orders')
    .select('*, store_items(*)')
    .eq('player_id', studentId);
  
  if (error) return [];
  return data || [];
};

export const toggleEquipItem = async (orderId: string, studentId: string, currentStatus: boolean) => {
  try {
    // Se vamos equipar, desequipar outros do mesmo tipo (opcional, aqui simplificamos)
    if (!currentStatus) {
        // Logica para garantir apenas um item equipado se necessário
    }

    const { error } = await supabase
        .from('store_orders')
        .update({ is_equipped: !currentStatus })
        .eq('id', orderId)
        .eq('player_id', studentId);

    return { success: !error };
  } catch (e) {
    return { success: false };
  }
};
