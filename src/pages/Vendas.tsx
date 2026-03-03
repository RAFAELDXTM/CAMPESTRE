import React, { useState } from 'react';
import { useAppStore } from '../store';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';

export default function Vendas() {
  const { state, addEvent } = useAppStore();
  
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loteId, setLoteId] = useState('');
  // NOVO: Estado para guardar o nome do Cliente
  const [cliente, setCliente] = useState('');
  const [cabecasVendidas, setCabecasVendidas] = useState('');
  const [pesoMedioKg, setPesoMedioKg] = useState('');
  const [precoArroba, setPrecoArroba] = useState('');
  const [observacao, setObservacao] = useState('');
  
  const [formaPagamento, setFormaPagamento] = useState<'a_vista' | 'a_prazo'>('a_vista');
  const [dataRecebimento, setDataRecebimento] = useState(format(new Date(), 'yyyy-MM-dd'));

  const lotesAtivos = (Object.values(state.lotes) as any[]).filter(l => l.status === 'ATIVO');
  const loteSelecionado = state.lotes[loteId];

  const arrobasTotais = pesoMedioKg && cabecasVendidas 
    ? ((parseFloat(pesoMedioKg) / 30) * parseInt(cabecasVendidas)).toFixed(2)
    : '0.00';

  const receitaEstimada = arrobasTotais && precoArroba
    ? (parseFloat(arrobasTotais) * parseFloat(precoArroba)).toFixed(2)
    : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Registra a Venda no estoque/lote
    await addEvent('VENDA_LOTE_REGISTRADA', {
      loteId,
      cliente, // Salvamos o cliente no histórico da venda também
      cabecasVendidas: parseInt(cabecasVendidas),
      pesoMedioKg: parseFloat(pesoMedioKg),
      precoArroba: parseFloat(precoArroba),
      data,
      observacao,
    });

    // 2. Automação do Financeiro
    if (formaPagamento === 'a_prazo') {
      await addEvent('CONTAS_RECEBER_CRIADA', {
        id: `cr_${Date.now()}`,
        cliente: cliente, // <-- Agora envia o nome do cliente real digitado na tela!
        categoria: 'Venda de Animais',
        valor: parseFloat(receitaEstimada),
        vencimento: dataRecebimento,
        status: 'Aberto',
        // Movemos a informação do lote para a observação para não perder o rastro
        observacao: `Venda Lote ${loteId} (${cabecasVendidas} cbç). ${observacao ? 'Obs: ' + observacao : ''}`
      });
    }

    // Limpa o formulário
    setLoteId('');
    setCliente(''); // Limpa o cliente
    setCabecasVendidas('');
    setPesoMedioKg('');
    setPrecoArroba('');
    setObservacao('');
    setFormaPagamento('a_vista');
    setDataRecebimento(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <TrendingUp className="w-6 h-6 text-emerald-700" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Vendas</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-6">Registrar Venda</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data da Venda</label>
                <input required type="date" value={data} onChange={e => setData(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lote</label>
                <select required value={loteId} onChange={e => setLoteId(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="">Selecione o lote...</option>
                  {lotesAtivos.map(l => (
                    <option key={l.id} value={l.id}>{l.id} ({l.cabecasAtuais} cbç)</option>
                  ))}
                </select>
              </div>

              {/* NOVO: Campo Cliente */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente / Frigorífico</label>
                <input required type="text" value={cliente} onChange={e => setCliente(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" placeholder="Nome do comprador" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cabeças Vendidas</label>
                <input required type="number" min="1" max={loteSelecionado?.cabecasAtuais || 1} value={cabecasVendidas} onChange={e => setCabecasVendidas(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Peso Médio (kg)</label>
                <input required type="number" min="0.1" step="0.1" value={pesoMedioKg} onChange={e => setPesoMedioKg(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$/@)</label>
                <input required type="number" min="0.01" step="0.01" value={precoArroba} onChange={e => setPrecoArroba(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" />
              </div>

              <div className="md:col-span-2 pt-2 mt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
                    <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value as any)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
                      <option value="a_vista">À Vista</option>
                      <option value="a_prazo">A Prazo</option>
                    </select>
                  </div>

                  {formaPagamento === 'a_prazo' ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Data do Recebimento</label>
                      <input required type="date" value={dataRecebimento} onChange={e => setDataRecebimento(e.target.value)} min={data} className="w-full p-2.5 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30" />
                    </div>
                  ) : (
                    <div></div> 
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
                <input type="text" value={observacao} onChange={e => setObservacao(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white" placeholder="Opcional" />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                // Atualizado para também exigir que o cliente esteja preenchido
                disabled={!loteId || !cliente || !cabecasVendidas || !pesoMedioKg || !precoArroba || (formaPagamento === 'a_prazo' && !dataRecebimento)} 
                className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Registrar Venda
              </button>
            </div>
          </form>
        </div>

        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 text-white flex flex-col justify-center">
          <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-6">Resumo da Venda</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-slate-400 text-sm mb-1">Arrobas Totais</p>
              <p className="text-3xl font-light font-mono">
                {arrobasTotais} <span className="text-lg text-slate-500">@</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">Base: 30 kg / @</p>
            </div>
            
            <div className="h-px bg-slate-800 w-full"></div>
            
            <div>
              <p className="text-slate-400 text-sm mb-1">Receita Estimada</p>
              <p className="text-4xl font-light font-mono text-emerald-400">
                R$ {parseFloat(receitaEstimada).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              
              {formaPagamento === 'a_prazo' && (
                <div className="mt-3 inline-block bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5">
                  <p className="text-xs text-amber-400 font-medium">Lançamento automático</p>
                  <p className="text-xs text-slate-300 mt-0.5">Irá gerar uma "Conta a Receber" pendente para {format(new Date(dataRecebimento), 'dd/MM/yyyy')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
