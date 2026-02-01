import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Comanda, 
  ComandaFechada, 
  ItemEstoque, 
  Perda, 
  Taxas, 
  DadosDia,
  FormaPagamento,
  ItemComanda,
  CARDAPIO 
} from '@/types/comanda';
import { Json } from '@/integrations/supabase/types';

const getDataAtual = () => new Date().toISOString().split('T')[0];

// Helper functions to convert between DB and app types
const dbToComanda = (row: {
  id: number;
  cliente: string;
  itens: Json;
  total: number;
  criada_em: string;
}): Comanda => ({
  id: row.id,
  cliente: row.cliente,
  itens: (row.itens as unknown) as ItemComanda[],
  total: Number(row.total),
  criadaEm: row.criada_em,
});

const dbToComandaFechada = (row: {
  id: number;
  comanda_id: number;
  cliente: string;
  itens: Json;
  total: number;
  criada_em: string;
  fechada_em: string;
  forma_pagamento: string;
  taxa_aplicada: number;
}): ComandaFechada => ({
  id: row.comanda_id,
  cliente: row.cliente,
  itens: (row.itens as unknown) as ItemComanda[],
  total: Number(row.total),
  criadaEm: row.criada_em,
  formaPagamento: row.forma_pagamento as FormaPagamento,
  fechadaEm: row.fechada_em,
  taxaAplicada: Number(row.taxa_aplicada),
});

const dbToEstoque = (row: {
  id: number;
  nome: string;
  quantidade: number;
  preco_custo: number;
  preco_venda: number;
}): ItemEstoque => ({
  nome: row.nome,
  quantidade: row.quantidade,
  precoCusto: Number(row.preco_custo),
  precoVenda: Number(row.preco_venda),
});

const dbToPerda = (row: {
  id: string;
  produto: string;
  quantidade: number;
  custo_total: number;
  horario: string;
}): Perda => ({
  id: row.id,
  produto: row.produto,
  quantidade: row.quantidade,
  custoTotal: Number(row.custo_total),
  horario: row.horario,
});

const dbToTaxas = (row: {
  debito: number;
  credito: number;
  pix: number;
}): Taxas => ({
  debito: Number(row.debito),
  credito: Number(row.credito),
  pix: Number(row.pix),
});

const dbToHistorico = (row: {
  data: string;
  vendas: number;
  comandas: number;
  ticket_medio: number;
  por_forma_pagamento: Json;
}): DadosDia => ({
  data: row.data,
  vendas: Number(row.vendas),
  comandas: row.comandas,
  ticketMedio: Number(row.ticket_medio),
  porFormaPagamento: row.por_forma_pagamento as Record<FormaPagamento, { comandas: number; valor: number }>,
});

