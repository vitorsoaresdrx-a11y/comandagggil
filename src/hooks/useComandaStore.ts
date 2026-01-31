import { useLocalStorage } from './useLocalStorage';
import { 
  Comanda, 
  ComandaFechada, 
  ItemEstoque, 
  Perda, 
  Taxas, 
  DadosDia,
  FormaPagamento,
  CARDAPIO 
} from '@/types/comanda';

const getDataAtual = () => new Date().toISOString().split('T')[0];

export function useComandaStore() {
  const [comandas, setComandas] = useLocalStorage<Comanda[]>('comandas', []);
  const [comandasFechadas, setComandasFechadas] = useLocalStorage<ComandaFechada[]>('comandasFechadas', []);
  const [estoque, setEstoque] = useLocalStorage<ItemEstoque[]>('estoque', []);
  const [perdas, setPerdas] = useLocalStorage<Perda[]>('perdas', []);
  const [taxas, setTaxas] = useLocalStorage<Taxas>('taxasCartao', { debito: 0, credito: 0, pix: 0 });
  const [historico, setHistorico] = useLocalStorage<DadosDia[]>('historicoCompleto', []);
  const [proximoNumero, setProximoNumero] = useLocalStorage<number>('proximoNumeroComanda', 1);
  const [estoqueConfigurado, setEstoqueConfigurado] = useLocalStorage<boolean>('estoqueConfigurado', false);

  const criarComanda = (cliente: string): Comanda => {
    const novaComanda: Comanda = {
      id: proximoNumero,
      cliente,
      itens: [],
      total: 0,
      criadaEm: new Date().toISOString(),
    };
    setComandas(prev => [...prev, novaComanda]);
    setProximoNumero(prev => prev + 1);
    return novaComanda;
  };

  const atualizarComanda = (id: number, itens: Comanda['itens']) => {
    const total = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    setComandas(prev =>
      prev.map(c => (c.id === id ? { ...c, itens, total } : c))
    );
  };

  const fecharComanda = (id: number, formaPagamento: FormaPagamento) => {
    const comanda = comandas.find(c => c.id === id);
    if (!comanda) return;

    let taxaAplicada = 0;
    if (formaPagamento === 'debito') {
      taxaAplicada = comanda.total * (taxas.debito / 100);
    } else if (formaPagamento === 'credito') {
      taxaAplicada = comanda.total * (taxas.credito / 100);
    } else if (formaPagamento === 'pix') {
      taxaAplicada = comanda.total * (taxas.pix / 100);
    }

    const comandaFechada: ComandaFechada = {
      ...comanda,
      formaPagamento,
      fechadaEm: new Date().toISOString(),
      taxaAplicada,
    };

    // Atualiza estoque
    comanda.itens.forEach(item => {
      setEstoque(prev =>
        prev.map(e =>
          e.nome === item.nome
            ? { ...e, quantidade: Math.max(0, e.quantidade - item.quantidade) }
            : e
        )
      );
    });

    setComandasFechadas(prev => [...prev, comandaFechada]);
    setComandas(prev => prev.filter(c => c.id !== id));
  };

  const removerComanda = (id: number) => {
    setComandas(prev => prev.filter(c => c.id !== id));
  };

  const registrarPerda = (produto: string, quantidade: number) => {
    const itemEstoque = estoque.find(e => e.nome === produto);
    if (!itemEstoque) return;

    const perda: Perda = {
      id: Date.now().toString(),
      produto,
      quantidade,
      custoTotal: itemEstoque.precoCusto * quantidade,
      horario: new Date().toISOString(),
    };

    setPerdas(prev => [...prev, perda]);
    setEstoque(prev =>
      prev.map(e =>
        e.nome === produto
          ? { ...e, quantidade: Math.max(0, e.quantidade - quantidade) }
          : e
      )
    );
  };

  const configurarEstoqueInicial = (itensEstoque: ItemEstoque[]) => {
    setEstoque(itensEstoque);
    setEstoqueConfigurado(true);
  };

  const reporEstoque = (nome: string, quantidade: number) => {
    setEstoque(prev =>
      prev.map(e =>
        e.nome === nome ? { ...e, quantidade: e.quantidade + quantidade } : e
      )
    );
  };

  const atualizarCustoEstoque = (nome: string, precoCusto: number) => {
    setEstoque(prev =>
      prev.map(e => (e.nome === nome ? { ...e, precoCusto } : e))
    );
  };

  const resetarDia = () => {
    const dataAtual = getDataAtual();
    const vendasHoje = comandasFechadas.filter(
      c => c.fechadaEm.startsWith(dataAtual)
    );

    if (vendasHoje.length > 0) {
      const totalVendas = vendasHoje.reduce((acc, c) => acc + c.total, 0);
      const porFormaPagamento = vendasHoje.reduce((acc, c) => {
        if (!acc[c.formaPagamento]) {
          acc[c.formaPagamento] = { comandas: 0, valor: 0 };
        }
        acc[c.formaPagamento].comandas++;
        acc[c.formaPagamento].valor += c.total;
        return acc;
      }, {} as Record<FormaPagamento, { comandas: number; valor: number }>);

      const dadosDia: DadosDia = {
        data: dataAtual,
        vendas: totalVendas,
        comandas: vendasHoje.length,
        ticketMedio: totalVendas / vendasHoje.length,
        porFormaPagamento,
      };

      setHistorico(prev => {
        const existing = prev.findIndex(h => h.data === dataAtual);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = dadosDia;
          return updated;
        }
        return [...prev, dadosDia];
      });
    }

    setComandasFechadas([]);
    setPerdas([]);
    setProximoNumero(1);
  };

  const getMetricasDia = () => {
    const dataAtual = getDataAtual();
    const vendasHoje = comandasFechadas.filter(
      c => c.fechadaEm.startsWith(dataAtual)
    );

    const totalVendas = vendasHoje.reduce((acc, c) => acc + c.total, 0);
    const totalTaxas = vendasHoje.reduce((acc, c) => acc + c.taxaAplicada, 0);

    const porFormaPagamento = vendasHoje.reduce((acc, c) => {
      if (!acc[c.formaPagamento]) {
        acc[c.formaPagamento] = { comandas: 0, valor: 0, taxas: 0 };
      }
      acc[c.formaPagamento].comandas++;
      acc[c.formaPagamento].valor += c.total;
      acc[c.formaPagamento].taxas += c.taxaAplicada;
      return acc;
    }, {} as Record<FormaPagamento, { comandas: number; valor: number; taxas: number }>);

    const porCategoria = vendasHoje.reduce((acc, c) => {
      c.itens.forEach(item => {
        const categoria = Object.entries(CARDAPIO).find(([_, itens]) =>
          itens.some(i => i.nome === item.nome)
        )?.[0] || 'outros';
        
        if (!acc[categoria]) {
          acc[categoria] = { quantidade: 0, valor: 0 };
        }
        acc[categoria].quantidade += item.quantidade;
        acc[categoria].valor += item.preco * item.quantidade;
      });
      return acc;
    }, {} as Record<string, { quantidade: number; valor: number }>);

    const produtosMaisVendidos = vendasHoje
      .flatMap(c => c.itens)
      .reduce((acc, item) => {
        if (!acc[item.nome]) {
          acc[item.nome] = { quantidade: 0, valor: 0 };
        }
        acc[item.nome].quantidade += item.quantidade;
        acc[item.nome].valor += item.preco * item.quantidade;
        return acc;
      }, {} as Record<string, { quantidade: number; valor: number }>);

    const produtosOrdenados = Object.entries(produtosMaisVendidos)
      .sort((a, b) => b[1].quantidade - a[1].quantidade)
      .slice(0, 10);

    return {
      totalVendas,
      totalTaxas,
      comandasFechadas: vendasHoje.length,
      ticketMedio: vendasHoje.length > 0 ? totalVendas / vendasHoje.length : 0,
      porFormaPagamento,
      porCategoria,
      produtosMaisVendidos: produtosOrdenados,
    };
  };

  const getMetricasMes = () => {
    const hoje = new Date();
    const diaAtual = hoje.getDate();
    
    let inicio: Date;
    let fim: Date;
    
    if (diaAtual >= 5) {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 5);
      fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 4);
    } else {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 5);
      fim = new Date(hoje.getFullYear(), hoje.getMonth(), 4);
    }

    const vendasPeriodo = comandasFechadas.filter(c => {
      const dataFechamento = new Date(c.fechadaEm);
      return dataFechamento >= inicio && dataFechamento <= fim;
    });

    const historicoNoPeriodo = historico.filter(h => {
      const data = new Date(h.data);
      return data >= inicio && data <= fim;
    });

    const totalVendasHistorico = historicoNoPeriodo.reduce((acc, h) => acc + h.vendas, 0);
    const totalComandasHistorico = historicoNoPeriodo.reduce((acc, h) => acc + h.comandas, 0);

    const totalVendasHoje = vendasPeriodo.reduce((acc, c) => acc + c.total, 0);
    const totalComandas = vendasPeriodo.length + totalComandasHistorico;
    const totalVendas = totalVendasHoje + totalVendasHistorico;

    return {
      inicio: inicio.toISOString().split('T')[0],
      fim: fim.toISOString().split('T')[0],
      totalVendas,
      totalComandas,
      ticketMedio: totalComandas > 0 ? totalVendas / totalComandas : 0,
      historicoDiario: historicoNoPeriodo,
    };
  };

  const getPerdasDia = () => {
    const dataAtual = getDataAtual();
    return perdas.filter(p => p.horario.startsWith(dataAtual));
  };

  return {
    comandas,
    comandasFechadas,
    estoque,
    perdas,
    taxas,
    historico,
    estoqueConfigurado,
    criarComanda,
    atualizarComanda,
    fecharComanda,
    removerComanda,
    registrarPerda,
    configurarEstoqueInicial,
    reporEstoque,
    atualizarCustoEstoque,
    setTaxas,
    resetarDia,
    getMetricasDia,
    getMetricasMes,
    getPerdasDia,
  };
}
