import { AppEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays } from 'date-fns';

const today = new Date();
const d1 = format(subDays(today, 60), 'yyyy-MM-dd');
const d2 = format(subDays(today, 30), 'yyyy-MM-dd');
const d3 = format(subDays(today, 15), 'yyyy-MM-dd');
const d4 = format(subDays(today, 5), 'yyyy-MM-dd');

export const mockEvents: AppEvent[] = [
  {
    id: uuidv4(),
    farm_id: 'farm_1',
    user_id: 'user_1',
    type: 'LOTE_CRIADO',
    timestamp: new Date().toISOString(),
    payload: {
      loteId: 'LOTE-001',
      dataEntrada: d1,
      cabecas: 100,
      pesoMedioEntrada: 250,
      precoCompraArroba: 280,
      observacao: 'Nelore padrão'
    }
  },
  {
    id: uuidv4(),
    farm_id: 'farm_1',
    user_id: 'user_1',
    type: 'LOTE_CRIADO',
    timestamp: new Date().toISOString(),
    payload: {
      loteId: 'LOTE-002',
      dataEntrada: d2,
      cabecas: 50,
      pesoMedioEntrada: 300,
      precoCompraArroba: 290,
      observacao: 'Cruzamento industrial'
    }
  },
  {
    id: uuidv4(),
    farm_id: 'farm_1',
    user_id: 'user_1',
    type: 'COMPRA_INGREDIENTE',
    timestamp: new Date().toISOString(),
    payload: {
      ingredienteId: 'ing_milho',
      ingredienteNome: 'Milho Grão',
      quantidadeKg: 10000,
      valorTotal: 8000,
      data: d1
    }
  },
  {
    id: uuidv4(),
    farm_id: 'farm_1',
    user_id: 'user_1',
    type: 'COMPRA_INGREDIENTE',
    timestamp: new Date().toISOString(),
    payload: {
      ingredienteId: 'ing_soja',
      ingredienteNome: 'Farelo de Soja',
      quantidadeKg: 5000,
      valorTotal: 10000,
      data: d1
    }
  },
  {
    id: uuidv4(),
    farm_id: 'farm_1',
    user_id: 'user_1',
    type: 'FORMULA_LOTE_CRIADA',
    timestamp: new Date().toISOString(),
    payload: {
      loteId: 'LOTE-001',
      formulaId: 'form_1',
      nomeFormula: 'Engorda Inicial',
      dataInicio: d1,
      composicao: [
        { ingredienteId: 'ing_milho', percentual: 70 },
        { ingredienteId: 'ing_soja', percentual: 30 }
      ]
    }
  },
  {
    id: uuidv4(),
    farm_id: 'farm_1',
    user_id: 'user_1',
    type: 'TRATO_DIARIO_REGISTRADO',
    timestamp: new Date().toISOString(),
    payload: {
      loteId: 'LOTE-001',
      formulaId: 'form_1',
      totalRacaoKg: 500,
      data: d2
    }
  },
  {
    id: uuidv4(),
    farm_id: 'farm_1',
    user_id: 'user_1',
    type: 'PESAGEM_REGISTRADA',
    timestamp: new Date().toISOString(),
    payload: {
      loteId: 'LOTE-001',
      data: d2,
      pesoMedioKg: 280,
      metodo: 'Balança',
      observacao: 'Pesagem de 30 dias'
    }
  },
  {
    id: uuidv4(),
    farm_id: 'farm_1',
    user_id: 'user_1',
    type: 'DESPESA_GERAL_LANCADA',
    timestamp: new Date().toISOString(),
    payload: {
      categoria: 'Mão de Obra',
      valor: 3000,
      data: d2,
      observacao: 'Salário vaqueiro'
    }
  },
  {
    id: uuidv4(),
    farm_id: 'farm_1',
    user_id: 'user_1',
    type: 'CONTAS_PAGAR_CRIADA',
    timestamp: new Date().toISOString(),
    payload: {
      id: 'cp_1',
      competencia: d3,
      vencimento: format(today, 'yyyy-MM-dd'),
      fornecedor: 'Agropecuária Silva',
      categoria: 'Medicamentos',
      valor: 1500,
      status: 'Aberto'
    }
  },
  {
    id: uuidv4(),
    farm_id: 'farm_1',
    user_id: 'user_1',
    type: 'CONTAS_RECEBER_CRIADA',
    timestamp: new Date().toISOString(),
    payload: {
      id: 'cr_1',
      competencia: d3,
      vencimento: format(today, 'yyyy-MM-dd'),
      cliente: 'Frigorífico Boi Gordo',
      categoria: 'Venda de Animais Descarte',
      valor: 5000,
      status: 'Aberto'
    }
  }
];
