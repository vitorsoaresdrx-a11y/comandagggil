import { useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { 
  Comanda, 
  ItemComanda, 
  CARDAPIO, 
  CategoriaCardapio, 
  CATEGORIAS_LABELS 
} from '@/types/comanda';
import { FecharComandaModal } from './FecharComandaModal';

interface ComandaEditorProps {
  comanda: Comanda;
  onBack: () => void;
  onUpdate: (id: number, itens: ItemComanda[]) => void;
  onFechar: (id: number, formaPagamento: string) => void;
  onRemover: (id: number) => void;
}

export function ComandaEditor({ 
  comanda, 
  onBack, 
  onUpdate, 
  onFechar,
  onRemover 
}: ComandaEditorProps) {
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaCardapio>('espetinhos');
  const [showFechar, setShowFechar] = useState(false);

  const adicionarItem = (nome: string, preco: number) => {
    const novoItens = [...comanda.itens];
    const existente = novoItens.find(i => i.nome === nome);
    
    if (existente) {
      existente.quantidade++;
    } else {
      novoItens.push({ nome, preco, quantidade: 1 });
    }
    
    onUpdate(comanda.id, novoItens);
  };

  const alterarQuantidade = (nome: string, delta: number) => {
    const novoItens = comanda.itens
      .map(i => (i.nome === nome ? { ...i, quantidade: i.quantidade + delta } : i))
      .filter(i => i.quantidade > 0);
    
    onUpdate(comanda.id, novoItens);
  };

  const categorias = Object.keys(CARDAPIO) as CategoriaCardapio[];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-bold text-lg">
            <span className="text-primary">#{comanda.id}</span> - {comanda.cliente}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(comanda.total)}</p>
        </div>
      </div>

      {/* Categorias */}
      <div className="flex gap-1 p-2 overflow-x-auto scrollbar-hide bg-secondary/50 border-b border-border">
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            className={cn(
              'tab-button whitespace-nowrap text-sm',
              categoriaAtiva === cat && 'active'
            )}
          >
            {CATEGORIAS_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Grid de produtos */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {CARDAPIO[categoriaAtiva].map(item => (
            <button
              key={item.nome}
              className="product-card text-left"
              onClick={() => adicionarItem(item.nome, item.preco)}
            >
              <p className="font-medium text-sm text-foreground truncate">{item.nome}</p>
              <p className="text-primary font-bold">{formatCurrency(item.preco)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de itens */}
      {comanda.itens.length > 0 && (
        <div className="border-t border-border bg-card">
          <div className="p-3 border-b border-border flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span className="font-medium">Itens da Comanda</span>
          </div>
          <div className="max-h-48 overflow-y-auto p-2 space-y-2">
            {comanda.itens.map(item => (
              <div 
                key={item.nome} 
                className="flex items-center justify-between bg-secondary rounded-lg p-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.nome}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatCurrency(item.preco * item.quantidade)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="quantity-btn-minus"
                    onClick={() => alterarQuantidade(item.nome, -1)}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold">{item.quantidade}</span>
                  <button
                    className="quantity-btn-plus"
                    onClick={() => alterarQuantidade(item.nome, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-border bg-card flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onRemover(comanda.id)}
        >
          Cancelar
        </Button>
        <Button 
          className="flex-1"
          disabled={comanda.itens.length === 0}
          onClick={() => setShowFechar(true)}
        >
          Fechar Comanda
        </Button>
      </div>

      <FecharComandaModal
        open={showFechar}
        comanda={comanda}
        onClose={() => setShowFechar(false)}
        onConfirm={(formaPagamento) => {
          onFechar(comanda.id, formaPagamento);
          setShowFechar(false);
          onBack();
        }}
      />
    </div>
  );
}
