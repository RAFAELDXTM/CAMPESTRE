import React, {  useState  } from 'react';
import { useAppStore } from '../store';
import { Plus, SplitSquareHorizontal, Skull } from 'lucide-react';
import { format } from 'date-fns';

export default function Lotes() {
  const { state, addEvent } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [isSubdividing, setIsSubdividing] = useState(false);
  const [isMortalidade, setIsMortalidade] = useState(false);

  // Form states
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

  const resetForms = () => {
    setLoteId('');
    setCabecas('');
    setPesoMedio('');
    setPrecoArroba('');
    setObservacao('');
    setLoteOrigemId('');
    setLoteNovoId('');
    setCabecasTransferidas('');
    setMortalidadeLoteId('');
    setMortalidadeCabecas('');
  };

  const lotes = (Object.values(state.lotes) as any[]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Gestão de Lotes</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Lote
          </button>
          <button
            onClick={() => setIsSubdividing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm"
          >
            <SplitSquareHorizontal className="w-4 h-4" />
            Subdividir
          </button>
          <button
            onClick={() => setIsMortalidade(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm"
          >
            <Skull className="w-4 h-4" />
            Mortalidade
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Criar Novo Lote</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID do Lote</label>
              <input required type="text" value={loteId} onChange={e => setLoteId(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data de Entrada</label>
              <input required type="date" value={dataEntrada} onChange={e => setDataEntrada(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número de Cabeças</label>
              <input required type="number" min="1" value={cabecas} onChange={e => setCabecas(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Peso Médio (kg)</label>
              <input required type="number" min="0" step="0.1" value={pesoMedio} onChange={e => setPesoMedio(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço Compra (R$/@)</label>
              <input required type="number" min="0" step="0.01" value={precoArroba} onChange={e => setPrecoArroba(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
              <input type="text" value={observacao} onChange={e => setObservacao(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {isSubdividing && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Subdividir Lote</h2>
          <form onSubmit={handleSubdivide} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lote Origem</label>
              <select required value={loteOrigemId} onChange={e => setLoteOrigemId(e.target.value)} className="w-full p-2 border rounded-lg">
                <option value="">Selecione...</option>
                {lotes.filter(l => l.status === 'ATIVO').map(l => (
                  <option key={l.id} value={l.id}>{l.id} ({l.cabecasAtuais} cbç)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Novo ID do Lote</label>
              <input required type="text" value={loteNovoId} onChange={e => setLoteNovoId(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cabeças Transferidas</label>
              <input required type="number" min="1" max={state.lotes[loteOrigemId]?.cabecasAtuais || 1} value={cabecasTransferidas} onChange={e => setCabecasTransferidas(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setIsSubdividing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {isMortalidade && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-red-700">Registrar Mortalidade</h2>
          <form onSubmit={handleMortalidade} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lote</label>
              <select required value={mortalidadeLoteId} onChange={e => setMortalidadeLoteId(e.target.value)} className="w-full p-2 border rounded-lg">
                <option value="">Selecione...</option>
                {lotes.filter(l => l.status === 'ATIVO').map(l => (
                  <option key={l.id} value={l.id}>{l.id} ({l.cabecasAtuais} cbç)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número de Cabeças</label>
              <input required type="number" min="1" max={state.lotes[mortalidadeLoteId]?.cabecasAtuais || 1} value={mortalidadeCabecas} onChange={e => setMortalidadeCabecas(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setIsMortalidade(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Registrar</button>
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
                <th className="px-6 py-4 font-medium text-right">Cabeças Atuais</th>
                <th className="px-6 py-4 font-medium text-right">Peso Entrada</th>
                <th className="px-6 py-4 font-medium text-right">Preço/@</th>
                <th className="px-6 py-4 font-medium">Data Entrada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhum lote registrado.
                  </td>
                </tr>
              ) : (
                lotes.map((lote) => (
                  <tr key={lote.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{lote.id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lote.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {lote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">{lote.cabecasAtuais}</td>
                    <td className="px-6 py-4 text-right">{lote.pesoMedioEntrada} kg</td>
                    <td className="px-6 py-4 text-right">R$ {lote.precoCompraArroba.toFixed(2)}</td>
                    <td className="px-6 py-4">{format(new Date(lote.dataEntrada), 'dd/MM/yyyy')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
