import React, {  useState  } from 'react';
import { useAppStore } from '../store';
import { format, differenceInDays } from 'date-fns';
import { Scale, Plus, LineChart } from 'lucide-react';
import { latestWeighing, gmd } from '../utils/calculations';

export default function Pesagem() {
  const { state, addEvent } = useAppStore();
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loteId, setLoteId] = useState('');
  const [pesoMedioKg, setPesoMedioKg] = useState('');
  const [metodo, setMetodo] = useState<'Balança' | 'Estimado' | 'Outro'>('Balança');
  const [observacao, setObservacao] = useState('');
  
  const [selectedLote, setSelectedLote] = useState<string | null>(null);

  const lotesAtivos = Object.values(state.lotes).filter(l => l.status === 'ATIVO');
  const pesagens = state.pesagens.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEvent('PESAGEM_REGISTRADA', {
      loteId,
      data,
      pesoMedioKg: parseFloat(pesoMedioKg),
      metodo,
      observacao,
    });
    setLoteId('');
    setPesoMedioKg('');
    setObservacao('');
  };

  // KPI Calculations
  const getLoteKpis = (id: string) => {
    const lote = state.lotes[id];
    if (!lote) return null;
    const latest = latestWeighing(id, format(new Date(), 'yyyy-MM-dd'), state.pesagens);
    const dias = differenceInDays(new Date(), new Date(lote.dataEntrada));
    const currentWeight = latest ? latest.pesoMedioKg : lote.pesoMedioEntrada;
    const diff = currentWeight - lote.pesoMedioEntrada;
    const gmdValue = gmd(lote.pesoMedioEntrada, currentWeight, dias);

    return { currentWeight, diff, gmdValue, dias };
  };

  const selectedKpis = loteId ? getLoteKpis(loteId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Scale className="w-6 h-6 text-indigo-700" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Pesagem</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-slate-500" />
            Registrar Pesagem
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input required type="date" value={data} onChange={e => setData(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lote</label>
                <select required value={loteId} onChange={e => setLoteId(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                  <option value="">Selecione o lote...</option>
                  {lotesAtivos.map(l => (
                    <option key={l.id} value={l.id}>{l.id} ({l.cabecasAtuais} cbç)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Peso Médio (kg)</label>
                <input required type="number" min="0.1" step="0.1" value={pesoMedioKg} onChange={e => setPesoMedioKg(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Método</label>
                <select required value={metodo} onChange={e => setMetodo(e.target.value as 'Balança' | 'Estimado' | 'Outro')} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                  <option value="Balança">Balança</option>
                  <option value="Estimado">Estimado</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
                <input type="text" value={observacao} onChange={e => setObservacao(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="Opcional" />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={!loteId || !pesoMedioKg} className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Salvar Pesagem
              </button>
            </div>
          </form>
        </div>

        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 text-white flex flex-col justify-center">
          <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-6">Performance do Lote</h3>
          
          {selectedKpis ? (
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Peso Atual Estimado</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-light font-mono text-indigo-400">
                    {selectedKpis.currentWeight.toFixed(1)}
                  </p>
                  <span className="text-slate-400 text-sm">kg</span>
                </div>
                <p className="text-xs text-emerald-400 mt-1">+{selectedKpis.diff.toFixed(1)} kg vs entrada</p>
              </div>
              
              <div className="h-px bg-slate-800 w-full"></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">GMD Estimado</p>
                  <p className="text-2xl font-light font-mono text-emerald-400">
                    {selectedKpis.gmdValue.toFixed(3)} <span className="text-xs text-slate-500">kg/dia</span>
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Dias no Sistema</p>
                  <p className="text-2xl font-light font-mono">
                    {selectedKpis.dias} <span className="text-xs text-slate-500">dias</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Scale className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Selecione um lote para ver a performance.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Histórico de Pesagens</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Lote</th>
                <th className="px-6 py-4 font-medium text-right">Peso Médio (kg)</th>
                <th className="px-6 py-4 font-medium">Método</th>
                <th className="px-6 py-4 font-medium">Observação</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pesagens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Nenhuma pesagem registrada.</td>
                </tr>
              ) : (
                pesagens.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{format(new Date(p.data), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{p.loteId}</td>
                    <td className="px-6 py-4 text-right font-mono">{p.pesoMedioKg.toFixed(1)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        {p.metodo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{p.observacao || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedLote(p.loteId)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center gap-1 justify-end w-full"
                      >
                        <LineChart className="w-4 h-4" /> Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer for Lote Details */}
      {selectedLote && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setSelectedLote(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Evolução de Peso: {selectedLote}</h2>
              <button onClick={() => setSelectedLote(null)} className="text-slate-500 hover:text-slate-700">
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {state.pesagens
                  .filter(p => p.loteId === selectedLote)
                  .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                  .map((p, i, arr) => {
                    const prev = i > 0 ? arr[i-1].pesoMedioKg : state.lotes[selectedLote]?.pesoMedioEntrada || p.pesoMedioKg;
                    const diff = p.pesoMedioKg - prev;
                    return (
                      <div key={p.id} className="p-4 border border-slate-200 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium">{format(new Date(p.data), 'dd/MM/yyyy')}</p>
                          <p className="text-xs text-slate-500">{p.metodo}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-mono">{p.pesoMedioKg.toFixed(1)} kg</p>
                          <p className={`text-xs ${diff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
