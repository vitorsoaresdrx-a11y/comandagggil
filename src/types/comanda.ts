export interface MenuItem {
  nome: string;
  preco: number;
}

export interface Cardapio {
  espetinhos: MenuItem[];
  kaftas: MenuItem[];
  bebidas: MenuItem[];
  cervejas: MenuItem[];
  adicionais: MenuItem[];
}

export interface ItemComanda {
  nome: string;
  preco: number;
  quantidade: number;
}

export interface Comanda {
  id: number;
  cliente: string;
  itens: ItemComanda[];
  total: number;
  criadaEm: string;
}

export interface ComandaFechada extends Comanda {
  formaPagamento: FormaPagamento;
  fechadaEm: string;
  taxaAplicada: number;
}

export type FormaPagamento = 'fiado' | 'debito' | 'credito' | 'pix' | 'dinheiro';

export interface Taxas {
  debito: number;
  credito: number;
  pix: number;
}

export interface ItemEstoque {
  nome: string;
  quantidade: number;
  precoCusto: number;
  precoVenda: number;
}

export interface Perda {
  id: string;
  produto: string;
  quantidade: number;
  custoTotal: number;
  horario: string;
}

export interface DadosDia {
  data: string;
  vendas: number;
  comandas: number;
  ticketMedio: number;
  porFormaPagamento: Record<FormaPagamento, { comandas: number; valor: number }>;
}

export type CategoriaCardapio = keyof Cardapio;

export const CARDAPIO: Cardapio = {
  espetinhos: [
    { nome: 'Carne', preco: 11.0 },
    { nome: 'Costela', preco: 11.0 },
    { nome: 'Frango com bacon', preco: 11.0 },
    { nome: 'Frango', preco: 10.0 },
    { nome: 'Panceta', preco: 10.0 },
    { nome: 'Coração', preco: 10.0 },
    { nome: 'Linguiça Perdigão na brasa', preco: 10.0 },
    { nome: 'Queijo coalho', preco: 8.0 },
    { nome: 'Pão de alho', preco: 8.0 },
  ],
  kaftas: [
    { nome: 'Kafta de costela', preco: 14.0 },
    { nome: 'Kafta de pernil', preco: 14.0 },
  ],
  bebidas: [
    { nome: 'Suco Bellas Frutas', preco: 10.0 },
    { nome: 'Coca-Cola 350ml', preco: 6.0 },
    { nome: 'Coca-Cola Zero 350ml', preco: 6.0 },
    { nome: 'Fanta Laranja 350ml', preco: 6.0 },
    { nome: 'Fanta Uva 350ml', preco: 6.0 },
    { nome: 'Água com gás', preco: 4.5 },
    { nome: 'Água', preco: 3.5 },
  ],
  cervejas: [
    { nome: 'Heineken 330ml', preco: 11.0 },
    { nome: 'Skol 350ml', preco: 6.0 },
    { nome: 'Brahma 350ml', preco: 6.0 },
  ],
  adicionais: [
    { nome: 'Molho de alho', preco: 2.0 },
    { nome: 'Farofa', preco: 1.0 },
  ],
};

export const CATEGORIAS_LABELS: Record<CategoriaCardapio, string> = {
  espetinhos: 'Espetinhos',
  kaftas: 'Kaftas',
  bebidas: 'Bebidas',
  cervejas: 'Cervejas',
  adicionais: 'Adicionais',
};

export const FORMAS_PAGAMENTO: { value: FormaPagamento; label: string; icon: string }[] = [
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'pix', label: 'PIX', icon: '📱' },
  { value: 'debito', label: 'Débito', icon: '💳' },
  { value: 'credito', label: 'Crédito', icon: '💳' },
  { value: 'fiado', label: 'Fiado', icon: '📝' },
];
