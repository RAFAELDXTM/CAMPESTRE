import { useState } from 'react';
import { useAppStore } from '../store';
import { format } from 'date-fns';
import { LineChart, Calculator, TrendingUp, AlertCircle } from 'lucide-react';
import { simulateSale, breakEvenPrice, latestWeighing } from '../utils/calculations';

export default function AnaliseAvancada() {
  const { state, addEvent } = useAppStore();
  const [activeTab, setActiveTab] = useState<'simulador' | 'dashboard'>('simulador');

  // Simulador State
  const [loteId, setLoteId] = useState('');
  const [dataReferencia, setDataReferencia] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [pesoEstimado, setPesoEstimado] = useState('');
  const [precoEstimado, setPrecoEstimado] = useState('');

  const lotesAtivos = (Object.values(state.lotes) as any[]).filter(l => l.status === 'ATIVO');
  const loteSelecionado = loteId ? state.lotes[loteId] : null;

  // Auto-fill weight based on latest weighing when lote changes
  const handleLoteChange = (id: string) => {
    setLoteId(id);
    if (id) {
      const latest = latestWeighing(id, dataReferencia, state.pesagens);
      if (latest) {
        setPesoEstimado(latest.pesoMedioKg.toString());
      } else {
        const lote = state.lotes[id];
        setPesoEstimado(lote ? lote.pesoMedioEntrada.toString() : '');
      }
    } else {
      setPesoEstimado('');
    }
  };

  const simulacao = loteId && precoEstimado ? simulateSale({
    lotId: loteId,
    asOfDate: dataReferencia,
    pricePerArroba: parseFloat(precoEstimado),
    avgWeightOverride: pesoEstimado ? parseFloat(pesoEstimado) : undefined,
    state
  }) : null;

  const bePrice = loteId ? breakEvenPrice({
    lotId: loteId,
    asOfDate: dataReferencia,
    avgWeightOverride: pesoEstimado ? parseFloat(pesoEstimado) : undefined,
    state
  }) : 0;

  const handleSalvarSimulacao = async () => {
    if (!simulacao) return;
    await addEvent('SIMULACAO_VENDA_SALVA', {
      id: `sim_${Date.now()}`,
      data: format(new Date(), 'yyyy-MM-dd'),
      loteId,
      dataReferencia,
      pesoEstimado: parseFloat(pesoEstimado),
      precoEstimado: parseFloat(precoEstimado),
      cabecas: simulacao.heads,
      arrobas: simulacao.arrobas,
      receita: simulacao.revenue,
      custo: simulacao.cost,
      lucro: simulacao.profit,
      margem: simulacao.margin
    });
    alert('Simulação salva com sucesso!');
  };

  // Dashboard calculations
  const lotesEncerrados = (Object.values(state.lotes) as any[]).filter(l => l.status === 'ENCERRADO');
  const rankingLucro = [...lotesEncerrados].sort((a, b) => {
    const lucroA = a.receitaRealizada - (a.custoCompra + a.custoRacao + a.custoDireto); // Simplified
    const lucroB = b.receitaRealizada - (b.custoCompra + b.custoRacao + b.custoDireto);
    return lucroB - lucroA;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <LineChart className="w-6 h-6 text-purple-700" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Análise Avançada</h1>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('simulador')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === 'simulador'
              ? 'border-b-2 border-purple-600 text-purple-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Simulador de Venda & Break-even
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-purple-600 text-purple-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Dashboard Executivo
        </button>
      </div>

      {activeTab === 'simulador' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-slate-500" />
                Parâmetros
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lote</label>
                  <select value={loteId} onChange={e => handleLoteChange(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option value="">Selecione o lote...</option>
                    {lotesAtivos.map(l => (
                      <option key={l.id} value={l.id}>{l.id} ({l.cabecasAtuais} cbç)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data de Referência</label>
                  <input type="date" value={dataReferencia} onChange={e => setDataReferencia(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Peso Médio Estimado (kg)</label>
                  <input type="number" min="0.1" step="0.1" value={pesoEstimado} onChange={e => setPesoEstimado(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  {!latestWeighing(loteId, dataReferencia, state.pesagens) && loteId && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Sem pesagem recente. Usando peso de entrada.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preço Estimado (R$/@)</label>
                  <input type="number" min="0.01" step="0.01" value={precoEstimado} onChange={e => setPrecoEstimado(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </div>

            {loteId && (
              <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800 text-white">
                <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-4">Break-even Point</h3>
                <p className="text-sm text-slate-300 mb-2">Preço mínimo para empatar (Custo = Receita):</p>
                <p className="text-3xl font-light font-mono text-amber-400">
                  R$ {bePrice.toFixed(2)} <span className="text-lg text-slate-500">/@</span>
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {simulacao ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900">Resultado da Simulação</h2>
                  <button onClick={handleSalvarSimulacao} className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                    Salvar Simulação
                  </button>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Cabeças</p>
                    <p className="text-2xl font-semibold text-slate-900">{simulacao.heads}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Arrobas Totais</p>
                    <p className="text-2xl font-semibold text-slate-900">{simulacao.arrobas.toFixed(1)} @</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Custo Estimado</p>
                    <p className="text-2xl font-mono text-rose-600">R$ {simulacao.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Receita Estimada</p>
                    <p className="text-2xl font-mono text-emerald-600">R$ {simulacao.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="md:col-span-2 p-4 bg-slate-900 rounded-xl text-white">
                    <p className="text-sm text-slate-400 mb-1">Lucro Estimado</p>
                    <div className="flex items-end gap-4">
                      <p className={`text-4xl font-light font-mono ${simulacao.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        R$ {simulacao.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-lg mb-1 ${simulacao.margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ({simulacao.margin.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sensibilidade */}
                <div className="p-6 border-t border-slate-200 bg-slate-50">
                  <h3 className="text-sm font-medium text-slate-700 mb-4">Análise de Sensibilidade (Preço da Arroba)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[0.95, 1, 1.05].map(multiplier => {
                      const p = parseFloat(precoEstimado) * multiplier;
                      const r = simulacao.arrobas * p;
                      const l = r - simulacao.cost;
                      return (
                        <div key={multiplier} className={`p-3 rounded-lg border ${multiplier === 1 ? 'border-purple-300 bg-purple-50' : 'border-slate-200 bg-white'}`}>
                          <p className="text-xs text-slate-500 mb-1">{multiplier === 1 ? 'Base' : multiplier < 1 ? '-5%' : '+5%'}</p>
                          <p className="font-mono text-sm font-medium text-slate-900 mb-1">R$ {p.toFixed(2)}</p>
                          <p className={`font-mono text-sm ${l >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            R$ {l.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Preencha os parâmetros ao lado para gerar a simulação.</p>
              </div>
            )}

            {/* Histórico de Simulações */}
            {state.simulacoesVenda.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">Simulações Salvas</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-medium">Data</th>
                        <th className="px-4 py-3 font-medium">Lote</th>
                        <th className="px-4 py-3 font-medium text-right">Peso</th>
                        <th className="px-4 py-3 font-medium text-right">Preço/@</th>
                        <th className="px-4 py-3 font-medium text-right">Lucro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {state.simulacoesVenda.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">{format(new Date(s.data), 'dd/MM/yyyy')}</td>
                          <td className="px-4 py-3 font-medium">{s.loteId}</td>
                          <td className="px-4 py-3 text-right font-mono">{s.pesoEstimado} kg</td>
                          <td className="px-4 py-3 text-right font-mono">R$ {s.precoEstimado.toFixed(2)}</td>
                          <td className={`px-4 py-3 text-right font-mono font-medium ${s.lucro >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            R$ {s.lucro.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-slate-900">Ranking de Lucro (Lotes Encerrados)</h3>
              </div>
              <div className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Lote</th>
                      <th className="px-4 py-3 font-medium text-right">Receita</th>
                      <th className="px-4 py-3 font-medium text-right">Lucro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rankingLucro.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">Nenhum lote encerrado.</td></tr>
                    ) : (
                      rankingLucro.slice(0, 5).map(l => {
                        const lucro = l.receitaRealizada - (l.custoCompra + l.custoRacao + l.custoDireto);
                        return (
                          <tr key={l.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium">{l.id}</td>
                            <td className="px-4 py-3 text-right font-mono">R$ {l.receitaRealizada.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                            <td className={`px-4 py-3 text-right font-mono font-medium ${lucro >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              R$ {lucro.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
              <h3 className="text-slate-500 font-medium mb-2">Despesas Gerais (Estrutura)</h3>
              <p className="text-4xl font-light font-mono text-slate-900 mb-2">
                R$ {state.despesasGerais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-slate-500 max-w-xs">
                Este valor deve ser rateado entre os lotes ativos para compor o custo real da arroba produzida.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
