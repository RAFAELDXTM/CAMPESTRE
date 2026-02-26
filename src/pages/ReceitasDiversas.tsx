import React, {  useState  } from 'react';
import { useAppStore } from '../store';
import { format } from 'date-fns';
import { Wallet } from 'lucide-react';

const CATEGORIAS_RECEITA = [
  'Comissão',
  'Venda de Ração',
  'Venda de Insumo',
  'Serviços Prestados',
  'Outros'
];

export default function ReceitasDiversas() {
  const { state, addEvent } = useAppStore();
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cliente, setCliente] = useState('');
  const [valor, setValor] = useState('');
  const [loteId, setLoteId] = useState('');
  const [itemEstoqueId, setItemEstoqueId] = useState('');
  const [formulaId, setFormulaId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');

  const lotesAtivos = (Object.values(state.lotes) as any[]).filter(l => l.status === 'ATIVO');
  const ingredientes = (Object.values(state.ingredientes) as any[]);
  const formulas = (Object.values(state.formulas) as any[]);

  const isVendaInsumo = categoria === 'Venda de Insumo';
  const isVendaRacao = categoria === 'Venda de Ração';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEvent('RECEITA_DIVERSA_LANCADA', {
      categoria,
      descricao,
      cliente,
      valor: parseFloat(valor),
      loteId: loteId || undefined,
      data,
      observacao,
      itemEstoqueId: isVendaInsumo ? itemEstoqueId : undefined,
      formulaId: isVendaRacao ? formulaId : undefined,
      quantidade: (isVendaInsumo || isVendaRacao) ? parseFloat(quantidade) : undefined,
    });
    
    setCategoria('');
    setDescricao('');
    setCliente('');
    setValor('');
    setLoteId('');
    setItemEstoqueId('');
    setFormulaId('');
    setQuantidade('');
    setObservacao('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Wallet className="w-6 h-6 text-blue-700" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Receitas Diversas</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-6">Nova Receita</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input required type="date" value={data} onChange={e => setData(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
              <select required value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="">Selecione...</option>
                {CATEGORIAS_RECEITA.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
              <input required type="number" min="0.01" step="0.01" value={valor} onChange={e => setValor(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <input required type="text" value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <input required type="text" value={cliente} onChange={e => setCliente(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vincular a Lote (Opcional)</label>
              <select value={loteId} onChange={e => setLoteId(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="">Nenhum</option>
                {lotesAtivos.map(l => (
                  <option key={l.id} value={l.id}>{l.id}</option>
                ))}
              </select>
            </div>

            {isVendaInsumo && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Item de Estoque</label>
                  <select required value={itemEstoqueId} onChange={e => setItemEstoqueId(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="">Selecione...</option>
                    {ingredientes.map(i => (
                      <option key={i.id} value={i.id}>{i.nome} ({i.quantidadeKg.toFixed(2)} kg)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade (kg)</label>
                  <input required type="number" min="0.1" step="0.1" value={quantidade} onChange={e => setQuantidade(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
              </>
            )}

            {isVendaRacao && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fórmula de Ração</label>
                  <select required value={formulaId} onChange={e => setFormulaId(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="">Selecione...</option>
                    {formulas.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade (kg)</label>
                  <input required type="number" min="0.1" step="0.1" value={quantidade} onChange={e => setQuantidade(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
              </>
            )}

            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
              <input type="text" value={observacao} onChange={e => setObservacao(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="Opcional" />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
              Registrar Receita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
