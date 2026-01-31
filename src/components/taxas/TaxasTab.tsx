import { useState, useEffect } from 'react';
import { CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Taxas } from '@/types/comanda';

interface TaxasTabProps {
  taxas: Taxas;
  onSalvar: (taxas: Taxas) => void;
}

export function TaxasTab({ taxas, onSalvar }: TaxasTabProps) {
  const [valores, setValores] = useState(taxas);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    setValores(taxas);
  }, [taxas]);

  const handleSalvar = () => {
    onSalvar(valores);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="metric-card space-y-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Configuração de Taxas</h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Digite apenas o número (ex: 2.7 para 2.7%)
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="debito">Débito</Label>
            <div className="relative">
              <Input
                id="debito"
                type="number"
                min="0"
                step="0.1"
                value={valores.debito || ''}
                onChange={e => setValores(prev => ({ 
                  ...prev, 
                  debito: parseFloat(e.target.value) || 0 
                }))}
                placeholder="0"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credito">Crédito</Label>
            <div className="relative">
              <Input
                id="credito"
                type="number"
                min="0"
                step="0.1"
                value={valores.credito || ''}
                onChange={e => setValores(prev => ({ 
                  ...prev, 
                  credito: parseFloat(e.target.value) || 0 
                }))}
                placeholder="0"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pix">PIX</Label>
            <div className="relative">
              <Input
                id="pix"
                type="number"
                min="0"
                step="0.1"
                value={valores.pix || ''}
                onChange={e => setValores(prev => ({ 
                  ...prev, 
                  pix: parseFloat(e.target.value) || 0 
                }))}
                placeholder="0"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={handleSalvar}>
          {salvo ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Salvo!
            </>
          ) : (
            'Salvar Taxas'
          )}
        </Button>
      </div>
    </div>
  );
}
