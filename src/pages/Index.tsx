import { useState } from 'react';
import { Header } from '@/components/Header';
import { TabNavigation, TabId } from '@/components/TabNavigation';
import { ComandasTab } from '@/components/comandas/ComandasTab';
import { DashboardTab } from '@/components/dashboard/DashboardTab';
import { EstoqueTab } from '@/components/estoque/EstoqueTab';
import { PerdasTab } from '@/components/perdas/PerdasTab';
import { TaxasTab } from '@/components/taxas/TaxasTab';
import { RelatoriosTab } from '@/components/relatorios/RelatoriosTab';
import { useComandaStore } from '@/hooks/useComandaStore';
import { FormaPagamento } from '@/types/comanda';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('comandas');
  
  const store = useComandaStore();

  const handleReset = () => {
    store.resetarDia();
    toast.success('Dados do dia resetados com sucesso!');
  };

  const handleFecharComanda = (id: number, formaPagamento: string) => {
    store.fecharComanda(id, formaPagamento as FormaPagamento);
    toast.success('Comanda finalizada com sucesso!');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header onReset={handleReset} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'comandas' && (
          <ComandasTab
            comandas={store.comandas}
            onCriar={store.criarComanda}
            onAtualizar={store.atualizarComanda}
            onFechar={handleFecharComanda}
            onRemover={store.removerComanda}
          />
        )}
        
        {activeTab === 'dashboard' && (
          <DashboardTab
            getMetricasDia={store.getMetricasDia}
            getMetricasMes={store.getMetricasMes}
          />
        )}
        
        {activeTab === 'estoque' && (
          <EstoqueTab
            estoque={store.estoque}
            estoqueConfigurado={store.estoqueConfigurado}
            onConfigurar={store.configurarEstoqueInicial}
            onRepor={store.reporEstoque}
            onAtualizarCusto={store.atualizarCustoEstoque}
          />
        )}
        
        {activeTab === 'perdas' && (
          <PerdasTab
            perdas={store.getPerdasDia()}
            estoque={store.estoque}
            onRegistrar={store.registrarPerda}
          />
        )}
        
        {activeTab === 'taxas' && (
          <TaxasTab
            taxas={store.taxas}
            onSalvar={store.setTaxas}
          />
        )}
        
        {activeTab === 'relatorios' && (
          <RelatoriosTab
            getMetricasDia={store.getMetricasDia}
            getMetricasMes={store.getMetricasMes}
          />
        )}
      </main>
      
      <Toaster position="top-center" />
    </div>
  );
};

export default Index;