export function useSupabaseStore() {
  const queryClient = useQueryClient();

  // Queries
  const { data: comandas = [], isLoading: loadingComandas } = useQuery({
    queryKey: ['comandas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return data.map(dbToComanda);
    },
  });

  const { data: comandasFechadas = [], isLoading: loadingFechadas } = useQuery({
    queryKey: ['comandas_fechadas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comandas_fechadas')
        .select('*')
        .order('fechada_em', { ascending: false });
      if (error) throw error;
      return data.map(dbToComandaFechada);
    },
  });

  const { data: estoque = [], isLoading: loadingEstoque } = useQuery({
    queryKey: ['estoque'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('estoque')
        .select('*')
        .order('nome', { ascending: true });
      if (error) throw error;
      return data.map(dbToEstoque);
    },
  });

  const { data: perdas = [], isLoading: loadingPerdas } = useQuery({
    queryKey: ['perdas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perdas')
        .select('*')
        .order('horario', { ascending: false });
      if (error) throw error;
      return data.map(dbToPerda);
    },
  });

  const { data: taxas = { debito: 0, credito: 0, pix: 0 }, isLoading: loadingTaxas } = useQuery({
    queryKey: ['taxas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('taxas')
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data ? dbToTaxas(data) : { debito: 0, credito: 0, pix: 0 };
    },
  });

  const { data: historico = [], isLoading: loadingHistorico } = useQuery({
    queryKey: ['historico_diario'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('historico_diario')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data.map(dbToHistorico);
    },
  });

  const { data: configuracoes, isLoading: loadingConfig } = useQuery({
    queryKey: ['configuracoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data ?? { proximo_numero: 1, estoque_configurado: false };
    },
  });

  const estoqueConfigurado = configuracoes?.estoque_configurado ?? false;
  const proximoNumero = configuracoes?.proximo_numero ?? 1;

  // Mutations
  const criarComandaMutation = useMutation({
    mutationFn: async (cliente: string) => {
      // Get current proximo_numero
      const { data: config } = await supabase
        .from('configuracoes')
        .select('proximo_numero')
        .maybeSingle();
      
      const numero = config?.proximo_numero ?? 1;

      const { data, error } = await supabase
        .from('comandas')
        .insert({
          id: numero,
          cliente,
          itens: [],
          total: 0,
        })
        .select()
        .single();
      
      if (error) throw error;

      // Increment proximo_numero
      await supabase
        .from('configuracoes')
        .update({ proximo_numero: numero + 1 })
        .eq('id', 1);

      return dbToComanda(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comandas'] });
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
    },
  });

  const atualizarComandaMutation = useMutation({
    mutationFn: async ({ id, itens }: { id: number; itens: ItemComanda[] }) => {
      const total = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
      const { error } = await supabase
        .from('comandas')
        .update({ itens: itens as unknown as Json, total })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comandas'] });
    },
  });

  const fecharComandaMutation = useMutation({
    mutationFn: async ({ id, formaPagamento }: { id: number; formaPagamento: FormaPagamento }) => {
      const comanda = comandas.find(c => c.id === id);
      if (!comanda) throw new Error('Comanda não encontrada');

      let taxaAplicada = 0;
      if (formaPagamento === 'debito') {
        taxaAplicada = comanda.total * (taxas.debito / 100);
      } else if (formaPagamento === 'credito') {
        taxaAplicada = comanda.total * (taxas.credito / 100);
      } else if (formaPagamento === 'pix') {
        taxaAplicada = comanda.total * (taxas.pix / 100);
      }

      // Insert into comandas_fechadas
      const { error: insertError } = await supabase
        .from('comandas_fechadas')
        .insert({
          comanda_id: comanda.id,
          cliente: comanda.cliente,
          itens: comanda.itens as unknown as Json,
          total: comanda.total,
          criada_em: comanda.criadaEm,
          forma_pagamento: formaPagamento,
          taxa_aplicada: taxaAplicada,
        });
      if (insertError) throw insertError;

      // Update estoque
      for (const item of comanda.itens) {
        const { data: estoqueItem } = await supabase
          .from('estoque')
          .select('quantidade')
          .eq('nome', item.nome)
          .maybeSingle();
        
        if (estoqueItem) {
          await supabase
            .from('estoque')
            .update({ quantidade: Math.max(0, estoqueItem.quantidade - item.quantidade) })
            .eq('nome', item.nome);
        }
      }

      // Delete from comandas
      const { error: deleteError } = await supabase
        .from('comandas')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comandas'] });
      queryClient.invalidateQueries({ queryKey: ['comandas_fechadas'] });
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
    },
  });

  const removerComandaMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comandas'] });
    },
  });

  const registrarPerdaMutation = useMutation({
    mutationFn: async ({ produto, quantidade }: { produto: string; quantidade: number }) => {
      const { data: itemEstoque } = await supabase
        .from('estoque')
        .select('preco_custo, quantidade')
        .eq('nome', produto)
        .maybeSingle();
      
      if (!itemEstoque) throw new Error('Item não encontrado no estoque');

      const custoTotal = Number(itemEstoque.preco_custo) * quantidade;

      // Insert perda
      const { error: perdaError } = await supabase
        .from('perdas')
        .insert({
          produto,
          quantidade,
          custo_total: custoTotal,
        });
      if (perdaError) throw perdaError;

      // Update estoque
      const { error: estoqueError } = await supabase
        .from('estoque')
        .update({ quantidade: Math.max(0, itemEstoque.quantidade - quantidade) })
        .eq('nome', produto);
      if (estoqueError) throw estoqueError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perdas'] });
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
    },
  });

  const configurarEstoqueMutation = useMutation({
    mutationFn: async (itensEstoque: ItemEstoque[]) => {
      // Delete existing estoque
      await supabase.from('estoque').delete().neq('id', 0);

      // Insert new items
      const { error } = await supabase.from('estoque').insert(
        itensEstoque.map(item => ({
          nome: item.nome,
          quantidade: item.quantidade,
          preco_custo: item.precoCusto,
          preco_venda: item.precoVenda,
        }))
      );
      if (error) throw error;

      // Update configuracoes
      await supabase
        .from('configuracoes')
        .update({ estoque_configurado: true })
        .eq('id', 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
    },
  });

  const reporEstoqueMutation = useMutation({
    mutationFn: async ({ nome, quantidade }: { nome: string; quantidade: number }) => {
      const { data: item } = await supabase
        .from('estoque')
        .select('quantidade')
        .eq('nome', nome)
        .maybeSingle();
      
      if (!item) throw new Error('Item não encontrado');

      const { error } = await supabase
        .from('estoque')
        .update({ quantidade: item.quantidade + quantidade })
        .eq('nome', nome);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
    },
  });

  const atualizarCustoEstoqueMutation = useMutation({
    mutationFn: async ({ nome, precoCusto }: { nome: string; precoCusto: number }) => {
      const { error } = await supabase
        .from('estoque')
        .update({ preco_custo: precoCusto })
        .eq('nome', nome);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
    },
  });

  const setTaxasMutation = useMutation({
    mutationFn: async (novasTaxas: Taxas) => {
      const { error } = await supabase
        .from('taxas')
        .update({
          debito: novasTaxas.debito,
          credito: novasTaxas.credito,
          pix: novasTaxas.pix,
        })
        .eq('id', 1);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxas'] });
    },
  });

  const resetarDiaMutation = useMutation({
    mutationFn: async () => {
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

        // Check if already exists
        const { data: existing } = await supabase
          .from('historico_diario')
          .select('id')
          .eq('data', dataAtual)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('historico_diario')
            .update({
              vendas: totalVendas,
              comandas: vendasHoje.length,
              ticket_medio: totalVendas / vendasHoje.length,
              por_forma_pagamento: porFormaPagamento as unknown as Json,
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('historico_diario')
            .insert({
              data: dataAtual,
              vendas: totalVendas,
              comandas: vendasHoje.length,
              ticket_medio: totalVendas / vendasHoje.length,
              por_forma_pagamento: porFormaPagamento as unknown as Json,
            });
        }
      }

      // Delete today's closed comandas
      await supabase
        .from('comandas_fechadas')
        .delete()
        .gte('fechada_em', dataAtual + 'T00:00:00')
        .lt('fechada_em', dataAtual + 'T23:59:59.999');

      // Delete today's perdas
      await supabase
        .from('perdas')
        .delete()
        .gte('horario', dataAtual + 'T00:00:00')
        .lt('horario', dataAtual + 'T23:59:59.999');

      // Reset proximo_numero
      await supabase
        .from('configuracoes')
        .update({ proximo_numero: 1 })
        .eq('id', 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comandas_fechadas'] });
      queryClient.invalidateQueries({ queryKey: ['perdas'] });
      queryClient.invalidateQueries({ queryKey: ['historico_diario'] });
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
    },
  });

  // Helper functions (keeping same interface)
  const criarComanda = async (cliente: string): Promise<Comanda> => {
    const result = await criarComandaMutation.mutateAsync(cliente);
    return result;
  };

  const atualizarComanda = (id: number, itens: ItemComanda[]) => {
    atualizarComandaMutation.mutate({ id, itens });
  };

  const fecharComanda = (id: number, formaPagamento: FormaPagamento) => {
    fecharComandaMutation.mutate({ id, formaPagamento });
  };

  const removerComanda = (id: number) => {
    removerComandaMutation.mutate(id);
  };

  const registrarPerda = (produto: string, quantidade: number) => {
    registrarPerdaMutation.mutate({ produto, quantidade });
  };

  const configurarEstoqueInicial = (itensEstoque: ItemEstoque[]) => {
    configurarEstoqueMutation.mutate(itensEstoque);
  };

  const reporEstoque = (nome: string, quantidade: number) => {
    reporEstoqueMutation.mutate({ nome, quantidade });
  };

  const atualizarCustoEstoque = (nome: string, precoCusto: number) => {
    atualizarCustoEstoqueMutation.mutate({ nome, precoCusto });
  };

  const setTaxas = (novasTaxas: Taxas) => {
    setTaxasMutation.mutate(novasTaxas);
  };

  const resetarDia = () => {
    resetarDiaMutation.mutate();
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

    const perdasPeriodo = perdas.filter(p => {
      const dataPerda = new Date(p.horario);
      return dataPerda >= inicio && dataPerda <= fim;
    });

    const totalVendasHistorico = historicoNoPeriodo.reduce((acc, h) => acc + h.vendas, 0);
    const totalComandasHistorico = historicoNoPeriodo.reduce((acc, h) => acc + h.comandas, 0);

    const totalVendasHoje = vendasPeriodo.reduce((acc, c) => acc + c.total, 0);
    const totalTaxasHoje = vendasPeriodo.reduce((acc, c) => acc + c.taxaAplicada, 0);
    const totalComandas = vendasPeriodo.length + totalComandasHistorico;
    const totalVendas = totalVendasHoje + totalVendasHistorico;

    const totalPerdas = perdasPeriodo.reduce((acc, p) => acc + p.custoTotal, 0);

    const porFormaPagamento = vendasPeriodo.reduce((acc, c) => {
      if (!acc[c.formaPagamento]) {
        acc[c.formaPagamento] = { comandas: 0, valor: 0, taxas: 0 };
      }
      acc[c.formaPagamento].comandas++;
      acc[c.formaPagamento].valor += c.total;
      acc[c.formaPagamento].taxas += c.taxaAplicada;
      return acc;
    }, {} as Record<string, { comandas: number; valor: number; taxas: number }>);

    historicoNoPeriodo.forEach(h => {
      Object.entries(h.porFormaPagamento).forEach(([forma, dados]) => {
        if (!porFormaPagamento[forma]) {
          porFormaPagamento[forma] = { comandas: 0, valor: 0, taxas: 0 };
        }
        porFormaPagamento[forma].comandas += dados.comandas;
        porFormaPagamento[forma].valor += dados.valor;
      });
    });

    const produtosVendidos = vendasPeriodo
      .flatMap(c => c.itens)
      .reduce((acc, item) => {
        if (!acc[item.nome]) {
          acc[item.nome] = { quantidade: 0, valor: 0 };
        }
        acc[item.nome].quantidade += item.quantidade;
        acc[item.nome].valor += item.preco * item.quantidade;
        return acc;
      }, {} as Record<string, { quantidade: number; valor: number }>);

    const produtosOrdenados = Object.entries(produtosVendidos)
      .sort((a, b) => b[1].quantidade - a[1].quantidade);

    const custoTotal = vendasPeriodo
      .flatMap(c => c.itens)
      .reduce((acc, item) => {
        const itemEstoque = estoque.find(e => e.nome === item.nome);
        if (itemEstoque) {
          return acc + (itemEstoque.precoCusto * item.quantidade);
        }
        return acc;
      }, 0);

    const lucro = totalVendas - totalTaxasHoje - custoTotal - totalPerdas;

    return {
      inicio: inicio.toISOString().split('T')[0],
      fim: fim.toISOString().split('T')[0],
      totalVendas,
      totalComandas,
      ticketMedio: totalComandas > 0 ? totalVendas / totalComandas : 0,
      historicoDiario: historicoNoPeriodo,
      totalTaxas: totalTaxasHoje,
      totalPerdas,
      custoTotal,
      lucro,
      porFormaPagamento,
      produtosVendidos: produtosOrdenados,
    };
  };

  const getPerdasDia = () => {
    const dataAtual = getDataAtual();
    return perdas.filter(p => p.horario.startsWith(dataAtual));
  };

  const isLoading = loadingComandas || loadingFechadas || loadingEstoque || loadingPerdas || loadingTaxas || loadingHistorico || loadingConfig;

  return {
    comandas,
    comandasFechadas,
    estoque,
    perdas,
    taxas,
    historico,
    estoqueConfigurado,
    isLoading,
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
