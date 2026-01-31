import { Comanda } from '@/types/comanda';
import { formatCurrency } from '@/lib/utils';

interface ComandaCardProps {
  comanda: Comanda;
  onClick: () => void;
}

export function ComandaCard({ comanda, onClick }: ComandaCardProps) {
  return (
    <div className="comanda-card animate-fade-in" onClick={onClick}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-primary">#{comanda.id}</span>
        <span className="text-xs text-muted-foreground">
          {comanda.itens.length} {comanda.itens.length === 1 ? 'item' : 'itens'}
        </span>
      </div>
      <h3 className="font-medium text-foreground mb-2 truncate">{comanda.cliente}</h3>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-foreground">
          {formatCurrency(comanda.total)}
        </span>
      </div>
    </div>
  );
}
