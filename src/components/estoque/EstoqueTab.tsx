import { useState } from 'react';
import { Plus, AlertTriangle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn, formatCurrency } from '@/lib/utils';
import { ItemEstoque } from '@/types/comanda';
import { ConfigurarEstoqueModal } from './ConfigurarEstoqueModal';

interface EstoqueTabProps {
  estoque: ItemEstoque[];
  estoqueConfigurado: boolean;
  onConfigurar: (itens: ItemEstoque[]) => void;
  onRepor: (nome: string, quantidade: number) => void;
  onAtualizarCusto: (nome: string, custo: number) => void;
}

export function EstoqueTab({ 
  estoque, 
  estoqueConfigurado, 
  onConfigurar, 
  onRepor,
  onAtualizarCusto
}: EstoqueTabProps) {
  const [showConfigurar, setShowConfigurar] = useState(!estoqueConfigurado);
  const [reporItem, setReporItem] = useState<string | null>(null);
  const [reporQuantidade, setReporQuantidade] = useState('');

  const handleRepor = () => {
    if (reporItem && reporQuantidade) {
      onRepor(reporItem, parseInt(reporQuantidade));
      setReporItem(null);
      setReporQuantidade('');
    }
  };

  const calcularMargem = (item: ItemEstoque) => {
    if (item.precoCusto === 0) return 0;
    return ((item.precoVenda - item.precoCusto) / item.precoVenda) * 100;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Controle de Estoque</h2>
        <Button variant="outline" size="sm" onClick={() => setShowConfigurar(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Reconfigurar
        </Button>
      </div>

      {!estoqueConfigurado ? (
        <ConfigurarEstoqueModal
          open={showConfigurar}
          onConfirm={(itens) => {
            onConfigurar(itens);
            setShowConfigurar(false);
          }}
        />
      ) : (
        <>
          <div className="space-y-2">
            {estoque.map(item => {
              const margem = calcularMargem(item);
              const lucroUnidade = item.precoVenda - item.precoCusto;
              const estoqueBaixo = item.quantidade < 5;

              return (
                <div 
                  key={item.nome} 
                  className={cn('stock-row', estoqueBaixo && 'stock-low')}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{item.nome}</span>
                      {estoqueBaixo && (
                        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span>Custo: {formatCurrency(item.precoCusto)}</span>
                      <span>Venda: {formatCurrency(item.precoVenda)}</span>
                      <span>Margem: {margem.toFixed(1)}%</span>
                      <span className="text-success">Lucro: {formatCurrency(lucroUnidade)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={cn(
                        'text-xl font-bold',
                        estoqueBaixo && 'text-destructive'
                      )}>
                        {item.quantidade}
                      </p>
                      <p className="text-xs text-muted-foreground">unidades</p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => setReporItem(item.nome)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Repor Estoque */}
          <Dialog open={!!reporItem} onOpenChange={() => setReporItem(null)}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Repor Estoque</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground">{reporItem}</p>
                <Input
                  type="number"
                  min="1"
                  value={reporQuantidade}
                  onChange={e => setReporQuantidade(e.target.value)}
                  placeholder="Quantidade a adicionar"
                  autoFocus
                />
                <Button className="w-full" onClick={handleRepor} disabled={!reporQuantidade}>
                  Adicionar ao Estoque
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <ConfigurarEstoqueModal
            open={showConfigurar}
            onConfirm={(itens) => {
              onConfigurar(itens);
              setShowConfigurar(false);
            }}
          />
        </>
      )}
    </div>
  );
}
