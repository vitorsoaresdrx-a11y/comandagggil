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

interface NovaComandaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (cliente: string) => Promise<void>;
}

export function NovaComandaModal({
  open,
  onClose,
  onConfirm,
}: NovaComandaModalProps) {
  const [cliente, setCliente] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim()) return;

    setLoading(true);

    try {
      await onConfirm(cliente.trim());
      setCliente('');
      onClose();
    } catch (error) {
      alert('Erro ao criar comanda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Comanda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cliente">Nome do Cliente</Label>
            <Input
              id="cliente"
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              placeholder="Digite o nome..."
              autoFocus
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!cliente.trim() || loading}>
              {loading ? 'Criando...' : 'Criar Comanda'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
