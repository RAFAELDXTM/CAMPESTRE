import React, {  useState  } from 'react';
import { useAppStore } from '../store';
import { format } from 'date-fns';
import { Receipt } from 'lucide-react';

const CATEGORIAS_DESPESA = [
  'Mão de Obra',
  'Salário',
  'Energia',
  'Medicamentos',
  'Manutenção',
  'Combustível',
  'Frete',
  'Impostos',
  'Outros'
];

export default function Lancamentos() {
  const { state, addEvent } = useAppStore();
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tipo, setTipo] = useState<'lote' | 'geral'>('geral');
  const [loteId, setLoteId] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [observacao, setObservacao] = useState('');

  const lotesAtivos = (Object.values(state.lotes) as any[]).filter(l => l.status === 'ATIVO');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tipo === 'lote') {
      await addEvent('DESPESA_LOTE_LANCADA', {
        loteId,
        categoria,
        valor: parseFloat(valor),
        data,
        observacao,
      });
    } else {
      await addEvent('DESPESA_GERAL_LANCADA', {
        categoria,
        valor: parseFloat(valor),
        data,
        observacao,
      });
    }

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
          <h2 className="text-lg font-semibold mb-6">Novo Lançamento</h2>
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
                <input required type="date" value={data} onChange={e => setData(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              
              {tipo === 'lote' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lote</label>
                  <select required value={loteId} onChange={e => setLoteId(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="">Selecione o lote...</option>
                    {lotesAtivos.map(l => (
                      <option key={l.id} value={l.id}>{l.id} ({l.cabecasAtuais} cbç)</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select required value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                  <option value="">Selecione...</option>
                  {CATEGORIAS_DESPESA.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                <input required type="number" min="0.01" step="0.01" value={valor} onChange={e => setValor(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
                <input type="text" value={observacao} onChange={e => setObservacao(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="Opcional" />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                Lançar Despesa
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
    </div>
  );
}
