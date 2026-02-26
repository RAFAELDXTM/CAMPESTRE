export type EventType =
  | 'LOTE_CRIADO'
  | 'LOTE_SUBDIVIDIDO'
  | 'MORTALIDADE_REGISTRADA'
  | 'TRATO_DIARIO_REGISTRADO'
  | 'COMPRA_INGREDIENTE'
  | 'FORMULA_LOTE_CRIADA'
  | 'DESPESA_LOTE_LANCADA'
  | 'DESPESA_GERAL_LANCADA'
  | 'RATEIO_ESTRUTURA_GERADO'
  | 'VENDA_LOTE_REGISTRADA'
  | 'ALOCACAO_CUSTO_VENDA'
  | 'RECEITA_DIVERSA_LANCADA'
  | 'PESAGEM_REGISTRADA'
  | 'CONTAS_PAGAR_CRIADA'
  | 'CONTAS_PAGAR_PAGA'
  | 'CONTAS_PAGAR_CANCELADA'
  | 'CONTAS_RECEBER_CRIADA'
  | 'CONTAS_RECEBER_RECEBIDA'
  | 'CONTAS_RECEBER_CANCELADA'
  | 'TRANSACAO_CAIXA_CRIADA'
  | 'SIMULACAO_VENDA_SALVA';

export interface BaseEvent {
  id: string;
  farm_id: string;
  user_id: string;
  type: EventType;
  timestamp: string;
}

// Existing payloads...
export interface LoteCriadoPayload {
  loteId: string;
  dataEntrada: string;
  cabecas: number;
  pesoMedioEntrada: number;
  precoCompraArroba: number;
  observacao?: string;
}

export interface LoteSubdivididoPayload {
  loteOrigemId: string;
  loteNovoId: string;
  cabecasTransferidas: number;
  data: string;
  observacao?: string;
}

export interface MortalidadeRegistradaPayload {
  loteId: string;
  cabecas: number;
  data: string;
  observacao?: string;
}

export interface TratoDiarioRegistradoPayload {
  loteId: string;
  formulaId: string;
  totalRacaoKg: number;
  data: string;
  observacao?: string;
}

export interface CompraIngredientePayload {
  ingredienteId: string;
  ingredienteNome: string;
  quantidadeKg: number;
  valorTotal: number;
  data: string;
  observacao?: string;
}

export interface FormulaLoteCriadaPayload {
  loteId: string;
  formulaId: string;
  nomeFormula: string;
  dataInicio: string;
  composicao: { ingredienteId: string; percentual: number }[];
}

export interface DespesaLoteLancadaPayload {
  loteId: string;
  categoria: string;
  valor: number;
  data: string;
  observacao?: string;
}

export interface DespesaGeralLancadaPayload {
  categoria: string;
  valor: number;
  data: string;
  observacao?: string;
}

export interface VendaLoteRegistradaPayload {
  loteId: string;
  cabecasVendidas: number;
  pesoMedioKg: number;
  precoArroba: number;
  data: string;
  observacao?: string;
}

export interface ReceitaDiversaLancadaPayload {
  categoria: string;
  descricao: string;
  cliente: string;
  valor: number;
  loteId?: string;
  data: string;
  observacao?: string;
  itemEstoqueId?: string;
  formulaId?: string;
  quantidade?: number;
}

// New Payloads
export interface PesagemRegistradaPayload {
  loteId: string;
  data: string;
  pesoMedioKg: number;
  metodo: 'Balança' | 'Estimado' | 'Outro';
  observacao?: string;
}

export interface ContasPagarCriadaPayload {
  id: string;
  competencia: string;
  vencimento: string;
  fornecedor: string;
  categoria: string;
  valor: number;
  status: 'Aberto' | 'Pago' | 'Cancelado';
  observacao?: string;
}

export interface ContasPagarPagaPayload {
  id: string;
  dataPagamento: string;
  contaId: string;
  observacao?: string;
}

export interface ContasPagarCanceladaPayload {
  id: string;
}

export interface ContasReceberCriadaPayload {
  id: string;
  competencia: string;
  vencimento: string;
  cliente: string;
  categoria: string;
  valor: number;
  status: 'Aberto' | 'Recebido' | 'Cancelado';
  observacao?: string;
}

