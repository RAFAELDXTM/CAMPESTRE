import React, { useState } from 'react';
import { useAppStore } from '../store';
import { format } from 'date-fns';
import { Receipt, Pencil, Trash2 } from 'lucide-react';

// NOVAS CATEGORIAS ADICIONADAS AQUI
const CATEGORIAS_DESPESA = [
  'Mão de Obra',
  'Salário',
  'Energia',
  'Medicamentos',
  'Manutenção',
  'Combustível',
  'Frete',
  'Impostos',
  'Aluguel',
  'Empréstimo',
  'Outros'
];

export default function Lancamentos() {
  // Chamamos o updateEvent e deleteEvent do nosso Cérebro (store.tsx)
  const { state, events, addEvent, updateEvent, deleteEvent } = useAppStore();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tipo, setTipo] = useState<'lote' | 'geral'>('geral');
  const [loteId, setLoteId] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [observacao, setObservacao] = useState('');

  const lotesAtivos = (Object.values(state.lotes) as any[]).filter(l => l.status === 'ATIVO');

  // Filtra e organiza o histórico de lançamentos para exibir na tabela
  const historicoLancamentos = events.filter(e => 
    e.type === 'DESPESA_GERAL_LANCADA' || e.type === 'DESPESA_LOTE_LANCADA'
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      categoria,
      valor: parseFloat(valor),
      data,
      observacao,
      ...(tipo === 'lote' ? { loteId } : {})
    };

    if (editingId) {
      // Se estiver no modo edição, apenas atualiza o evento que já existe
      await updateEvent(editingId, payload);
      setEditingId(null);
    } else {
      // Se for novo, cria um lançamento do zero
      if (tipo === 'lote') {
        await addEvent('DESPESA_LOTE_LANCADA', payload);
      } else {
        await addEvent('DESPESA_GERAL_LANCADA', payload);
      }
    }

    // Limpa o formulário após salvar
    setLoteId('');
    setCategoria('');
    setValor('');
    setObservacao('');
  };

  // Função para puxar os dados do lançamento para o formulário de edição
  const handleEdit = (ev: any) => {
    const p = ev.payload;
    setEditingId(ev.id);
    setData(p.data);
    setCategoria(p.categoria);
    setValor(p.valor.toString());
    setObservacao(p.observacao || '');
    
    if (ev.type === 'DESPESA_LOTE_LANCADA') {
      setTipo('lote');
      setLoteId(p.loteId);
    } else {
      setTipo('geral');
      setLoteId('');
    }
    
    // Rola a página suavemente para o topo (onde está o formulário)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Função para excluir o lançamento
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento? Esta ação irá recalcular seus custos automaticamente.')) {
      await deleteEvent(id);
      if (editingId === id) {
        setEditingId(null); // Cancela a edição se o usuário apagar o que estava editando no momento
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setLoteId('');
    setCategoria('');
    setValor('');
    setObservacao('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-100 rounded-lg">
          <Receipt className="w-6 h-6 text-rose-700" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Lançamentos (Despesas)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-6">
            {editingId ? <span className="text-amber-600">Editando Lançamento</span> : 'Novo Lançamento'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tipo" 
                  value="geral" 
                  checked={tipo === 'geral'} 
                  onChange={() => setTipo('geral')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-slate-700">Despesa Geral (Estrutura)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tipo" 
                  value="lote" 
                  checked={tipo === 'lote'} 
                  onChange={() => setTipo('lote')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-slate-700">Despesa Direta por Lote</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input required type="date" value={data} onChange={e => setData(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" />
              </div>
              
              {tipo === 'lote' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lote</label>
                  <select required value={loteId} onChange={e => setLoteId(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
                    <option value="">Selecione o lote...</option>
                    {lotesAtivos.map(l => (
                      <option key={l.id} value={l.id}>{l.id} ({l.cabecasAtuais} cbç)</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select required value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="">Selecione...</option>
                  {CATEGORIAS_DESPESA.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                <input required type="number" min="0.01" step="0.01" value={valor} onChange={e => setValor(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
                <input type="text" value={observacao} onChange={e => setObservacao(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" placeholder="Opcional" />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              {editingId && (
                <button type="button" onClick={cancelEdit} className="px-6 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors">
                  Cancelar Edição
                </button>
              )}
              <button type="submit" className={`px-6 py-2.5 text-white font-medium rounded-lg transition-colors ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                {editingId ? 'Atualizar Lançamento' : 'Lançar Despesa'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 text-white flex flex-col justify-center">
          <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-6">Resumo de Despesas</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-slate-400 text-sm mb-1">Despesas Gerais (Estrutura)</p>
              <p className="text-3xl font-light font-mono text-rose-400">
                R$ {state.despesasGerais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="h-px bg-slate-800 w-full"></div>
            
            <div>
              <p className="text-slate-400 text-sm mb-1">Despesas Diretas (Lotes)</p>
              <p className="text-3xl font-light font-mono text-rose-400">
                R$ {(Object.values(state.lotes) as any[]).reduce((acc, l) => acc + l.custoDireto, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NOVA SESSÃO: Tabela de Histórico de Lançamentos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Histórico de Lançamentos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Tipo / Alocação</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium text-right">Valor</th>
                <th className="px-6 py-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {historicoLancamentos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum lançamento registrado.</td>
                </tr>
              ) : (
                historicoLancamentos.map(ev => {
                  const p = ev.payload as any;
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600">{format(new Date(p.data), 'dd/MM/yyyy')}</td>
                      <td className="px-6 py-4">
                        {ev.type === 'DESPESA_LOTE_LANCADA' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-800">
                            Lote: {p.loteId}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                            Geral (Estrutura)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {p.categoria}
                        {p.observacao && <span className="block text-xs font-normal text-slate-400 mt-1">{p.observacao}</span>}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-rose-600 font-medium">
                        R$ {p.valor.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(ev)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Editar Lançamento"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(ev.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Excluir Lançamento"
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
