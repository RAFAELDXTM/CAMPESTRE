import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, SplitSquareHorizontal, Skull, Eye, Trash2, X, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function Lotes() {
  const { state, events, addEvent } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [isSubdividing, setIsSubdividing] = useState(false);
  const [isMortalidade, setIsMortalidade] = useState(false);
  
  const [loteDetalhesId, setLoteDetalhesId] = useState<string | null>(null);

  const [loteId, setLoteId] = useState('');
  const [dataEntrada, setDataEntrada] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [cabecas, setCabecas] = useState('');
  const [pesoMedio, setPesoMedio] = useState('');
  const [precoArroba, setPrecoArroba] = useState('');
  const [observacao, setObservacao] = useState('');

  const [loteOrigemId, setLoteOrigemId] = useState('');
  const [loteNovoId, setLoteNovoId] = useState('');
  const [cabecasTransferidas, setCabecasTransferidas] = useState('');

  const [mortalidadeLoteId, setMortalidadeLoteId] = useState('');
  const [mortalidadeCabecas, setMortalidadeCabecas] = useState('');

  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [subdivideErrors, setSubdivideErrors] = useState<Record<string, string>>({});
  const [mortalidadeErrors, setMortalidadeErrors] = useState<Record<string, string>>({});

  const validateCreate = () => {
    const e: Record<string, string> = {};
    if (!loteId.trim()) e.loteId = 'Informe o ID do lote.';
    else if (state.lotes[loteId.trim()]) e.loteId = 'Já existe um lote com este ID.';
    const n = parseInt(cabecas);
    if (!cabecas || isNaN(n) || n < 1) e.cabecas = 'Informe ao menos 1 cabeça.';
    const peso = parseFloat(pesoMedio);
    if (!pesoMedio || isNaN(peso) || peso <= 0) e.pesoMedio = 'Peso deve ser maior que zero.';
    const preco = parseFloat(precoArroba);
    if (!precoArroba || isNaN(preco) || preco <= 0) e.precoArroba = 'Preço deve ser maior que zero.';
    return e;
  };

  const validateSubdivide = () => {
    const e: Record<string, string> = {};
    if (!loteOrigemId) e.loteOrigemId = 'Selecione o lote de origem.';
    if (!loteNovoId.trim()) e.loteNovoId = 'Informe o ID do novo lote.';
    else if (state.lotes[loteNovoId.trim()]) e.loteNovoId = 'Já existe um lote com este ID.';
    const max = state.lotes[loteOrigemId]?.cabecasAtuais ?? 0;
    const n = parseInt(cabecasTransferidas);
    if (!cabecasTransferidas || isNaN(n) || n < 1) e.cabecasTransferidas = 'Mínimo de 1 cabeça.';
    else if (n >= max) e.cabecasTransferidas = `Máximo ${max - 1} (deve restar ao menos 1 no lote origem).`;
    return e;
  };

  const validateMortalidade = () => {
    const e: Record<string, string> = {};
    if (!mortalidadeLoteId) e.mortalidadeLoteId = 'Selecione o lote.';
    const max = state.lotes[mortalidadeLoteId]?.cabecasAtuais ?? 0;
    const n = parseInt(mortalidadeCabecas);
    if (!mortalidadeCabecas || isNaN(n) || n < 1) e.mortalidadeCabecas = 'Mínimo de 1 cabeça.';
    else if (n > max) e.mortalidadeCabecas = `Máximo ${max} (total atual do lote).`;
    return e;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateCreate();
    if (Object.keys(errs).length > 0) { setCreateErrors(errs); return; }
    setCreateErrors({});
    await addEvent('LOTE_CRIADO', {
      loteId: loteId.trim(),
      dataEntrada,
      cabecas: parseInt(cabecas),
      pesoMedioEntrada: parseFloat(pesoMedio),
      precoCompraArroba: parseFloat(precoArroba),
      observacao,
    });
    setIsCreating(false);
    resetForms();
  };

  const handleSubdivide = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateSubdivide();
    if (Object.keys(errs).length > 0) { setSubdivideErrors(errs); return; }
    setSubdivideErrors({});
    await addEvent('LOTE_SUBDIVIDIDO', {
      loteOrigemId,
      loteNovoId: loteNovoId.trim(),
      cabecasTransferidas: parseInt(cabecasTransferidas),
      data: format(new Date(), 'yyyy-MM-dd'),
      observacao,
    });
    setIsSubdividing(false);
    resetForms();
  };

  const handleMortalidade = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateMortalidade();
    if (Object.keys(errs).length > 0) { setMortalidadeErrors(errs); return; }
    setMortalidadeErrors({});
    await addEvent('MORTALIDADE_REGISTRADA', {
      loteId: mortalidadeLoteId,
      cabecas: parseInt(mortalidadeCabecas),
      data: format(new Date(), 'yyyy-MM-dd'),
      observacao,
    });
    setIsMortalidade(false);
    resetForms();
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o lote ${id}? Esta ação não pode ser desfeita e removerá o lote do painel.`);
    if (confirmDelete) {
      await addEvent('LOTE_EXCLUIDO', { loteId: id });
      if (loteDetalhesId === id) setLoteDetalhesId(null);
    }
  };

  const resetForms = () => {
    setLoteId(''); setCabecas(''); setPesoMedio(''); setPrecoArroba(''); setObservacao('');
    setLoteOrigemId(''); setLoteNovoId(''); setCabecasTransferidas('');
    setMortalidadeLoteId(''); setMortalidadeCabecas('');
  };

  const lotes = Object.values(state.lotes);
  const loteDetalhes = loteDetalhesId ? state.lotes[loteDetalhesId] : null;

  // Cálculos de Desempenho
  const diasConfinamento = loteDetalhes ? Math.max(1, differenceInDays(new Date(), new Date(loteDetalhes.dataEntrada))) : 1;
  // Agora o Custo Operacional Total inclui a fatia da estrutura rateada
  const custoOperacional = loteDetalhes ? (loteDetalhes.custoRacao + loteDetalhes.custoDireto + (loteDetalhes.estruturaRateada || 0)) : 0;
  const custoOperacionalDia = custoOperacional / diasConfinamento;
  const custoCabecaDia = loteDetalhes && loteDetalhes.cabecasAtuais > 0 ? (custoOperacionalDia / loteDetalhes.cabecasAtuais) : 0;

  // Filtrar histórico de eventos do lote selecionado
  const historicoLote = events.filter(e => {
    const p = e.payload as Record<string, unknown>;
    return p['loteId'] === loteDetalhesId || p['loteOrigemId'] === loteDetalhesId || p['loteNovoId'] === loteDetalhesId;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Tradutor de nomes de eventos
  const formatEventName = (type: string) => {
    const map: Record<string, string> = {
      'LOTE_CRIADO': 'Entrada do Lote',
      'LOTE_SUBDIVIDIDO': 'Subdivisão de Lote',
      'MORTALIDADE_REGISTRADA': 'Baixa/Mortalidade',
      'FORMULA_LOTE_CRIADA': 'Fórmula Atribuída',
      'TRATO_DIARIO_REGISTRADO': 'Trato Diário',
      'DESPESA_LOTE_LANCADA': 'Despesa Direta',
      'VENDA_LOTE_REGISTRADA': 'Venda de Animais',
      'PESAGEM_REGISTRADA': 'Pesagem',
    };
    return map[type] || type;
  };

  // Formatador de detalhes rápidos do histórico
  const getEventBrief = (ev: any) => {
    const p = ev.payload;
    switch (ev.type) {
      case 'LOTE_CRIADO': return `${p.cabecas} cbç | ${p.pesoMedioEntrada}kg | R$${p.precoCompraArroba}/@`;
      case 'TRATO_DIARIO_REGISTRADO': return `${p.totalRacaoKg} kg de ração`;
      case 'MORTALIDADE_REGISTRADA': return `${p.cabecas} cabeça(s) perdida(s)`;
      case 'VENDA_LOTE_REGISTRADA': return `Vendidas ${p.cabecasVendidas} cbç | ${p.pesoMedioKg}kg`;
      case 'DESPESA_LOTE_LANCADA': return `${p.categoria} - R$ ${p.valor.toFixed(2)}`;
      case 'LOTE_SUBDIVIDIDO': return `Transferidas ${p.cabecasTransferidas} cbç`;
      default: return '-';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Gestão de Lotes</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm transition-colors">
            <Plus className="w-4 h-4" /> Novo Lote
          </button>
          <button onClick={() => setIsSubdividing(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors">
            <SplitSquareHorizontal className="w-4 h-4" /> Subdividir
          </button>
          <button onClick={() => setIsMortalidade(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors">
            <Skull className="w-4 h-4" /> Mortalidade
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-emerald-800">Criar Novo Lote</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID do Lote</label>
              <input type="text" value={loteId} onChange={e => { setLoteId(e.target.value); setCreateErrors(p => ({ ...p, loteId: '' })); }} className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${createErrors.loteId ? 'border-red-400 bg-red-50/30' : 'border-slate-300'}`} />
              {createErrors.loteId && <p className="text-red-600 text-xs mt-1">{createErrors.loteId}</p>}
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Data de Entrada</label><input required type="date" value={dataEntrada} onChange={e => setDataEntrada(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" /></div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número de Cabeças</label>
              <input type="number" min="1" value={cabecas} onChange={e => { setCabecas(e.target.value); setCreateErrors(p => ({ ...p, cabecas: '' })); }} className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${createErrors.cabecas ? 'border-red-400 bg-red-50/30' : 'border-slate-300'}`} />
              {createErrors.cabecas && <p className="text-red-600 text-xs mt-1">{createErrors.cabecas}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Peso Médio (kg)</label>
              <input type="number" min="0.1" step="0.1" value={pesoMedio} onChange={e => { setPesoMedio(e.target.value); setCreateErrors(p => ({ ...p, pesoMedio: '' })); }} className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${createErrors.pesoMedio ? 'border-red-400 bg-red-50/30' : 'border-slate-300'}`} />
              {createErrors.pesoMedio && <p className="text-red-600 text-xs mt-1">{createErrors.pesoMedio}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço Compra (R$/@)</label>
              <input type="number" min="0.01" step="0.01" value={precoArroba} onChange={e => { setPrecoArroba(e.target.value); setCreateErrors(p => ({ ...p, precoArroba: '' })); }} className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${createErrors.precoArroba ? 'border-red-400 bg-red-50/30' : 'border-slate-300'}`} />
              {createErrors.precoArroba && <p className="text-red-600 text-xs mt-1">{createErrors.precoArroba}</p>}
            </div>
            <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-medium text-slate-700 mb-1">Observação</label><input type="text" value={observacao} onChange={e => setObservacao(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" /></div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Salvar Lote</button>
            </div>
          </form>
        </div>
      )}

      {isSubdividing && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Subdividir Lote</h2>
          <form onSubmit={handleSubdivide} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lote Origem</label>
              <select value={loteOrigemId} onChange={e => { setLoteOrigemId(e.target.value); setSubdivideErrors(p => ({ ...p, loteOrigemId: '' })); }} className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${subdivideErrors.loteOrigemId ? 'border-red-400 bg-red-50/30' : 'border-slate-300'}`}>
                <option value="">Selecione...</option>
                {lotes.filter(l => l.status === 'ATIVO').map(l => <option key={l.id} value={l.id}>{l.id} ({l.cabecasAtuais} cbç)</option>)}
              </select>
              {subdivideErrors.loteOrigemId && <p className="text-red-600 text-xs mt-1">{subdivideErrors.loteOrigemId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Novo ID do Lote</label>
              <input type="text" value={loteNovoId} onChange={e => { setLoteNovoId(e.target.value); setSubdivideErrors(p => ({ ...p, loteNovoId: '' })); }} className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${subdivideErrors.loteNovoId ? 'border-red-400 bg-red-50/30' : 'border-slate-300'}`} />
              {subdivideErrors.loteNovoId && <p className="text-red-600 text-xs mt-1">{subdivideErrors.loteNovoId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cabeças Transferidas {loteOrigemId && <span className="text-slate-400 font-normal">(máx: {(state.lotes[loteOrigemId]?.cabecasAtuais ?? 1) - 1})</span>}</label>
              <input type="number" min="1" value={cabecasTransferidas} onChange={e => { setCabecasTransferidas(e.target.value); setSubdivideErrors(p => ({ ...p, cabecasTransferidas: '' })); }} className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${subdivideErrors.cabecasTransferidas ? 'border-red-400 bg-red-50/30' : 'border-slate-300'}`} />
              {subdivideErrors.cabecasTransferidas && <p className="text-red-600 text-xs mt-1">{subdivideErrors.cabecasTransferidas}</p>}
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setIsSubdividing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Salvar Subdivisão</button>
            </div>
          </form>
        </div>
      )}

      {isMortalidade && (
        <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-100">
          <h2 className="text-lg font-semibold mb-4 text-red-800 flex items-center gap-2"><Skull className="w-5 h-5" />Registrar Mortalidade</h2>
          <form onSubmit={handleMortalidade} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-red-900 mb-1">Lote</label>
              <select value={mortalidadeLoteId} onChange={e => { setMortalidadeLoteId(e.target.value); setMortalidadeErrors(p => ({ ...p, mortalidadeLoteId: '' })); }} className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white ${mortalidadeErrors.mortalidadeLoteId ? 'border-red-500' : 'border-red-200'}`}>
                <option value="">Selecione...</option>
                {lotes.filter(l => l.status === 'ATIVO').map(l => <option key={l.id} value={l.id}>{l.id} ({l.cabecasAtuais} cbç)</option>)}
              </select>
              {mortalidadeErrors.mortalidadeLoteId && <p className="text-red-700 text-xs mt-1">{mortalidadeErrors.mortalidadeLoteId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-red-900 mb-1">Número de Cabeças {mortalidadeLoteId && <span className="font-normal text-red-700/70">(máx: {state.lotes[mortalidadeLoteId]?.cabecasAtuais ?? 0})</span>}</label>
              <input type="number" min="1" value={mortalidadeCabecas} onChange={e => { setMortalidadeCabecas(e.target.value); setMortalidadeErrors(p => ({ ...p, mortalidadeCabecas: '' })); }} className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white ${mortalidadeErrors.mortalidadeCabecas ? 'border-red-500' : 'border-red-200'}`} />
              {mortalidadeErrors.mortalidadeCabecas && <p className="text-red-700 text-xs mt-1">{mortalidadeErrors.mortalidadeCabecas}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2 pt-4 border-t border-red-200/50">
              <button type="button" onClick={() => setIsMortalidade(false)} className="px-4 py-2 text-red-700 hover:bg-red-100 rounded-lg font-medium">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Registrar Perda</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Lote</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Cabeças</th>
                <th className="px-6 py-4 font-medium text-right">Peso Entrada</th>
                <th className="px-6 py-4 font-medium text-right">Preço/@</th>
                <th className="px-6 py-4 font-medium">Data Entrada</th>
                <th className="px-6 py-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100"><Plus className="w-8 h-8 text-slate-300" /></div>
                      <p className="text-base font-medium text-slate-600">Nenhum lote registrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lotes.map((lote) => (
                  <tr key={lote.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{lote.id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${lote.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{lote.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-medium">{lote.cabecasAtuais}</span>
                        {lote.cabecasAtuais !== lote.cabecasIniciais && <span className="text-xs text-slate-400">de {lote.cabecasIniciais}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-600">{lote.pesoMedioEntrada} kg</td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-600">R$ {lote.precoCompraArroba.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-600">{format(new Date(lote.dataEntrada), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setLoteDetalhesId(lote.id)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md" title="Detalhes do Lote"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(lote.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md" title="Excluir Lote"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loteDetalhes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Lote: {loteDetalhes.id}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${loteDetalhes.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>{loteDetalhes.status}</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">Entrada: {format(new Date(loteDetalhes.dataEntrada), 'dd/MM/yyyy')}</p>
              </div>
              <button onClick={() => setLoteDetalhesId(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Indicadores */}
                <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100/50 sm:col-span-2">
                  <h4 className="text-sm font-semibold text-sky-900 mb-3 uppercase tracking-wider">Indicadores de Desempenho</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg border border-sky-100 shadow-sm">
                      <span className="block text-sky-700/80 text-xs mb-1">Dias em Confinamento</span>
                      <span className="font-bold text-sky-950 text-lg">{diasConfinamento} dias</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-sky-100 shadow-sm">
                      <span className="block text-sky-700/80 text-xs mb-1">Custo Operacional / Dia</span>
                      <span className="font-bold text-sky-950 text-lg">R$ {custoOperacionalDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-sky-100 shadow-sm">
                      <span className="block text-sky-700/80 text-xs mb-1">Custo / Cabeça / Dia</span>
                      <span className="font-bold text-sky-950 text-lg">R$ {custoCabecaDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                  <h4 className="text-sm font-semibold text-indigo-900 mb-3 uppercase tracking-wider">Métricas de Animais</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b border-indigo-100/50 pb-2"><span className="text-indigo-700/80">Cabeças Iniciais</span><span className="font-medium text-indigo-950">{loteDetalhes.cabecasIniciais}</span></div>
                    <div className="flex justify-between items-center border-b border-indigo-100/50 pb-2"><span className="text-indigo-700/80">Cabeças Atuais</span><span className="font-bold text-indigo-950">{loteDetalhes.cabecasAtuais}</span></div>
                    <div className="flex justify-between items-center border-b border-indigo-100/50 pb-2"><span className="text-indigo-700/80">Vendidas / Mortas</span><span className="font-medium text-indigo-950">{loteDetalhes.cabecasVendidas} / {loteDetalhes.cabecasIniciais - loteDetalhes.cabecasAtuais - loteDetalhes.cabecasVendidas}</span></div>
                    <div className="flex justify-between items-center pb-2 border-b border-indigo-100/50"><span className="text-indigo-700/80">Peso Médio Inicial</span><span className="font-medium text-indigo-950">{loteDetalhes.pesoMedioEntrada} kg</span></div>
                    {/* NOVO: Consumo de Ração em KG */}
                    <div className="flex justify-between items-center"><span className="text-indigo-700/80 font-medium">Consumo Total de Ração</span><span className="font-bold text-indigo-950 bg-white px-2 py-0.5 rounded text-xs border border-indigo-200">{(loteDetalhes.quantidadeRacaoKg || 0).toLocaleString('pt-BR')} kg</span></div>
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                  <h4 className="text-sm font-semibold text-emerald-900 mb-3 uppercase tracking-wider">Evolução Financeira</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2"><span className="text-emerald-700/80">Custo de Aquisição</span><span className="font-medium text-emerald-950">R$ {loteDetalhes.custoCompra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2"><span className="text-emerald-700/80">Custo de Ração</span><span className="font-medium text-emerald-950">R$ {loteDetalhes.custoRacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2"><span className="text-emerald-700/80">Despesas Diretas</span><span className="font-medium text-emerald-950">R$ {loteDetalhes.custoDireto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    {/* NOVO: Estrutura Rateada */}
                    <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2"><span className="text-emerald-700/80">Estrutura Rateada</span><span className="font-medium text-emerald-950 text-xs bg-emerald-100/50 px-2 py-0.5 rounded">+ R$ {(loteDetalhes.estruturaRateada || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    
                    <div className="flex justify-between items-center pt-1"><span className="font-semibold text-emerald-800">Custo Total Atual</span><span className="font-bold text-emerald-700">R$ {(loteDetalhes.custoCompra + loteDetalhes.custoRacao + loteDetalhes.custoDireto + (loteDetalhes.estruturaRateada || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                  </div>
                </div>

                <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <div><h4 className="text-sm font-semibold text-slate-800">Receita Realizada (Vendas)</h4><p className="text-xs text-slate-500 mt-1">Valor acumulado de todas as vendas deste lote</p></div>
                    <div className="text-right"><span className="text-xl font-bold text-slate-900">R$ {loteDetalhes.receitaRealizada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                  </div>
                </div>

                {loteDetalhes.observacao && (
                  <div className="sm:col-span-2 bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
                    <h4 className="text-sm font-semibold text-amber-900 mb-2">Observações do Lote</h4>
                    <p className="text-sm text-amber-950 whitespace-pre-wrap">{loteDetalhes.observacao}</p>
                  </div>
                )}

                {/* Bloco de Histórico de Lançamentos */}
                <div className="sm:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden mt-2">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Histórico de Lançamentos</h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-500 uppercase sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 font-medium">Data/Hora</th>
                          <th className="px-4 py-3 font-medium">Evento</th>
                          <th className="px-4 py-3 font-medium text-right">Detalhes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {historicoLote.length === 0 ? (
                          <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">Nenhum lançamento encontrado.</td></tr>
                        ) : (
                          historicoLote.map(ev => (
                            <tr key={ev.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-500 text-xs">
                                {format(new Date(ev.timestamp), 'dd/MM/yyyy HH:mm')}
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-800 text-xs">
                                {formatEventName(ev.type)}
                              </td>
                              <td className="px-4 py-3 text-right text-slate-500 text-xs">
                                {getEventBrief(ev)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => handleDelete(loteDetalhes.id)} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"><Trash2 className="w-4 h-4" />Excluir Lote</button>
              <button onClick={() => setLoteDetalhesId(null)} className="px-6 py-2 text-sm font-medium bg-slate-800 text-white hover:bg-slate-900 rounded-lg">Fechar Detalhes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
