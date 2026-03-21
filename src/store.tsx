import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { AppEvent, EventPayloadMap, EventType, FarmState, LoteState, IngredienteState, FormulaState } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';

interface AppContextType {
  state: FarmState;
  events: AppEvent[];
  loading: boolean;
  addEvent: <T extends EventType>(type: T, payload: EventPayloadMap[T]) => Promise<void>;
  updateEvent: (id: string, newPayload: EventPayloadMap[EventType]) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setEvents(data as AppEvent[]);
        } else {
          setEvents([]);
        }
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = async <T extends EventType>(type: T, payload: EventPayloadMap[T]) => {
    if (!user) return;

    const newEvent = {
      id: uuidv4(),
      farm_id: 'farm_1',
      user_id: user.id,
      type,
      payload,
      timestamp: new Date().toISOString(),
    } as AppEvent;

    setEvents((prev) => [...prev, newEvent]);

    if (supabase) {
      try {
        const { error } = await supabase.from('events').insert([newEvent]);
        if (error) {
          console.error('Error saving event:', error);
          setEvents((prev) => prev.filter(e => e.id !== newEvent.id));
        }
      } catch (error) {
        console.error('Error saving event:', error);
      }
    }
  };

  const updateEvent = async (id: string, newPayload: EventPayloadMap[EventType]) => {
    if (!user) return;

    setEvents((prev) => prev.map(e => e.id === id ? { ...e, payload: newPayload } as AppEvent : e));

    if (supabase) {
      try {
        const { error } = await supabase.from('events').update({ payload: newPayload }).eq('id', id);
        if (error) console.error('Error updating event:', error);
      } catch (error) {
        console.error('Error updating event:', error);
      }
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;

    setEvents((prev) => prev.filter(e => e.id !== id));

    if (supabase) {
      try {
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) console.error('Error deleting event:', error);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const state = computeState(events);

  return (
    <AppContext.Provider value={{ state, events, loading, addEvent, updateEvent, deleteEvent }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within an AppProvider');
  return context;
}

function computeState(events: AppEvent[]): FarmState {
  const state: FarmState = {
    lotes: {},
    ingredientes: {},
    formulas: {},
    despesasGerais: 0,
    pesagens: [],
    contasPagar: {},
    contasReceber: {},
    financeAccounts: {
      'acc_cash': { id: 'acc_cash', name: 'Caixa Fazenda', type: 'cash' },
      'acc_bank': { id: 'acc_bank', name: 'Conta Corrente', type: 'bank' }
    },
    cashTransactions: [],
    simulacoesVenda: []
  };

  for (const event of events) {
    switch (event.type) {
      case 'LOTE_CRIADO': {
        const p = event.payload;
        state.lotes[p.loteId] = {
          id: p.loteId,
          dataEntrada: p.dataEntrada,
          cabecasIniciais: p.cabecas,
          cabecasAtuais: p.cabecas,
          pesoMedioEntrada: p.pesoMedioEntrada,
          precoCompraArroba: p.precoCompraArroba,
          custoCompra: p.cabecas > 0 ? (p.pesoMedioEntrada / 30) * p.precoCompraArroba * p.cabecas : 0,
          custoRacao: 0,
          custoDireto: 0,
          estruturaRateada: 0,
          receitaRealizada: 0,
          cabecasVendidas: 0,
          quantidadeRacaoKg: 0,
          status: 'ATIVO',
          observacao: p.observacao,
        };
        break;
      }
      case 'LOTE_EXCLUIDO': {
        const p = event.payload;
        delete state.lotes[p.loteId];
        break;
      }
      case 'LOTE_SUBDIVIDIDO': {
        const p = event.payload;
        const loteOrigem = state.lotes[p.loteOrigemId];
        if (loteOrigem) {
          loteOrigem.cabecasAtuais -= p.cabecasTransferidas;
          const prop = loteOrigem.cabecasIniciais > 0
            ? p.cabecasTransferidas / loteOrigem.cabecasIniciais
            : 0;
          const custoCompraTransf = loteOrigem.custoCompra * prop;

          state.lotes[p.loteNovoId] = {
            id: p.loteNovoId,
            dataEntrada: p.data,
            cabecasIniciais: p.cabecasTransferidas,
            cabecasAtuais: p.cabecasTransferidas,
            pesoMedioEntrada: loteOrigem.pesoMedioEntrada,
            precoCompraArroba: loteOrigem.precoCompraArroba,
            custoCompra: custoCompraTransf,
            custoRacao: 0,
            custoDireto: 0,
            estruturaRateada: 0,
            receitaRealizada: 0,
            cabecasVendidas: 0,
            quantidadeRacaoKg: 0,
            status: 'ATIVO',
            observacao: p.observacao,
          };
        }
        break;
      }
      case 'MORTALIDADE_REGISTRADA': {
        const p = event.payload;
        const lote = state.lotes[p.loteId];
        if (lote) {
          lote.cabecasAtuais = Math.max(0, lote.cabecasAtuais - p.cabecas);
        }
        break;
      }
      case 'COMPRA_INGREDIENTE': {
        const p = event.payload;
        if (!state.ingredientes[p.ingredienteId]) {
          state.ingredientes[p.ingredienteId] = {
            id: p.ingredienteId,
            nome: p.ingredienteNome,
            quantidadeKg: 0,
            valorTotal: 0,
            ultimoCustoKg: 0,
          };
        }
        const ing = state.ingredientes[p.ingredienteId];
        ing.quantidadeKg += p.quantidadeKg;
        ing.valorTotal += p.valorTotal;
        ing.ultimoCustoKg = p.quantidadeKg > 0 ? p.valorTotal / p.quantidadeKg : 0;
        break;
      }
      case 'FORMULA_LOTE_CRIADA': {
        const p = event.payload;
        state.formulas[p.formulaId] = {
          id: p.formulaId,
          loteId: p.loteId,
          nome: p.nomeFormula,
          dataInicio: p.dataInicio,
          composicao: p.composicao,
          quantidadeUtilizadaKg: 0,
        };
        break;
      }
      case 'FORMULA_EXCLUIDA': {
        const p = event.payload;
        delete state.formulas[p.formulaId];
        break;
      }
      case 'TRATO_DIARIO_REGISTRADO': {
        const p = event.payload;
        const lote = state.lotes[p.loteId];
        const formula = state.formulas[p.formulaId];

        if (lote && formula) {
          lote.quantidadeRacaoKg += p.totalRacaoKg;
          formula.quantidadeUtilizadaKg += p.totalRacaoKg;

          let custoTrato = 0;
          for (const item of formula.composicao) {
            const ing = state.ingredientes[item.ingredienteId];
            if (ing) {
              const kgIngrediente = p.totalRacaoKg * (item.percentual / 100);
              custoTrato += kgIngrediente * ing.ultimoCustoKg;

              ing.quantidadeKg -= kgIngrediente;
              ing.valorTotal -= kgIngrediente * ing.ultimoCustoKg;
            }
          }
          lote.custoRacao += custoTrato;
        }
        break;
      }
      case 'DESPESA_LOTE_LANCADA': {
        const p = event.payload;
        if (state.lotes[p.loteId]) {
          state.lotes[p.loteId].custoDireto += p.valor;
        }
        break;
      }
      case 'DESPESA_GERAL_LANCADA': {
        const p = event.payload;
        state.despesasGerais += p.valor;
        break;
      }
      case 'VENDA_LOTE_REGISTRADA': {
        const p = event.payload;
        const lote = state.lotes[p.loteId];
        if (lote) {
          lote.cabecasAtuais = Math.max(0, lote.cabecasAtuais - p.cabecasVendidas);
          lote.cabecasVendidas += p.cabecasVendidas;

          const arrobas = p.pesoMedioKg / 30;
          const receita = arrobas * p.precoArroba * p.cabecasVendidas;
          lote.receitaRealizada += receita;

          if (lote.cabecasAtuais <= 0) lote.status = 'ENCERRADO';
        }
        break;
      }
      case 'RECEITA_DIVERSA_LANCADA': {
        const p = event.payload;
        if (p.categoria === 'Venda de Insumo' && p.itemEstoqueId && p.quantidade) {
          const ing = state.ingredientes[p.itemEstoqueId];
          if (ing) {
            ing.quantidadeKg -= p.quantidade;
            ing.valorTotal -= p.quantidade * ing.ultimoCustoKg;
          }
        } else if (p.categoria === 'Venda de Ração' && p.formulaId && p.quantidade) {
          const formula = state.formulas[p.formulaId];
          if (formula) {
            for (const item of formula.composicao) {
              const ing = state.ingredientes[item.ingredienteId];
              if (ing) {
                const kgIngrediente = p.quantidade * (item.percentual / 100);
                ing.quantidadeKg -= kgIngrediente;
                ing.valorTotal -= kgIngrediente * ing.ultimoCustoKg;
              }
            }
          }
        }
        break;
      }
      case 'PESAGEM_REGISTRADA': {
        const p = event.payload;
        state.pesagens.push({
          id: event.id,
          loteId: p.loteId,
          data: p.data,
          pesoMedioKg: p.pesoMedioKg,
          metodo: p.metodo,
          observacao: p.observacao
        });
        break;
      }
      case 'CONTAS_PAGAR_CRIADA': {
        const p = event.payload;
        state.contasPagar[p.id] = { ...p };
        break;
      }
      case 'CONTAS_PAGAR_PAGA': {
        const p = event.payload;
        if (state.contasPagar[p.id]) {
          state.contasPagar[p.id].status = 'Pago';
          state.contasPagar[p.id].dataPagamento = p.dataPagamento;
          state.contasPagar[p.id].contaId = p.contaId;
        }
        break;
      }
      case 'CONTAS_PAGAR_CANCELADA': {
        const p = event.payload;
        if (state.contasPagar[p.id]) state.contasPagar[p.id].status = 'Cancelado';
        break;
      }
      case 'CONTAS_RECEBER_CRIADA': {
        const p = event.payload;
        state.contasReceber[p.id] = { ...p };
        break;
      }
      case 'CONTAS_RECEBER_RECEBIDA': {
        const p = event.payload;
        if (state.contasReceber[p.id]) {
          state.contasReceber[p.id].status = 'Recebido';
          state.contasReceber[p.id].dataRecebimento = p.dataRecebimento;
          state.contasReceber[p.id].contaId = p.contaId;
        }
        break;
      }
      case 'CONTAS_RECEBER_CANCELADA': {
        const p = event.payload;
        if (state.contasReceber[p.id]) state.contasReceber[p.id].status = 'Cancelado';
        break;
      }
      case 'TRANSACAO_CAIXA_CRIADA': {
        const p = event.payload;
        state.cashTransactions.push({ ...p });
        break;
      }
      case 'SIMULACAO_VENDA_SALVA': {
        const p = event.payload;
        state.simulacoesVenda.push({ ...p });
        break;
      }
      // Casos sem efeito no estado computado
      case 'RATEIO_ESTRUTURA_GERADO':
      case 'ALOCACAO_CUSTO_VENDA':
        break;
    }
  }

  // Rateio das despesas gerais proporcional ao número de cabeças ativas
  let totalCabecasAtivas = 0;
  for (const id in state.lotes) {
    if (state.lotes[id].status === 'ATIVO') {
      totalCabecasAtivas += state.lotes[id].cabecasAtuais;
    }
  }
  if (totalCabecasAtivas > 0 && state.despesasGerais > 0) {
    const despesaPorCabeca = state.despesasGerais / totalCabecasAtivas;
    for (const id in state.lotes) {
      if (state.lotes[id].status === 'ATIVO') {
        state.lotes[id].estruturaRateada = state.lotes[id].cabecasAtuais * despesaPorCabeca;
      }
    }
  }

  return state;
}
