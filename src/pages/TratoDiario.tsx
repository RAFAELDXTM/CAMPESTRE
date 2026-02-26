import React, {  useState  } from 'react';
import { useAppStore } from '../store';
import { format } from 'date-fns';
import { Tractor } from 'lucide-react';

export default function TratoDiario() {
  const { state, addEvent } = useAppStore();
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loteId, setLoteId] = useState('');
  const [formulaId, setFormulaId] = useState('');
  const [totalRacaoKg, setTotalRacaoKg] = useState('');
  const [observacao, setObservacao] = useState('');

  const lotesAtivos = (Object.values(state.lotes) as any[]).filter(l => l.status === 'ATIVO');
  const formulas = (Object.values(state.formulas) as any[]);
  
  // Filter formulas by selected lote
  const formulasLote = formulas.filter(f => f.loteId === loteId);

  const loteSelecionado = state.lotes[loteId];
  const kgCabecaDia = loteSelecionado && totalRacaoKg 
    ? (parseFloat(totalRacaoKg) / loteSelecionado.cabecasAtuais).toFixed(2) 
    : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEvent('TRATO_DIARIO_REGISTRADO', {
      loteId,
      formulaId,
      totalRacaoKg: parseFloat(totalRacaoKg),
      data,
      observacao,
    });
    setLoteId('');
    setFormulaId('');
    setTotalRacaoKg('');
    setObservacao('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Tractor className="w-6 h-6 text-emerald-700" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Trato Diário</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-6">Registrar Fornecimento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input required type="date" value={data} onChange={e => setData(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lote</label>
                <select required value={loteId} onChange={e => { setLoteId(e.target.value); setFormulaId(''); }} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                  <option value="">Selecione o lote...</option>
                  {lotesAtivos.map(l => (
                    <option key={l.id} value={l.id}>{l.id} ({l.cabecasAtuais} cbç)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fórmula</label>
                <select required value={formulaId} onChange={e => setFormulaId(e.target.value)} disabled={!loteId} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-500">
                  <option value="">Selecione a fórmula...</option>
                  {formulasLote.map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
                {loteId && formulasLote.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Nenhuma fórmula cadastrada para este lote.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total de Ração (kg)</label>
                <input required type="number" min="0.1" step="0.1" value={totalRacaoKg} onChange={e => setTotalRacaoKg(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
                <input type="text" value={observacao} onChange={e => setObservacao(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Opcional" />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={!loteId || !formulaId || !totalRacaoKg} className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Registrar Trato
              </button>
            </div>
          </form>
        </div>

        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 text-white flex flex-col justify-center">
          <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-6">Resumo do Trato</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-slate-400 text-sm mb-1">Saldo de Cabeças</p>
              <p className="text-3xl font-light font-mono">
                {loteSelecionado ? loteSelecionado.cabecasAtuais : '-'}
              </p>
            </div>
            
            <div className="h-px bg-slate-800 w-full"></div>
            
            <div>
              <p className="text-slate-400 text-sm mb-1">Consumo Estimado</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-light font-mono text-emerald-400">
                  {kgCabecaDia}
                </p>
                <span className="text-slate-400 text-sm">kg/cbç/dia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
