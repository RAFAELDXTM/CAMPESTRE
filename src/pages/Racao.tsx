import React, { useState } from 'react';
import { useAppStore } from '../store';
import { format } from 'date-fns';
import { Wheat, Plus, PackagePlus, Trash2 } from 'lucide-react';

export default function Racao() {
  const { state, addEvent } = useAppStore();
  const [activeTab, setActiveTab] = useState<'estoque' | 'formulas'>('estoque');

  const [ingredienteId, setIngredienteId] = useState('');
  const [ingredienteNome, setIngredienteNome] = useState('');
  const [quantidadeKg, setQuantidadeKg] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [dataCompra, setDataCompra] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [observacaoCompra, setObservacaoCompra] = useState('');

  const [loteId, setLoteId] = useState('GERAL');
  const [nomeFormula, setNomeFormula] = useState('');
  const [dataInicio, setDataInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [composicao, setComposicao] = useState<{ ingredienteId: string; percentual: number }[]>([{ ingredienteId: '', percentual: 0 }]);

  const ingredientes = (Object.values(state.ingredientes) as any[]);
  const formulas = (Object.values(state.formulas) as any[]);
  const lotesAtivos = (Object.values(state.lotes) as any[]).filter(l => l.status === 'ATIVO');

  const handleCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEvent('COMPRA_INGREDIENTE', {
      ingredienteId: ingredienteId || `ing_${Date.now()}`,
      ingredienteNome: ingredienteId ? state.ingredientes[ingredienteId].nome : ingredienteNome,
      quantidadeKg: parseFloat(quantidadeKg),
      valorTotal: parseFloat(valorTotal),
      data: dataCompra,
      observacao: observacaoCompra,
    });
    setIngredienteId(''); setIngredienteNome(''); setQuantidadeKg(''); setValorTotal(''); setObservacaoCompra('');
  };

  const handleFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalPercentual = composicao.reduce((acc, curr) => acc + curr.percentual, 0);
    
    if (Math.abs(totalPercentual - 100) > 0.01) {
      alert('A soma dos percentuais deve ser exatamente 100%.');
      return;
    }

    await addEvent('FORMULA_LOTE_CRIADA', {
      loteId: loteId === '' ? 'GERAL' : loteId,
      formulaId: `form_${Date.now()}`,
      nomeFormula,
      dataInicio,
      composicao,
    });
    setLoteId('GERAL'); setNomeFormula(''); setComposicao([{ ingredienteId: '', percentual: 0 }]);
  };

  const handleDeleteFormula = async (id: string, nome: string) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir a fórmula "${nome}"? O histórico de custos já lançados será mantido.`);
    if (confirmDelete) {
      await addEvent('FORMULA_EXCLUIDA', { formulaId: id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Wheat className="w-6 h-6 text-amber-700" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Gestão de Ração</h1>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('estoque')} className={`pb-3 px-1 font-medium text-sm transition-colors ${activeTab === 'estoque' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>
          Estoque e Compras
        </button>
        <button onClick={() => setActiveTab('formulas')} className={`pb-3 px-1 font-medium text-sm transition-colors ${activeTab === 'formulas' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>
          Fórmulas Cadastradas
        </button>
      </div>

      {activeTab === 'estoque' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2"><PackagePlus className="w-5 h-5 text-slate-500" />Nova Compra</h2>
            <form onSubmit={handleCompra} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ingrediente</label>
                <select value={ingredienteId} onChange={e => { setIngredienteId(e.target.value); if(e.target.value) setIngredienteNome(''); }} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="">Novo Ingrediente...</option>
                  {ingredientes.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                </select>
              </div>
              {!ingredienteId && (
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Nome do Novo Ingrediente</label><input required type="text" value={ingredienteNome} onChange={e => setIngredienteNome(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" /></div>
              )}
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Quantidade (kg)</label><input required type="number" min="0.1" step="0.1" value={quantidadeKg} onChange={e => setQuantidadeKg(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (R$)</label><input required type="number" min="0.01" step="0.01" value={valorTotal} onChange={e => setValorTotal(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Data</label><input required type="date" value={dataCompra} onChange={e => setDataCompra(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" /></div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">Registrar Compra</button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200"><h2 className="text-lg font-semibold">Posição de Estoque</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Ingrediente</th>
                    <th className="px-6 py-4 font-medium text-right">Saldo (kg)</th>
                    <th className="px-6 py-4 font-medium text-right">Último Custo (R$/kg)</th>
                    <th className="px-6 py-4 font-medium text-right">Valor em Estoque</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ingredientes.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum ingrediente em estoque.</td></tr>
                  ) : (
                    ingredientes.map(ing => (
                      <tr key={ing.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{ing.nome}</td>
                        <td className={`px-6 py-4 text-right font-mono ${ing.quantidadeKg <= 0 ? 'text-rose-500 font-semibold' : ''}`}>{ing.quantidadeKg.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-mono text-slate-500">R$ {ing.ultimoCustoKg.toFixed(4)}</td>
                        <td className="px-6 py-4 text-right font-mono text-emerald-600">R$ {(ing.quantidadeKg * ing.ultimoCustoKg).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'formulas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-slate-500" />Nova Fórmula</h2>
            <form onSubmit={handleFormula} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vincular a um Lote</label>
                <select value={loteId} onChange={e => setLoteId(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="GERAL">Fórmula Geral (Todos os lotes)</option>
                  {lotesAtivos.map(l => <option key={l.id} value={l.id}>Apenas Lote: {l.id} ({l.cabecasAtuais} cbç)</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Nome da Fórmula</label><input required type="text" value={nomeFormula} onChange={e => setNomeFormula(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" /></div>
              
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">Composição (%)</label>
                {composicao.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select required value={item.ingredienteId} onChange={e => {
                      const newComp = [...composicao]; newComp[index].ingredienteId = e.target.value; setComposicao(newComp);
                    }} className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
                      <option value="">Ingrediente...</option>
                      {ingredientes.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                    </select>
                    <input required type="number" min="0" max="100" step="0.1" value={item.percentual} onChange={e => {
                      const newComp = [...composicao]; newComp[index].percentual = parseFloat(e.target.value) || 0; setComposicao(newComp);
                    }} className="w-20 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm text-right bg-white" placeholder="%" />
                    <button type="button" onClick={() => {
                      const newComp = composicao.filter((_, i) => i !== index); setComposicao(newComp);
                    }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Plus className="w-4 h-4 rotate-45" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setComposicao([...composicao, { ingredienteId: '', percentual: 0 }])} className="text-sm text-emerald-600 font-medium hover:text-emerald-700 mt-2">
                  + Adicionar Ingrediente
                </button>
                <div className="mt-4 flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-500">Total:</span>
                  <span className={Math.abs(composicao.reduce((a, c) => a + c.percentual, 0) - 100) < 0.01 ? 'text-emerald-600' : 'text-red-600'}>
                    {composicao.reduce((a, c) => a + c.percentual, 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors mt-4">Salvar Fórmula</button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200"><h2 className="text-lg font-semibold">Fórmulas Cadastradas</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-4 font-medium">Lote</th>
                    <th className="px-4 py-4 font-medium">Fórmula</th>
                    <th className="px-4 py-4 font-medium text-right">Consumo Total</th>
                    <th className="px-4 py-4 font-medium">Composição</th>
                    <th className="px-4 py-4 font-medium text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {formulas.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Nenhuma fórmula cadastrada.</td></tr>
                  ) : (
                    formulas.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4">
                          {f.loteId === 'GERAL' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">Geral</span>
                          ) : (
                            <span className="font-medium text-slate-900">{f.loteId}</span>
                          )}
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-900">{f.nome}</td>
                        <td className="px-4 py-4 text-right font-mono text-emerald-700 bg-emerald-50/30">
                          {/* NOVO: Mostrando a quantidade total já gasta com essa fórmula */}
                          {(f.quantidadeUtilizadaKg || 0).toLocaleString('pt-BR')} kg
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {f.composicao.map((c, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {state.ingredientes[c.ingredienteId]?.nome}: {c.percentual}%
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <button onClick={() => handleDeleteFormula(f.id, f.nome)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Excluir Fórmula"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
