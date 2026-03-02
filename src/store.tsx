import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { AppEvent, FarmState, LoteState, IngredienteState, FormulaState } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';

interface AppContextType {
  state: FarmState;
  events: AppEvent[];
  loading: boolean;
  addEvent: (type: string, payload: any) => Promise<void>;
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

  const addEvent = async (type: string, payload: any) => {
    if (!user) {
      console.error("Não é possível salvar: Usuário não está logado");
      return;
    }

    const newEvent: AppEvent = {
      id: uuidv4(),
      farm_id: 'farm_1',
      user_id: user.id,
      type: type as any,
      payload,
      timestamp: new Date().toISOString(),
    };

    setEvents((prev) => [...prev, newEvent]);

    if (supabase) {
      try {
        const { error } = await supabase
          .from('events')
          .insert([newEvent]);
          
        if (error) {
          console.error('Error saving event to Supabase:', error);
          setEvents((prev) => prev.filter(e => e.id !== newEvent.id));
        }
      } catch (error) {
        console.error('Error saving event:', error);
      }
    }
  };

  const state = computeState(events);

  return (
    <AppContext.Provider value={{ state, events, loading, addEvent }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
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
    const { type, payload } = event;

    switch (type) {
      case 'LOTE_CRIADO': {
        const p = payload as any;
        state.lotes[p.loteId] = {
          id: p.loteId,
          dataEntrada: p.dataEntrada,
          cabecasIniciais: p.cabecas,
          cabecasAtuais: p.cabecas,
          pesoMedioEntrada: p.pesoMedioEntrada,
          precoCompraArroba: p.precoCompraArroba,
          custoCompra: (p.pesoMedioEntrada / 30) * p.precoCompraArroba * p.cabecas,
          custoRacao: 0,
          custoDireto: 0,
          estruturaRateada: 0,
          receitaRealizada: 0,
          cabecasVendidas: 0,
          status: 'ATIVO',
          observacao: p.observacao, 
        };
        break;
      }
      case 'LOTE_EXCLUIDO': {
        const p = payload as any;
        delete state.lotes[p.loteId];
        break;
      }
      case 'LOTE_SUBDIVIDIDO': {
        const p = payload as any;
        const loteOrigem = state.lotes[p.loteOrigemId];
        if (loteOrigem) {
          loteOrigem.cabecasAtuais -= p.cabecasTransferidas;
          
          const prop = p.cabecasTransferidas / loteOrigem.cabecasIniciais;
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
            status: 'ATIVO',
            observacao: p.observacao,
          };
        }
        break;
      }
      case 'MORTALIDADE_REGISTRADA': {
        const p = payload as any;
        if (state.lotes[p.loteId]) {
          state.lotes[p.loteId].cabecasAtuais -= p.cabecas;
        }
        break;
      }
      case 'COMPRA_INGREDIENTE': {
        const p = payload as any;
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
        ing.ultimoCustoKg = p.valorTotal / p.quantidadeKg;
        break;
      }
      case 'FORMULA_LOTE_CRIADA': {
        const p = payload as any;
        state.formulas[p.formulaId] = {
          id: p.formulaId,
          loteId: p.loteId,
          nome: p.nomeFormula,
          dataInicio: p.dataInicio,
          composicao: p.composicao,
        };
        break;
      }
      // NOVO EVENTO: Permite que o sistema apague a fórmula da memória
      case 'FORMULA_EXCLUIDA': {
        const p = payload as any;
        delete state.formulas[p.formulaId];
        break;
      }
      case 'TRATO_DIARIO_REGISTRADO': {
        const p = payload as any;
        const lote = state.lotes[p.loteId];
        const formula = state.formulas[p.formulaId];
        
        if (lote && formula) {
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
        const p = payload as any;
        if (state.lotes[p.loteId]) {
          state.lotes[p.loteId].custoDireto += p.valor;
        }
        break;
      }
      case 'DESPESA_GERAL_LANCADA': {
        const p = payload as any;
        state.despesasGerais += p.valor;
        break;
      }
      case 'VENDA_LOTE_REGISTRADA': {
        const p = payload as any;
        const lote = state.lotes[p.loteId];
        if (lote) {
          lote.cabecasAtuais -= p.cabecasVendidas;
          lote.cabecasVendidas += p.cabecasVendidas;
          
          const arrobas = p.pesoMedioKg / 30;
          const receita = arrobas * p.precoArroba * p.cabecasVendidas;
          lote.receitaRealizada += receita;
          
          if (lote.cabecasAtuais <= 0) {
            lote.status = 'ENCERRADO';
          }
        }
        break;
      }
      case 'RECEITA_DIVERSA_LANCADA': {
        const p = payload as any;
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
        const p = payload as any;
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
        const p = payload as any;
        state.contasPagar[p.id] = { ...p };
        break;
      }
      case 'CONTAS_PAGAR_PAGA': {
        const p = payload as any;
        if (state.contasPagar[p.id]) {
          state.contasPagar[p.id].status = 'Pago';
          state.contasPagar[p.id].dataPagamento = p.dataPagamento;
          state.contasPagar[p.id].contaId = p.contaId;
        }
        break;
      }
      case 'CONTAS_PAGAR_CANCELADA': {
        const p = payload as any;
        if (state.contasPagar[p.id]) {
          state.contasPagar[p.id].status = 'Cancelado';
        }
        break;
      }
      case 'CONTAS_RECEBER_CRIADA': {
        const p = payload as any;
        state.contasReceber[p.id] = { ...p };
        break;
      }
      case 'CONTAS_RECEBER_RECEBIDA': {
        const p = payload as any;
        if (state.contasReceber[p.id]) {
          state.contasReceber[p.id].status = 'Recebido';
          state.contasReceber[p.id].dataRecebimento = p.dataRecebimento;
          state.contasReceber[p.id].contaId = p.contaId;
        }
        break;
      }
      case 'CONTAS_RECEBER_CANCELADA': {
        const p = payload as any;
        if (state.contasReceber[p.id]) {
          state.contasReceber[p.id].status = 'Cancelado';
        }
        break;
      }
      case 'TRANSACAO_CAIXA_CRIADA': {
        const p = payload as any;
        state.cashTransactions.push({ ...p });
        break;
      }
      case 'SIMULACAO_VENDA_SALVA': {
        const p = payload as any;
        state.simulacoesVenda.push({ ...p });
        break;
      }
    }
  }

  return state;
}
