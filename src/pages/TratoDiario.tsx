import React, { useState } from 'react';
import { useAppStore } from '../store';
import { format, addDays, parseISO, differenceInDays } from 'date-fns';
import { Tractor, CalendarRange, Calendar, Pencil, Trash2, Clock, Filter } from 'lucide-react';

export default function TratoDiario() {
  const { state, events, addEvent, updateEvent, deleteEvent } = useAppStore();
  
  const [editingId, setEditingId] = useState<string | null>(null);

  // Controle de Lançamento (Único ou Massa)
  const [tipoLancamento, setTipoLancamento] = useState<'unico' | 'periodo'>('unico');
  
  // Datas
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dataInicio, setDataInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [loteId, setLoteId] = useState('');
  const [formulaId, setFormulaId] = useState('');
  const [totalRacaoKg, setTotalRacaoKg] = useState(''); 
  const [observacao, setObservacao] = useState('');

  // NOVO: Estado para o filtro da tabela de histórico
  const [filtroLoteId, setFiltroLoteId] = useState('');

  const lotesAtivos = (Object.values(state.lotes) as any[]).filter(l => l.status === 'ATIVO');
  const todosLotes = (Object.values(state.lotes) as any[]);
  const formulas = (Object.values(state.formulas) as any[]);
  
  const formulasLote = formulas.filter(f => f.loteId === loteId || f.loteId === 'GERAL');

  const loteSelecionado = state.lotes[loteId];
  const kgCabecaDia = loteSelecionado && totalRacaoKg 
    ? (parseFloat(totalRacaoKg) / loteSelecionado.cabecasAtuais).toFixed(2) 
    : '0.00';

  // Histórico de Tratos (Agora com filtro aplicado)
  const historicoTratos = events
    .filter(e => e.type === 'TRATO_DIARIO_REGISTRADO')
    .filter(e => {
      if (!filtroLoteId) return true; // Se não tem filtro, mostra todos
      const p = e.payload as any;
      return p.loteId === filtroLoteId; // Se tem filtro, mostra só o lote escolhido
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateEvent(editingId, {
        loteId,
        formulaId,
        totalRacaoKg: parseFloat(totalRacaoKg),
        data,
        observacao,
      });
      setEditingId(null);
    } else {
      if (tipoLancamento === 'unico') {
        await addEvent('TRATO_DIARIO_REGISTRADO', {
          loteId,
          formulaId,
          totalRacaoKg: parseFloat(totalRacaoKg),
          data,
          observacao,
        });
      } else {
        const start = parseISO(dataInicio);
        const end = parseISO(dataFim);
        const days = differenceInDays(end, start);

        if (days < 0) {
          alert('A data final deve ser maior ou igual à data inicial.');
          return;
        }
        if (days > 365) {
          alert('O período máximo para lançamento em massa é de 1 ano (365 dias).');
          return;
        }

        for (let i = 0; i <= days; i++) {
          const currentDate = format(addDays(start, i), 'yyyy-MM-dd');
          await addEvent('TRATO_DIARIO_REGISTRADO', {
            loteId,
            formulaId,
            totalRacaoKg: parseFloat(totalRacaoKg),
            data: currentDate,
            observacao: observacao ? `${observacao} (Lançamento em massa)` : 'Lançamento em massa',
          });
        }
        alert(`Lançamento em massa concluído! ${days + 1} dias de trato registrados com sucesso.`);
      }
    }

    resetForm();
  };

  const handleEdit = (ev: any) => {
    const p = ev.payload;
    setEditingId(ev.id);
    setTipoLancamento('unico'); 
    setData(p.data);
    setLoteId(p.loteId);
    setFormulaId(p.formulaId);
    setTotalRacaoKg(p.totalRacaoKg.toString());
    setObservacao(p.observacao || '');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de trato? Os custos e o estoque de ração serão recalculados automaticamente.')) {
      await deleteEvent(id);
      if (editingId === id) {
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
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
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-lg font-semibold">
              {editingId ? <span className="text-amber-600">Editando Registro de Trato</span> : 'Registrar Fornecimento'}
            </h2>
            
            {!editingId && (
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTipoLancamento('unico')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    tipoLancamento === 'unico' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Dia Único
                </button>
                <button
                  type="button"
                  onClick={() => setTipoLancamento('periodo')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    tipoLancamento === 'periodo' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <CalendarRange className="w-4 h-4" />
                  Em Massa
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {tipoLancamento === 'unico' ? (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data do Trato</label>
                  <input required type="date" value={data} onChange={e => setData(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Inicial</label>
                    <input required type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Final</label>
                    <input required type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} min={dataInicio} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lote</label>
                <select required value={loteId} onChange={e => { setLoteId(e.target.value); setFormulaId(''); }} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="">Selecione o lote...</option>
                  {lotesAtivos.map(l => (
                    <option key={l.id} value={l.id}>{l.id} ({l.cabecasAtuais} cbç)</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fórmula</label>
                <select required value={formulaId} onChange={e => setFormulaId(e.target.value)} disabled={!loteId} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-500 bg-white">
                  <option value="">Selecione a fórmula...</option>
                  {formulasLote.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.nome} {f.loteId === 'GERAL' ? '(Geral)' : ''}
                    </option>
                  ))}
                </select>
                {loteId && formulasLote.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Nenhuma fórmula cadastrada ou geral disponível.</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {tipoLancamento === 'unico' ? 'Total de Ração (kg)' : 'Total de Ração POR DIA (kg)'}
                </label>
                <input required type="number" min="0.1" step="0.1" value={totalRacaoKg} onChange={e => setTotalRacaoKg(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" placeholder="Ex: 500" />
                {tipoLancamento === 'periodo' && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    * Este valor será multiplicado e lançado para cada dia do período selecionado.
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
                <input type="text" value={observacao} onChange={e => setObservacao(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" placeholder="Opcional" />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              {editingId && (
                <button type="button" onClick={resetForm} className="px-6 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors">
                  Cancelar Edição
                </button>
              )}
              <button 
                type="submit" 
                disabled={!loteId || !formulaId || !totalRacaoKg} 
                className={`px-6 py-2.5 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {editingId ? 'Atualizar Trato' : (tipoLancamento === 'unico' ? 'Registrar Trato' : 'Registrar em Massa')}
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

            {tipoLancamento === 'periodo' && dataInicio && dataFim && (
              <>
                <div className="h-px bg-slate-800 w-full"></div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Dias Selecionados</p>
                  <p className="text-2xl font-light font-mono text-amber-400">
                    {Math.max(0, differenceInDays(parseISO(dataFim), parseISO(dataInicio)) + 1)} dias
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold">Histórico de Fornecimentos</h2>
          </div>
          
          {/* NOVO: Filtro por Lote */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap hidden sm:block">Filtrar:</label>
            <select
              value={filtroLoteId}
              onChange={e => setFiltroLoteId(e.target.value)}
              className="w-full sm:w-48 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
            >
              <option value="">Todos os Lotes</option>
              {todosLotes.map(l => (
                <option key={l.id} value={l.id}>Lote {l.id}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Lote</th>
                <th className="px-6 py-4 font-medium">Fórmula</th>
                <th className="px-6 py-4 font-medium text-right">Total Fornecido (kg)</th>
                <th className="px-6 py-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {historicoTratos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum trato registrado para este filtro.</td>
                </tr>
              ) : (
                historicoTratos.map(ev => {
                  const p = ev.payload as any;
                  const formulaNome = state.formulas[p.formulaId]?.nome || 'Fórmula Excluída';
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {format(new Date(p.data), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-800">
                          {p.loteId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {formulaNome}
                        {p.observacao && <span className="block text-xs font-normal text-slate-400 mt-1">{p.observacao}</span>}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-700 font-medium">
                        {p.totalRacaoKg.toLocaleString('pt-BR')} kg
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(ev)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Editar Trato"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(ev.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Excluir Trato"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
