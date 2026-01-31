import { useState } from 'react';
import { 
  DollarSign, 
  Receipt, 
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { FORMAS_PAGAMENTO, CATEGORIAS_LABELS, CategoriaCardapio } from '@/types/comanda';

interface DashboardTabProps {
  getMetricasDia: () => {
    totalVendas: number;
    totalTaxas: number;
    comandasFechadas: number;
    ticketMedio: number;
    porFormaPagamento: Record<string, { comandas: number; valor: number; taxas: number }>;
    porCategoria: Record<string, { quantidade: number; valor: number }>;
    produtosMaisVendidos: [string, { quantidade: number; valor: number }][];
  };
  getMetricasMes: () => {
    inicio: string;
    fim: string;
    totalVendas: number;
    totalComandas: number;
    ticketMedio: number;
  };
}

export function DashboardTab({ getMetricasDia, getMetricasMes }: DashboardTabProps) {
  const [filtro, setFiltro] = useState<'hoje' | 'mes'>('hoje');
  
  const metricasDia = getMetricasDia();
  const metricasMes = getMetricasMes();

  return (
    <div className="p-4 space-y-6">
      {/* Filtros */}
      <div className="flex gap-2">
        <button
          className={cn('tab-button', filtro === 'hoje' && 'active')}
          onClick={() => setFiltro('hoje')}
        >
          Hoje
        </button>
        <button
          className={cn('tab-button', filtro === 'mes' && 'active')}
          onClick={() => setFiltro('mes')}
        >
          Mês
        </button>
      </div>

      {filtro === 'hoje' ? (
        <>
          {/* Métricas principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total Vendas</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(metricasDia.totalVendas)}
              </p>
            </div>

            <div className="metric-card">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Comandas</span>
              </div>
              <p className="text-2xl font-bold">{metricasDia.comandasFechadas}</p>
            </div>

            <div className="metric-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Ticket Médio</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(metricasDia.ticketMedio)}</p>
            </div>

            <div className="metric-card">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-destructive" />
                <span className="text-sm text-muted-foreground">Taxas</span>
              </div>
              <p className="text-2xl font-bold text-destructive">
                -{formatCurrency(metricasDia.totalTaxas)}
              </p>
            </div>
          </div>

          {/* Vendas por forma de pagamento */}
          <div className="metric-card">
            <h3 className="font-bold mb-4">Vendas por Forma de Pagamento</h3>
            <div className="space-y-3">
              {FORMAS_PAGAMENTO.map(forma => {
                const dados = metricasDia.porFormaPagamento[forma.value];
                if (!dados) return null;
                return (
                  <div key={forma.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{forma.icon}</span>
                      <span>{forma.label}</span>
                      <span className="text-muted-foreground text-sm">
                        ({dados.comandas} {dados.comandas === 1 ? 'comanda' : 'comandas'})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{formatCurrency(dados.valor)}</span>
                      {dados.taxas > 0 && (
                        <span className="text-destructive text-sm ml-2">
                          (-{formatCurrency(dados.taxas)})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {Object.keys(metricasDia.porFormaPagamento).length === 0 && (
                <p className="text-muted-foreground text-center py-4">Nenhuma venda hoje</p>
              )}
            </div>
          </div>

          {/* Vendas por categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="metric-card">
              <h3 className="font-bold mb-4">Vendas por Categoria</h3>
              <div className="space-y-2">
                {Object.entries(metricasDia.porCategoria).map(([cat, dados]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span>{CATEGORIAS_LABELS[cat as CategoriaCardapio] || cat}</span>
                    <div className="text-right">
                      <span className="font-bold">{formatCurrency(dados.valor)}</span>
                      <span className="text-muted-foreground text-sm ml-2">
                        ({dados.quantidade}un)
                      </span>
                    </div>
                  </div>
                ))}
                {Object.keys(metricasDia.porCategoria).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">Nenhuma venda hoje</p>
                )}
              </div>
            </div>

            <div className="metric-card">
              <h3 className="font-bold mb-4">Produtos Mais Vendidos</h3>
              <div className="space-y-2">
                {metricasDia.produtosMaisVendidos.slice(0, 5).map(([nome, dados], i) => (
                  <div key={nome} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">{i + 1}º</span>
                      <span className="truncate">{nome}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{dados.quantidade}un</span>
                      <span className="text-muted-foreground text-sm ml-2">
                        ({formatCurrency(dados.valor)})
                      </span>
                    </div>
                  </div>
                ))}
                {metricasDia.produtosMaisVendidos.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">Nenhuma venda hoje</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="metric-card">
            <p className="text-sm text-muted-foreground mb-2">
              Período: {metricasMes.inicio} até {metricasMes.fim}
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendas</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(metricasMes.totalVendas)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Comandas</p>
                <p className="text-2xl font-bold">{metricasMes.totalComandas}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">{formatCurrency(metricasMes.ticketMedio)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
