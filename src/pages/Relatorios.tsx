import { useState } from 'react';
import { useAppStore } from '../store';
import { BarChart3, Download, Eye, X } from 'lucide-react';
import { format } from 'date-fns';
import { estimateLotCost, latestWeighing } from '../utils/calculations';

export default function Relatorios() {
  const { state } = useAppStore();
  const [selectedLoteId, setSelectedLoteId] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumo' | 'custos' | 'pesagens' | 'vendas'>('resumo');

  const lotes = Object.values(state.lotes);
  const lote = selectedLoteId ? state.lotes[selectedLoteId] : null;

  const totalCabecasAtivas = lotes.reduce((acc, l) => acc + (l.status === 'ATIVO' ? l.cabecasAtuais : 0), 0);
  
  const getEstruturaRateada = (loteId: string) => {
    const l = state.lotes[loteId];
    if (!l || totalCabecasAtivas === 0) return 0;
    if (l.status === 'ATIVO') {
      return state.despesasGerais * (l.cabecasAtuais / totalCabecasAtivas);
    }
    return 0;
  };

  const openDetails = (id: string) => {
    setSelectedLoteId(id);
    setIsDrawerOpen(true);
    setActiveTab('resumo');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-indigo-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios de Performance</h1>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">Visão Geral dos Lotes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Lote</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Cabeças</th>
                <th className="px-6 py-4 font-medium text-right">Custo Total (Est.)</th>
                <th className="px-6 py-4 font-medium text-right">Receita Realizada</th>
                <th className="px-6 py-4 font-medium text-right">Resultado</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum lote registrado.</td>
                </tr>
              ) : (
                lotes.map((l) => {
                  const custoTotal = estimateLotCost(l.id, state);
                  const resultado = l.receitaRealizada - custoTotal;
                  return (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{l.id}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          l.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">{l.cabecasAtuais}</td>
                      <td className="px-6 py-4 text-right font-mono text-rose-600">R$ {custoTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-600">R$ {l.receitaRealizada.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                      <td className={`px-6 py-4 text-right font-mono font-medium ${resultado >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        R$ {resultado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openDetails(l.id)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center gap-1 justify-end w-full"
                        >
                          <Eye className="w-4 h-4" /> Detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer for Lote Details */}
      {isDrawerOpen && lote && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Detalhes do Lote: {lote.id}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Status: <span className={`font-medium ${lote.status === 'ATIVO' ? 'text-emerald-600' : 'text-slate-700'}`}>{lote.status}</span>
                </p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-4 px-6 border-b border-slate-200 bg-white">
              {['resumo', 'custos', 'pesagens', 'vendas'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'resumo' | 'custos' | 'pesagens' | 'vendas')}
                  className={`py-4 px-1 font-medium text-sm transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-indigo-600 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {activeTab === 'resumo' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-sm text-slate-500 mb-1">Cabeças Iniciais</p>
                      <p className="text-2xl font-semibold text-slate-900">{lote.cabecasIniciais}</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-sm text-slate-500 mb-1">Cabeças Atuais</p>
                      <p className="text-2xl font-semibold text-slate-900">{lote.cabecasAtuais}</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-sm text-slate-500 mb-1">Peso Entrada</p>
                      <p className="text-2xl font-mono text-slate-900">{lote.pesoMedioEntrada} kg</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-sm text-slate-500 mb-1">Última Pesagem</p>
                      <p className="text-2xl font-mono text-indigo-600">
                        {latestWeighing(lote.id, format(new Date(), 'yyyy-MM-dd'), state.pesagens)?.pesoMedioKg || lote.pesoMedioEntrada} kg
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900 rounded-xl shadow-sm border border-slate-800 text-white">
                    <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-4">Resultado Realizado</h3>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Receita - Custos</p>
                        <p className={`text-4xl font-light font-mono ${lote.receitaRealizada - estimateLotCost(lote.id, state) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          R$ {(lote.receitaRealizada - estimateLotCost(lote.id, state)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'custos' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Composição de Custos</h3>
                  </div>
                  <div className="p-0">
                    <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-600">Compra Animais</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-900">R$ {lote.custoCompra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-600">Ração</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-900">R$ {lote.custoRacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-600">Despesas Diretas</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-900">R$ {lote.custoDireto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-600">Estrutura (Rateio Est.)</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-900">R$ {getEstruturaRateada(lote.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr className="bg-slate-50 font-semibold">
                          <td className="px-4 py-4 text-slate-900">Custo Total Estimado</td>
                          <td className="px-4 py-4 text-right font-mono text-rose-600">R$ {estimateLotCost(lote.id, state).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'pesagens' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-medium">Data</th>
                        <th className="px-4 py-3 font-medium text-right">Peso (kg)</th>
                        <th className="px-4 py-3 font-medium">Método</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {state.pesagens.filter(p => p.loteId === lote.id).length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">Nenhuma pesagem registrada.</td></tr>
                      ) : (
                        state.pesagens.filter(p => p.loteId === lote.id).sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map(p => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">{format(new Date(p.data), 'dd/MM/yyyy')}</td>
                            <td className="px-4 py-3 text-right font-mono">{p.pesoMedioKg.toFixed(1)}</td>
                            <td className="px-4 py-3 text-slate-500">{p.metodo}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'vendas' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 text-center text-slate-500">
                    <p>Vendas registradas: {lote.cabecasVendidas} cabeças</p>
                    <p className="text-lg font-mono text-emerald-600 mt-2">Receita Total: R$ {lote.receitaRealizada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
