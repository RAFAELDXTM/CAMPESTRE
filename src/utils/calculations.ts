import { FarmState, LoteState, PesagemState } from '../types';
import { differenceInDays, parseISO } from 'date-fns';

export function arrobasFromKg(kgTotal: number): number {
  return kgTotal / 30;
}

export function revenueFromArrobas(arrobas: number, pricePerArroba: number): number {
  return arrobas * pricePerArroba;
}

export function kgPerHeadDay(kgTotal: number, heads: number): number {
  if (heads === 0) return 0;
  return kgTotal / heads;
}

export function latestWeighing(lotId: string, asOfDate: string, pesagens: PesagemState[]): PesagemState | null {
  const lotPesagens = pesagens
    .filter(p => p.loteId === lotId && p.data <= asOfDate)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  
  return lotPesagens.length > 0 ? lotPesagens[0] : null;
}

export function gmd(entryWeight: number, latestWeight: number, days: number): number {
  if (days <= 0) return 0;
  return (latestWeight - entryWeight) / days;
}

export function estimateLotCost(lotId: string, state: FarmState): number {
  const lote = state.lotes[lotId];
  if (!lote) return 0;

  const totalCabecasAtivas = Object.values(state.lotes).reduce((acc, l) => acc + (l.status === 'ATIVO' ? l.cabecasAtuais : 0), 0);
  let estruturaRateada = 0;
  if (lote.status === 'ATIVO' && totalCabecasAtivas > 0) {
    estruturaRateada = state.despesasGerais * (lote.cabecasAtuais / totalCabecasAtivas);
  }

  return lote.custoCompra + lote.custoRacao + lote.custoDireto + estruturaRateada;
}

export function simulateSale({
  lotId,
  asOfDate,
  pricePerArroba,
  avgWeightOverride,
  state
}: {
  lotId: string;
  asOfDate: string;
  pricePerArroba: number;
  avgWeightOverride?: number;
  state: FarmState;
}) {
  const lote = state.lotes[lotId];
  if (!lote) return null;

  let weightToUse = avgWeightOverride;
  if (!weightToUse) {
    const latestW = latestWeighing(lotId, asOfDate, state.pesagens);
    weightToUse = latestW ? latestW.pesoMedioKg : lote.pesoMedioEntrada;
  }

  const heads = lote.cabecasAtuais;
  const totalKg = heads * weightToUse;
  const arrobas = arrobasFromKg(totalKg);
  const revenue = revenueFromArrobas(arrobas, pricePerArroba);
  const cost = estimateLotCost(lotId, state);
  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    heads,
    arrobas,
    revenue,
    cost,
    profit,
    margin
  };
}

export function breakEvenPrice({
  lotId,
  asOfDate,
  avgWeightOverride,
  state
}: {
  lotId: string;
  asOfDate: string;
  avgWeightOverride?: number;
  state: FarmState;
}): number {
  const lote = state.lotes[lotId];
  if (!lote) return 0;

  let weightToUse = avgWeightOverride;
  if (!weightToUse) {
    const latestW = latestWeighing(lotId, asOfDate, state.pesagens);
    weightToUse = latestW ? latestW.pesoMedioKg : lote.pesoMedioEntrada;
  }

  const heads = lote.cabecasAtuais;
  const totalKg = heads * weightToUse;
  const arrobas = arrobasFromKg(totalKg);
  const cost = estimateLotCost(lotId, state);

  if (arrobas === 0) return 0;
  return cost / arrobas;
}