export interface ContasReceberRecebidaPayload {
  id: string;
  dataRecebimento: string;
  contaId: string;
  observacao?: string;
}

export interface ContasReceberCanceladaPayload {
  id: string;
}

export interface TransacaoCaixaCriadaPayload {
  id: string;
  data: string;
  direcao: 'in' | 'out';
  valor: number;
  contaId: string;
  descricao: string;
  sourceType?: 'payable' | 'receivable' | 'manual';
  sourceId?: string;
}

export interface SimulacaoVendaSalvaPayload {
  id: string;
  data: string;
  loteId: string;
  dataReferencia: string;
  pesoEstimado: number;
  precoEstimado: number;
  cabecas: number;
  arrobas: number;
  receita: number;
  custo: number;
  lucro: number;
  margem: number;
}

export type AppEvent = BaseEvent & {
  payload:
    | LoteCriadoPayload
    | LoteSubdivididoPayload
    | MortalidadeRegistradaPayload
    | TratoDiarioRegistradoPayload
    | CompraIngredientePayload
    | FormulaLoteCriadaPayload
    | DespesaLoteLancadaPayload
    | DespesaGeralLancadaPayload
    | VendaLoteRegistradaPayload
    | ReceitaDiversaLancadaPayload
    | PesagemRegistradaPayload
    | ContasPagarCriadaPayload
    | ContasPagarPagaPayload
    | ContasPagarCanceladaPayload
    | ContasReceberCriadaPayload
    | ContasReceberRecebidaPayload
    | ContasReceberCanceladaPayload
    | TransacaoCaixaCriadaPayload
    | SimulacaoVendaSalvaPayload;
};

// Computed State Types
export interface LoteState {
  id: string;
  dataEntrada: string;
  cabecasIniciais: number;
  cabecasAtuais: number;
  pesoMedioEntrada: number;
  precoCompraArroba: number;
  custoCompra: number;
  custoRacao: number;
  custoDireto: number;
  estruturaRateada: number;
  receitaRealizada: number;
  cabecasVendidas: number;
  status: 'ATIVO' | 'ENCERRADO';
}

export interface IngredienteState {
  id: string;
  nome: string;
  quantidadeKg: number;
  valorTotal: number;
  ultimoCustoKg: number;
}

export interface FormulaState {
  id: string;
  loteId: string;
  nome: string;
  dataInicio: string;
  composicao: { ingredienteId: string; percentual: number }[];
}

export interface PesagemState {
  id: string;
  loteId: string;
  data: string;
  pesoMedioKg: number;
  metodo: string;
  observacao?: string;
}

export interface ContasPagarState {
  id: string;
  competencia: string;
  vencimento: string;
  fornecedor: string;
  categoria: string;
  valor: number;
  status: 'Aberto' | 'Pago' | 'Cancelado';
  dataPagamento?: string;
  contaId?: string;
  observacao?: string;
}

export interface ContasReceberState {
  id: string;
  competencia: string;
  vencimento: string;
  cliente: string;
  categoria: string;
  valor: number;
  status: 'Aberto' | 'Recebido' | 'Cancelado';
  dataRecebimento?: string;
  contaId?: string;
  observacao?: string;
}

export interface FinanceAccountState {
  id: string;
  name: string;
  type: 'cash' | 'bank';
}

export interface CashTransactionState {
  id: string;
  data: string;
  direcao: 'in' | 'out';
  valor: number;
  contaId: string;
  descricao: string;
  sourceType?: 'payable' | 'receivable' | 'manual';
  sourceId?: string;
}

export interface SimulacaoVendaState {
  id: string;
  data: string;
  loteId: string;
  dataReferencia: string;
  pesoEstimado: number;
  precoEstimado: number;
  cabecas: number;
  arrobas: number;
  receita: number;
  custo: number;
  lucro: number;
  margem: number;
}

export interface FarmState {
  lotes: Record<string, LoteState>;
  ingredientes: Record<string, IngredienteState>;
  formulas: Record<string, FormulaState>;
  despesasGerais: number;
  pesagens: PesagemState[];
  contasPagar: Record<string, ContasPagarState>;
  contasReceber: Record<string, ContasReceberState>;
  financeAccounts: Record<string, FinanceAccountState>;
  cashTransactions: CashTransactionState[];
  simulacoesVenda: SimulacaoVendaState[];
}
