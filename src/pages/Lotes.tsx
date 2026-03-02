import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, SplitSquareHorizontal, Skull, Eye, Trash2, X } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function Lotes() {
  const { state, addEvent } = useAppStore();
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEvent('LOTE_CRIADO', {
      loteId,
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
    await addEvent('LOTE_SUBDIVIDIDO', {
      loteOrigemId,
      loteNovoId,
      cabecasTransferidas: parseInt(cabecasTransferidas),
      data: format(new Date(), 'yyyy-MM-dd'),
      observacao,
    });
    setIsSubdividing(false);
    resetForms();
  };

  const handleMortalidade = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const lotes = (Object.values(state.lotes) as any[]);
  const loteDetalhes = loteDetalhesId ? state.lotes[loteDetalhesId] : null;

  // Cálculos de Desempenho (Dias e Custo) se o modal estiver aberto
  const diasConfinamento = loteDetalhes ? Math.max(1, differenceInDays(new Date(), new Date(loteDetalhes.dataEntrada))) : 1;
  const custoOperacional = loteDetalhes ? (loteDetalhes.custoRacao + loteDetalhes.custoDireto) : 0;
  const custoOperacionalDia = custoOperacional / diasConfinamento;
  const custoCabecaDia = loteDetalhes && loteDetalhes.cabecasAtuais > 0 ? (custoOperacionalDia / loteDetalhes.cabecasAtuais) : 0;

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
            <div><label className="block text-sm font-medium text-slate-700 mb-1">ID do Lote</label><input required type="text" value={loteId} onChange={e => setLoteId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Data de Entrada</label><input required type="date" value={dataEntrada} onChange={e => setDataEntrada(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Número de Cabeças</label><input required type="number" min="1" value={cabecas} onChange={e => setCabecas(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Peso Médio (kg)</label><input required type="number" min="0" step="0.1" value={pesoMedio} onChange={e => setPesoMedio(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Preço Compra (R$/@)</label><input required type="number" min="0" step="0.01" value={precoArroba} onChange={e => setPrecoArroba(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" /></div>
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
              <select required value={loteOrigemId} onChange={e => setLoteOrigemId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="">Selecione...</option>
                {lotes.filter(l => l.status === 'ATIVO').map(l => <option key={l.id} value={l.id}>{l.id} ({l.cabecasAtuais} cbç)</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Novo ID do Lote</label><input required type="text" value={loteNovoId} onChange={e => setLoteNovoId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Cabeças Transferidas</label><input required type="number" min="1" max={state.lotes[loteOrigemId]?.cabecasAtuais || 1} value={cabecasTransferidas} onChange={e => setCabecasTransferidas(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" /></div>
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
              <select required value={mortalidadeLoteId} onChange={e => setMortalidadeLoteId(e.target.value)} className="w-full p-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 bg-white">
                <option value="">Selecione...</option>
                {lotes.filter(l => l.status === 'ATIVO').map(l => <option key={l.id} value={l.id}>{l.id} ({l.cabecasAtuais} cbç)</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-red-900 mb-1">Número de Cabeças</label><input required type="number" min="1" max={state.lotes[mortalidadeLoteId]?.cabecasAtuais || 1} value={mortalidadeCabecas} onChange={e => setMortalidadeCabecas(e.target.value)} className="w-full p-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 bg-white" /></div>
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
                
                {/* Bloco NOVO: Indicadores de Desempenho e Tempo */}
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
                    <div className="flex justify-between items-center"><span className="text-indigo-700/80">Peso Médio Inicial</span><span className="font-medium text-indigo-950">{loteDetalhes.pesoMedioEntrada} kg</span></div>
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                  <h4 className="text-sm font-semibold text-emerald-900 mb-3 uppercase tracking-wider">Evolução Financeira</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2"><span className="text-emerald-700/80">Custo de Aquisição</span><span className="font-medium text-emerald-950">R$ {loteDetalhes.custoCompra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2"><span className="text-emerald-700/80">Custo de Ração</span><span className="font-medium text-emerald-950">R$ {loteDetalhes.custoRacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2"><span className="text-emerald-700/80">Despesas Diretas</span><span className="font-medium text-emerald-950">R$ {loteDetalhes.custoDireto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between items-center pt-1"><span className="font-semibold text-emerald-800">Custo Total Atual</span><span className="font-bold text-emerald-700">R$ {(loteDetalhes.custoCompra + loteDetalhes.custoRacao + loteDetalhes.custoDireto + loteDetalhes.estruturaRateada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
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
