import { useState } from 'react';
import { Minus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { Perda, ItemEstoque, CARDAPIO, MenuItem } from '@/types/comanda';

interface PerdasTabProps {
  perdas: Perda[];
  estoque: ItemEstoque[];
  onRegistrar: (produto: string, quantidade: number) => void;
}

export function PerdasTab({ perdas, estoque, onRegistrar }: PerdasTabProps) {
  const [registrarProduto, setRegistrarProduto] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState('');

  const todosItens: MenuItem[] = [
    ...CARDAPIO.espetinhos,
    ...CARDAPIO.kaftas,
    ...CARDAPIO.bebidas,
    ...CARDAPIO.cervejas,
    ...CARDAPIO.adicionais,
  ];

  const handleRegistrar = () => {
    if (registrarProduto && quantidade) {
      onRegistrar(registrarProduto, parseInt(quantidade));
      setRegistrarProduto(null);
      setQuantidade('');
    }
  };

  const totalPerdas = perdas.reduce((acc, p) => acc + p.custoTotal, 0);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Registro de Perdas</h2>
        {totalPerdas > 0 && (
          <div className="bg-destructive/20 text-destructive px-3 py-1 rounded-lg">
            Total: {formatCurrency(totalPerdas)}
          </div>
        )}
      </div>

      {/* Produtos para registrar perda */}
      <div className="space-y-2">
        <h3 className="font-medium text-muted-foreground">Registrar Nova Perda</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {todosItens.map(item => {
            const itemEstoque = estoque.find(e => e.nome === item.nome);
            return (
              <button
                key={item.nome}
                className="product-card text-left flex items-center justify-between"
                onClick={() => setRegistrarProduto(item.nome)}
              >
                <span className="text-sm truncate">{item.nome}</span>
                <span className="text-muted-foreground text-xs">
                  {itemEstoque?.quantidade || 0}un
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de perdas do dia */}
      <div className="space-y-2">
        <h3 className="font-medium text-muted-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Perdas de Hoje
        </h3>
        {perdas.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            Nenhuma perda registrada hoje
          </p>
        ) : (
          <div className="space-y-2">
            {perdas.map(perda => (
              <div key={perda.id} className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{perda.produto}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(perda.horario).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-destructive">
                      -{formatCurrency(perda.custoTotal)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {perda.quantidade} {perda.quantidade === 1 ? 'unidade' : 'unidades'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Registrar Perda */}
      <Dialog open={!!registrarProduto} onOpenChange={() => setRegistrarProduto(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar Perda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">{registrarProduto}</p>
            <Input
              type="number"
              min="1"
              value={quantidade}
              onChange={e => setQuantidade(e.target.value)}
              placeholder="Quantidade perdida"
              autoFocus
            />
            <Button 
              className="w-full" 
              variant="destructive" 
              onClick={handleRegistrar} 
              disabled={!quantidade}
            >
              <Minus className="w-4 h-4 mr-2" />
              Registrar Perda
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
