import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CARDAPIO, ItemEstoque, MenuItem } from '@/types/comanda';
import { formatCurrency } from '@/lib/utils';

interface ConfigurarEstoqueModalProps {
  open: boolean;
  onConfirm: (itens: ItemEstoque[]) => void;
}

export function ConfigurarEstoqueModal({ open, onConfirm }: ConfigurarEstoqueModalProps) {
  const todosItens: MenuItem[] = [
    ...CARDAPIO.espetinhos,
    ...CARDAPIO.kaftas,
    ...CARDAPIO.bebidas,
    ...CARDAPIO.cervejas,
    ...CARDAPIO.adicionais,
  ];

  const [estoqueConfig, setEstoqueConfig] = useState<Record<string, { quantidade: number; custo: number }>>(
    todosItens.reduce((acc, item) => {
      acc[item.nome] = { quantidade: 0, custo: 0 };
      return acc;
    }, {} as Record<string, { quantidade: number; custo: number }>)
  );

  const handleSubmit = () => {
    const itensEstoque: ItemEstoque[] = todosItens.map(item => ({
      nome: item.nome,
      quantidade: estoqueConfig[item.nome]?.quantidade || 0,
      precoCusto: estoqueConfig[item.nome]?.custo || 0,
      precoVenda: item.preco,
    }));
    onConfirm(itensEstoque);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Estoque Inicial</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure a quantidade inicial e o preço de custo de cada produto.
          </p>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {todosItens.map(item => (
              <div key={item.nome} className="bg-secondary rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.nome}</span>
                  <span className="text-primary">{formatCurrency(item.preco)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Quantidade</Label>
                    <Input
                      type="number"
                      min="0"
                      value={estoqueConfig[item.nome]?.quantidade || ''}
                      onChange={e => setEstoqueConfig(prev => ({
                        ...prev,
                        [item.nome]: { 
                          ...prev[item.nome], 
                          quantidade: parseInt(e.target.value) || 0 
                        }
                      }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Custo (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={estoqueConfig[item.nome]?.custo || ''}
                      onChange={e => setEstoqueConfig(prev => ({
                        ...prev,
                        [item.nome]: { 
                          ...prev[item.nome], 
                          custo: parseFloat(e.target.value) || 0 
                        }
                      }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full" onClick={handleSubmit}>
            Salvar Configuração
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
