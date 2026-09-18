/** Hanson's LMSR — live sports tape that does not suspend. */

export type Side = "A" | "B";

export type LmsrPool = {
  b: number;
  qA: number;
  qB: number;
  capital: number;
};

export function lmsrCost(qA: number, qB: number, b: number) {
  const bb = Math.max(b, 1e-9);
  const m = Math.max(qA, qB);
  const ea = Math.exp((qA - m) / bb);
  const eb = Math.exp((qB - m) / bb);
  return bb * (Math.log(ea + eb) + m / bb);
}

export function lmsrPrices(p: LmsrPool) {
  const m = Math.max(p.qA, p.qB);
  const ea = Math.exp((p.qA - m) / p.b);
  const eb = Math.exp((p.qB - m) / p.b);
  const z = ea + eb;
  return { pA: ea / z, pB: eb / z };
}

export function buyCost(p: LmsrPool, side: Side, shares: number) {
  const qA = p.qA + (side === "A" ? shares : 0);
  const qB = p.qB + (side === "B" ? shares : 0);
  return lmsrCost(qA, qB, p.b) - lmsrCost(p.qA, p.qB, p.b);
}

export function applyBuy(p: LmsrPool, side: Side, shares: number): LmsrPool {
  return {
    ...p,
    qA: p.qA + (side === "A" ? shares : 0),
    qB: p.qB + (side === "B" ? shares : 0),
  };
}

export function liquidationPrice(entry: number, leverage: number) {
  const lev = Math.max(1.01, leverage);
  return Math.max(0.01, entry * (1 - 1 / lev));
}

export type Quote = {
  side: Side;
  entry: number;
  shares: number;
  notional: number;
  cost: number;
  slippage: number;
  liq: number;
  pAfter: number;
};

export function quoteTrade(p: LmsrPool, side: Side, margin: number, leverage: number): Quote {
  const { pA, pB } = lmsrPrices(p);
  const entry = side === "A" ? pA : pB;
  const notional = margin * leverage;
  const shares = entry > 0 ? notional / entry : 0;
  const cost = buyCost(p, side, shares);
  const after = applyBuy(p, side, shares);
  const prices = lmsrPrices(after);
  const pAfter = side === "A" ? prices.pA : prices.pB;
  const slippage = entry > 0 ? pAfter / entry - 1 : 0;
  return {
    side,
    entry,
    shares,
    notional,
    cost,
    slippage,
    liq: liquidationPrice(entry, leverage),
    pAfter,
  };
}

/** Quarter-Kelly cap 2.5% of vault, maps to LMSR b. Never zero — never suspend. */
export function resizeB(capital: number, trueP: number, publicP: number) {
  if (!(publicP > trueP) || publicP >= 0.999) return Math.max(100, capital * 0.001);
  const win = 1 - trueP;
  const netOdds = 1 / (1 - publicP) - 1;
  if (netOdds <= 0) return Math.max(100, capital * 0.001);
  const kelly = (win * netOdds - (1 - win)) / netOdds;
  const safe = Math.max(0.001, Math.min(kelly * 0.25, 0.025));
  return Math.max(100, (capital * safe) / 2);
}

export function fundingRate(longShare: number, k = 0.02) {
  return k * (longShare - 0.5);
}

export type Fees = {
  trade: number;
  funding: number;
  liq: number;
  net: number;
  lp: number;
  grnt: number;
};

export function protocolFees(opts: {
  volume: number;
  tradeFee: number;
  notional: number;
  longShare: number;
  fundCut: number;
  liqNotional: number;
  liqPen: number;
}): Fees {
  const trade = opts.volume * opts.tradeFee;
  const funding = Math.abs(fundingRate(opts.longShare)) * opts.notional * opts.fundCut;
  const liq = opts.liqNotional * opts.liqPen;
  const net = trade + funding + liq;
  return { trade, funding, liq, net, lp: net * 0.7, grnt: net * 0.3 };
}

export function unitEcon(arpu: number, cac: number, months: number, take: number) {
  const ltv = arpu * months * take;
  return { ltv, ratio: cac > 0 ? ltv / cac : 0, payback: arpu * take > 0 ? cac / (arpu * take) : Infinity };
}
