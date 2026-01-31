import { useState } from 'react';
import { FileText, TrendingUp, CreditCard, Package } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { FORMAS_PAGAMENTO, FormaPagamento } from '@/types/comanda';

interface RelatoriosTabProps {
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
    historicoDiario: { data: string; vendas: number; comandas: number }[];
  };
}

export function RelatoriosTab({ getMetricasDia, getMetricasMes }: RelatoriosTabProps) {
  const [filtro, setFiltro] = useState<'hoje' | 'mes'>('hoje');
  
  const metricasDia = getMetricasDia();
  const metricasMes = getMetricasMes();

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

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
        <div className="space-y-6">
          {/* Resumo */}
          <div className="metric-card">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Resumo - Hoje</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total em Vendas</span>
                <span className="font-bold text-primary">
                  {formatCurrency(metricasDia.totalVendas)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comandas Fechadas</span>
                <span className="font-bold">{metricasDia.comandasFechadas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket Médio</span>
                <span className="font-bold">{formatCurrency(metricasDia.ticketMedio)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Total em Taxas</span>
                <span className="font-bold text-destructive">
                  -{formatCurrency(metricasDia.totalTaxas)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Líquido</span>
                <span className="font-bold text-success">
                  {formatCurrency(metricasDia.totalVendas - metricasDia.totalTaxas)}
                </span>
              </div>
            </div>
          </div>

          {/* Formas de Pagamento */}
          <div className="metric-card">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Formas de Pagamento</h3>
            </div>
            <div className="space-y-3">
              {FORMAS_PAGAMENTO.map(forma => {
                const dados = metricasDia.porFormaPagamento[forma.value];
                if (!dados) return null;
                return (
                  <div key={forma.value} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <span>{forma.icon}</span>
                      <span>{forma.label}</span>
                      <span className="text-muted-foreground text-sm">
                        ({dados.comandas} {dados.comandas === 1 ? 'comanda' : 'comandas'})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{formatCurrency(dados.valor)}</span>
                      {dados.taxas > 0 && (
                        <p className="text-destructive text-xs">
                          Taxa: -{formatCurrency(dados.taxas)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {Object.keys(metricasDia.porFormaPagamento).length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma venda hoje
                </p>
              )}
            </div>
          </div>

          {/* Produtos Mais Vendidos */}
          <div className="metric-card">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Produtos Mais Vendidos</h3>
            </div>
            <div className="space-y-2">
              {metricasDia.produtosMaisVendidos.map(([nome, dados], i) => (
                <div key={nome} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <span>{nome}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{dados.quantidade}un</span>
                    <span className="text-muted-foreground ml-2">
                      {formatCurrency(dados.valor)}
                    </span>
                  </div>
                </div>
              ))}
              {metricasDia.produtosMaisVendidos.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma venda hoje
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resumo Mensal */}
          <div className="metric-card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Relatório Mensal</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Período: {formatarData(metricasMes.inicio)} até {formatarData(metricasMes.fim)}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(metricasMes.totalVendas)}
                </p>
                <p className="text-sm text-muted-foreground">Total Vendas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{metricasMes.totalComandas}</p>
                <p className="text-sm text-muted-foreground">Comandas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(metricasMes.ticketMedio)}</p>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
              </div>
            </div>

            {/* Histórico Diário */}
            <div className="space-y-2">
              <h4 className="font-medium text-muted-foreground">Vendas por Dia</h4>
              {metricasMes.historicoDiario.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum histórico disponível
                </p>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {metricasMes.historicoDiario.map(dia => (
                    <div 
                      key={dia.data} 
                      className="flex items-center justify-between py-2 px-3 bg-secondary rounded-lg"
                    >
                      <span>{formatarData(dia.data)}</span>
                      <div className="text-right">
                        <span className="font-bold">{formatCurrency(dia.vendas)}</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          ({dia.comandas} comandas)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
