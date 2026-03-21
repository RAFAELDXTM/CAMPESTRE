import React, {  useState  } from 'react';
import { useAppStore } from '../store';
import { format } from 'date-fns';
import { Landmark, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle } from 'lucide-react';

export default function Financeiro() {
  const { state, addEvent } = useAppStore();
  const [activeTab, setActiveTab] = useState<'pagar' | 'receber' | 'caixa'>('pagar');

  // Pagar State
  const [pCompetencia, setPCompetencia] = useState(format(new Date(), 'yyyy-MM'));
  const [pVencimento, setPVencimento] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [pFornecedor, setPFornecedor] = useState('');
  const [pCategoria, setPCategoria] = useState('');
  const [pValor, setPValor] = useState('');
  const [pObservacao, setPObservacao] = useState('');

  // Receber State
  const [rCompetencia, setRCompetencia] = useState(format(new Date(), 'yyyy-MM'));
  const [rVencimento, setRVencimento] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [rCliente, setRCliente] = useState('');
  const [rCategoria, setRCategoria] = useState('');
  const [rValor, setRValor] = useState('');
  const [rObservacao, setRObservacao] = useState('');

  // Caixa State
  const [cData, setCData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [cDirecao, setCDirecao] = useState<'in' | 'out'>('in');
  const [cValor, setCValor] = useState('');
  const [cDescricao, setCDescricao] = useState('');
  const [cContaId, setCContaId] = useState('acc_cash');

  const contasPagar = Object.values(state.contasPagar).sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());
  const contasReceber = Object.values(state.contasReceber).sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());
  const transacoes = [...state.cashTransactions].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const totalPagarAberto = contasPagar.filter(c => c.status === 'Aberto').reduce((acc, c) => acc + c.valor, 0);
  const totalReceberAberto = contasReceber.filter(c => c.status === 'Aberto').reduce((acc, c) => acc + c.valor, 0);
  
  const currentMonth = format(new Date(), 'yyyy-MM');
  const entradasMes = transacoes.filter(t => t.direcao === 'in' && t.data.startsWith(currentMonth)).reduce((acc, t) => acc + t.valor, 0);
  const saidasMes = transacoes.filter(t => t.direcao === 'out' && t.data.startsWith(currentMonth)).reduce((acc, t) => acc + t.valor, 0);

  const handlePagarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEvent('CONTAS_PAGAR_CRIADA', {
      id: `cp_${Date.now()}`,
      competencia: pCompetencia,
      vencimento: pVencimento,
      fornecedor: pFornecedor,
      categoria: pCategoria,
      valor: parseFloat(pValor),
      status: 'Aberto',
      observacao: pObservacao,
    });
    setPFornecedor('');
    setPCategoria('');
    setPValor('');
    setPObservacao('');
  };

  const handleReceberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEvent('CONTAS_RECEBER_CRIADA', {
      id: `cr_${Date.now()}`,
      competencia: rCompetencia,
      vencimento: rVencimento,
      cliente: rCliente,
      categoria: rCategoria,
      valor: parseFloat(rValor),
      status: 'Aberto',
      observacao: rObservacao,
    });
    setRCliente('');
    setRCategoria('');
    setRValor('');
    setRObservacao('');
  };

  const handleCaixaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEvent('TRANSACAO_CAIXA_CRIADA', {
      id: `tx_${Date.now()}`,
      data: cData,
      direcao: cDirecao,
      valor: parseFloat(cValor),
      contaId: cContaId,
      descricao: cDescricao,
      sourceType: 'manual'
    });
    setCValor('');
    setCDescricao('');
  };

  const handlePagarAction = async (id: string, action: 'pago' | 'cancelado') => {
    if (action === 'cancelado') {
      await addEvent('CONTAS_PAGAR_CANCELADA', { id });
    } else {
      const conta = state.contasPagar[id];
      const dataPagamento = format(new Date(), 'yyyy-MM-dd');
      await addEvent('CONTAS_PAGAR_PAGA', { id, dataPagamento, contaId: 'acc_bank' });
      await addEvent('TRANSACAO_CAIXA_CRIADA', {
        id: `tx_${Date.now()}`,
        data: dataPagamento,
        direcao: 'out',
        valor: conta.valor,
        contaId: 'acc_bank',
        descricao: `Pagamento: ${conta.fornecedor} - ${conta.categoria}`,
        sourceType: 'payable',
        sourceId: id
      });
    }
  };

  const handleReceberAction = async (id: string, action: 'recebido' | 'cancelado') => {
    if (action === 'cancelado') {
      await addEvent('CONTAS_RECEBER_CANCELADA', { id });
    } else {
      const conta = state.contasReceber[id];
      const dataRecebimento = format(new Date(), 'yyyy-MM-dd');
      await addEvent('CONTAS_RECEBER_RECEBIDA', { id, dataRecebimento, contaId: 'acc_bank' });
      await addEvent('TRANSACAO_CAIXA_CRIADA', {
        id: `tx_${Date.now()}`,
        data: dataRecebimento,
        direcao: 'in',
        valor: conta.valor,
        contaId: 'acc_bank',
        descricao: `Recebimento: ${conta.cliente} - ${conta.categoria}`,
        sourceType: 'receivable',
        sourceId: id
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Landmark className="w-6 h-6 text-emerald-700" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">A Pagar (Aberto)</p>
          <p className="text-xl font-mono font-semibold text-rose-600">
            R$ {totalPagarAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">A Receber (Aberto)</p>
          <p className="text-xl font-mono font-semibold text-emerald-600">
            R$ {totalReceberAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Entradas (Mês)</p>
          <p className="text-xl font-mono font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            {entradasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Saídas (Mês)</p>
          <p className="text-xl font-mono font-semibold text-rose-600 flex items-center gap-1">
            <ArrowDownRight className="w-4 h-4" />
            {saidasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pagar')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === 'pagar'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          A Pagar
        </button>
        <button
          onClick={() => setActiveTab('receber')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === 'receber'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          A Receber
        </button>
        <button
          onClick={() => setActiveTab('caixa')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === 'caixa'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Caixa / Bancos
        </button>
      </div>

      {activeTab === 'pagar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-6">Nova Conta a Pagar</h2>
            <form onSubmit={handlePagarSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vencimento</label>
                <input required type="date" value={pVencimento} onChange={e => setPVencimento(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fornecedor</label>
                <input required type="text" value={pFornecedor} onChange={e => setPFornecedor(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <input required type="text" value={pCategoria} onChange={e => setPCategoria(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                <input required type="number" min="0.01" step="0.01" value={pValor} onChange={e => setPValor(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors">
                Salvar Conta a Pagar
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Títulos a Pagar</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Vencimento</th>
                    <th className="px-6 py-4 font-medium">Fornecedor</th>
                    <th className="px-6 py-4 font-medium">Categoria</th>
                    <th className="px-6 py-4 font-medium text-right">Valor</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contasPagar.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">{format(new Date(c.vencimento), 'dd/MM/yyyy')}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{c.fornecedor}</td>
                      <td className="px-6 py-4 text-slate-500">{c.categoria}</td>
                      <td className="px-6 py-4 text-right font-mono">R$ {c.valor.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          c.status === 'Aberto' ? 'bg-amber-100 text-amber-800' :
                          c.status === 'Pago' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.status === 'Aberto' && (
                          <div className="flex gap-2">
                            <button onClick={() => handlePagarAction(c.id, 'pago')} className="text-emerald-600 hover:text-emerald-800" title="Marcar como Pago">
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => handlePagarAction(c.id, 'cancelado')} className="text-slate-400 hover:text-rose-600" title="Cancelar">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'receber' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-6">Nova Conta a Receber</h2>
            <form onSubmit={handleReceberSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vencimento</label>
                <input required type="date" value={rVencimento} onChange={e => setRVencimento(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <input required type="text" value={rCliente} onChange={e => setRCliente(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <input required type="text" value={rCategoria} onChange={e => setRCategoria(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                <input required type="number" min="0.01" step="0.01" value={rValor} onChange={e => setRValor(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                Salvar Conta a Receber
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Títulos a Receber</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Vencimento</th>
                    <th className="px-6 py-4 font-medium">Cliente</th>
                    <th className="px-6 py-4 font-medium">Categoria</th>
                    <th className="px-6 py-4 font-medium text-right">Valor</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contasReceber.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">{format(new Date(c.vencimento), 'dd/MM/yyyy')}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{c.cliente}</td>
                      <td className="px-6 py-4 text-slate-500">{c.categoria}</td>
                      <td className="px-6 py-4 text-right font-mono">R$ {c.valor.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          c.status === 'Aberto' ? 'bg-amber-100 text-amber-800' :
                          c.status === 'Recebido' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.status === 'Aberto' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleReceberAction(c.id, 'recebido')} className="text-emerald-600 hover:text-emerald-800" title="Marcar como Recebido">
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleReceberAction(c.id, 'cancelado')} className="text-slate-400 hover:text-rose-600" title="Cancelar">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'caixa' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-6">Nova Transação Manual</h2>
            <form onSubmit={handleCaixaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input required type="date" value={cData} onChange={e => setCData(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Direção</label>
                <select required value={cDirecao} onChange={e => setCDirecao(e.target.value as 'in' | 'out')} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                  <option value="in">Entrada (+)</option>
                  <option value="out">Saída (-)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Conta</label>
                <select required value={cContaId} onChange={e => setCContaId(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                  {Object.values(state.financeAccounts).map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                <input required type="number" min="0.01" step="0.01" value={cValor} onChange={e => setCValor(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input required type="text" value={cDescricao} onChange={e => setCDescricao(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors">
                Registrar Transação
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Extrato de Movimentações</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Data</th>
                    <th className="px-6 py-4 font-medium">Descrição</th>
                    <th className="px-6 py-4 font-medium">Conta</th>
                    <th className="px-6 py-4 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transacoes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhuma transação registrada.</td>
                    </tr>
                  ) : (
                    transacoes.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">{format(new Date(t.data), 'dd/MM/yyyy')}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{t.descricao}</td>
                        <td className="px-6 py-4 text-slate-500">{state.financeAccounts[t.contaId]?.name}</td>
                        <td className={`px-6 py-4 text-right font-mono font-medium ${t.direcao === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.direcao === 'in' ? '+' : '-'} R$ {t.valor.toFixed(2)}
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
