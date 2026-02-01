import { supabase } from '@/integrations/supabase/client'
import { ItemComanda } from '@/types/comanda'

export async function salvarItensComanda(
  comandaId: number,
  itens: ItemComanda[]
) {
  // Update the comandas table with the new items
  const total = itens.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
  
  return supabase
    .from('comandas')
    .update({ 
      itens: itens as unknown as import('@/integrations/supabase/types').Json,
      total 
    })
    .eq('id', comandaId)
}
