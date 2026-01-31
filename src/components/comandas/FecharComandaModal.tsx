import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { Comanda, FormaPagamento, FORMAS_PAGAMENTO } from '@/types/comanda';

interface FecharComandaModalProps {
  open: boolean;
  comanda: Comanda;
  onClose: () => void;
  onConfirm: (formaPagamento: FormaPagamento) => void;
}

export function FecharComandaModal({ 
  open, 
  comanda, 
  onClose, 
  onConfirm 
}: FecharComandaModalProps) {
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | null>(null);

  const handleConfirm = () => {
    if (formaPagamento) {
      onConfirm(formaPagamento);
      setFormaPagamento(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Fechar Comanda #{comanda.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo */}
          <div className="bg-secondary rounded-lg p-4">
            <p className="font-medium mb-2">Cliente: {comanda.cliente}</p>
            <div className="space-y-1 text-sm">
              {comanda.itens.map(item => (
                <div key={item.nome} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.quantidade}x {item.nome}
                  </span>
                  <span>{formatCurrency(item.preco * item.quantidade)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold text-primary text-lg">
                {formatCurrency(comanda.total)}
              </span>
            </div>
          </div>

          {/* Formas de pagamento */}
          <div className="space-y-2">
            <p className="font-medium">Forma de Pagamento</p>
            <div className="grid grid-cols-2 gap-2">
              {FORMAS_PAGAMENTO.map(forma => (
                <button
                  key={forma.value}
                  className={cn(
                    'payment-option',
                    formaPagamento === forma.value && 'selected'
                  )}
                  onClick={() => setFormaPagamento(forma.value)}
                >
                  <span className="text-xl">{forma.icon}</span>
                  <span className="font-medium">{forma.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Botão finalizar - SEMPRE visível após selecionar pagamento */}
          {formaPagamento && (
            <Button 
              className="w-full animate-fade-in" 
              size="lg"
              onClick={handleConfirm}
            >
              Finalizar Comanda
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
