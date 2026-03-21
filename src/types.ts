export type EventType =
  | 'LOTE_CRIADO'
  | 'LOTE_EXCLUIDO'
  | 'LOTE_SUBDIVIDIDO'
  | 'MORTALIDADE_REGISTRADA'
  | 'TRATO_DIARIO_REGISTRADO'
  | 'COMPRA_INGREDIENTE'
  | 'FORMULA_LOTE_CRIADA'
  | 'FORMULA_EXCLUIDA'
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

// ─── Event Payloads ──────────────────────────────────────────────────────────

export interface LoteCriadoPayload {
  loteId: string;
  dataEntrada: string;
  cabecas: number;
  pesoMedioEntrada: number;
  precoCompraArroba: number;
  observacao?: string;
}

export interface LoteExcluidoPayload {
  loteId: string;
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

export interface FormulaExcluidaPayload {
  formulaId: string;
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

export interface RateioEstruturaGeradoPayload {
  data: string;
  [key: string]: unknown;
}

export interface VendaLoteRegistradaPayload {
  loteId: string;
  cabecasVendidas: number;
  pesoMedioKg: number;
  precoArroba: number;
  data: string;
  observacao?: string;
}

export interface AlocacaoCustoVendaPayload {
  loteId: string;
  valor: number;
  [key: string]: unknown;
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

// ─── Typed event map ─────────────────────────────────────────────────────────

export interface EventPayloadMap {
  LOTE_CRIADO: LoteCriadoPayload;
  LOTE_EXCLUIDO: LoteExcluidoPayload;
  LOTE_SUBDIVIDIDO: LoteSubdivididoPayload;
  MORTALIDADE_REGISTRADA: MortalidadeRegistradaPayload;
  TRATO_DIARIO_REGISTRADO: TratoDiarioRegistradoPayload;
  COMPRA_INGREDIENTE: CompraIngredientePayload;
  FORMULA_LOTE_CRIADA: FormulaLoteCriadaPayload;
  FORMULA_EXCLUIDA: FormulaExcluidaPayload;
  DESPESA_LOTE_LANCADA: DespesaLoteLancadaPayload;
  DESPESA_GERAL_LANCADA: DespesaGeralLancadaPayload;
  RATEIO_ESTRUTURA_GERADO: RateioEstruturaGeradoPayload;
  VENDA_LOTE_REGISTRADA: VendaLoteRegistradaPayload;
  ALOCACAO_CUSTO_VENDA: AlocacaoCustoVendaPayload;
  RECEITA_DIVERSA_LANCADA: ReceitaDiversaLancadaPayload;
  PESAGEM_REGISTRADA: PesagemRegistradaPayload;
  CONTAS_PAGAR_CRIADA: ContasPagarCriadaPayload;
  CONTAS_PAGAR_PAGA: ContasPagarPagaPayload;
  CONTAS_PAGAR_CANCELADA: ContasPagarCanceladaPayload;
  CONTAS_RECEBER_CRIADA: ContasReceberCriadaPayload;
  CONTAS_RECEBER_RECEBIDA: ContasReceberRecebidaPayload;
  CONTAS_RECEBER_CANCELADA: ContasReceberCanceladaPayload;
  TRANSACAO_CAIXA_CRIADA: TransacaoCaixaCriadaPayload;
  SIMULACAO_VENDA_SALVA: SimulacaoVendaSalvaPayload;
}

// Discriminated union: each variant carries its own payload type.
export type AppEvent = {
  [K in EventType]: BaseEvent & { type: K; payload: EventPayloadMap[K] };
}[EventType];

// ─── Computed State Types ─────────────────────────────────────────────────────

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
  quantidadeRacaoKg: number;
  status: 'ATIVO' | 'ENCERRADO';
  observacao?: string;
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
  quantidadeUtilizadaKg: number;
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
