import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Comanda, ItemComanda, FormaPagamento } from '@/types/comanda';
import { NovaComandaModal } from './NovaComandaModal';
import { ComandaCard } from './ComandaCard';
import { ComandaEditor } from './ComandaEditor';

interface ComandasTabProps {
  comandas: Comanda[];
  onCriar: (cliente: string) => Comanda;
  onAtualizar: (id: number, itens: ItemComanda[]) => void;
  onFechar: (id: number, formaPagamento: FormaPagamento) => void;
  onRemover: (id: number) => void;
}

export function ComandasTab({ 
  comandas, 
  onCriar, 
  onAtualizar, 
  onFechar,
  onRemover
}: ComandasTabProps) {
  const [showNova, setShowNova] = useState(false);
  const [comandaAberta, setComandaAberta] = useState<number | null>(null);

  const comandaAtiva = comandas.find(c => c.id === comandaAberta);

  if (comandaAtiva) {
    return (
      <ComandaEditor
        comanda={comandaAtiva}
        onBack={() => setComandaAberta(null)}
        onUpdate={onAtualizar}
        onFechar={onFechar}
        onRemover={(id) => {
          onRemover(id);
          setComandaAberta(null);
        }}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Comandas Abertas</h2>
        <Button onClick={() => setShowNova(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Comanda
        </Button>
      </div>

      {comandas.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">Nenhuma comanda aberta</p>
          <p className="text-sm mt-1">Clique em "Nova Comanda" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {comandas.map(comanda => (
            <ComandaCard
              key={comanda.id}
              comanda={comanda}
              onClick={() => setComandaAberta(comanda.id)}
            />
          ))}
        </div>
      )}

      <NovaComandaModal
        open={showNova}
        onClose={() => setShowNova(false)}
        onConfirm={(cliente) => {
          const nova = onCriar(cliente);
          setComandaAberta(nova.id);
        }}
      />
    </div>
  );
}
