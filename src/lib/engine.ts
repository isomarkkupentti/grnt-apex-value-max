/** APEX Value Max — CPMM + Kelly + CLV + inventory game theory + facility. */

export type Book = { qYes: number; qNo: number };

export type DeskInput = {
  pModel: number;
  pMkt: number;
  shrinkW: number;
  L: number;
  clip: number;
  spread0: number;
  kappa: number;
  mu: number;
  bankroll: number;
  kellyFrac: number;
  kellyCap: number;
  evFloor: number;
  leverage: number;
  facility: number;
  eventPct: number;
  vault: number;
  junior: number;
  lpTake: number;
  rate: number;
  commitment: number;
  avgDrawn: number;
  casinos: number;
  monthlyHandleEach: number;
  peakWeeklyShare: number;
  targetUtil: number;
  targetProfit: number;
  G: number;
  deposit: number;
  days: number;
};

export type Alert = { level: "ok" | "watch" | "halt"; code: string; text: string };
export type Seat = "TAKE" | "MAKE" | "PASS" | "HALT";

export type SweepPoint = { clip: number; ev: number; growth: number; impact: number };

export type Verdict = {
  pUse: number;
  pMid: number;
  pExec: number;
  pQuote: number;
  odds: number;
  impact: number;
  lambda: number;
  skew: number;
  spread: number;
  sStar: number;
  ev: number;
  clv: number;
  kellyFull: number;
  kellyFracUsed: number;
  stakeKelly: number;
  stakeCapped: number;
  growth: number;
  depth2: number;
  makerPi: number;
  lvr: number;
  spreadRev: number;
  hole: number;
  uncovered: number;
  eventLine: number;
  coverage: number;
  peakUtil: number;
  impliedSlip: number;
  seat: Seat;
  valueEur: number;
  reason: string;
  alerts: Alert[];
  sweep: SweepPoint[];
  optClip: number;
  optGrowth: number;
  optEv: number;
};

export const DEFAULT_INPUT: DeskInput = {
  pModel: 0.64,
  pMkt: 0.62,
  shrinkW: 0.4,
  L: 10_000_000,
  clip: 1_250_000,
  spread0: 0.02,
  kappa: 0.04,
  mu: 0.22,
  bankroll: 250_000,
  kellyFrac: 0.25,
  kellyCap: 0.1,
  evFloor: 0.02,
  leverage: 3.5,
  facility: 500_000_000,
  eventPct: 0.02,
  vault: 10_000_000,
  junior: 1_500_000,
  lpTake: 0.007,
  rate: 0.065,
  commitment: 0.0075,
  avgDrawn: 0.4,
  casinos: 10,
  monthlyHandleEach: 40_000_000,
  peakWeeklyShare: 0.08,
  targetUtil: 0.72,
  targetProfit: 10_000_000,
  G: 0.05,
  deposit: 200,
  days: 30,
};

export const PRESETS: { id: string; label: string; patch: Partial<DeskInput> }[] = [
  { id: "ufc", label: "UFC main", patch: {} },
  {
    id: "nfl",
    label: "NFL side",
    patch: {
      pModel: 0.545,
      pMkt: 0.524,
      L: 25_000_000,
      clip: 400_000,
      mu: 0.14,
      bankroll: 500_000,
      vault: 25_000_000,
    },
  },
  {
    id: "soft",
    label: "Soft book",
    patch: {
      pModel: 0.58,
      pMkt: 0.5,
      L: 8_000_000,
      clip: 200_000,
      mu: 0.08,
      bankroll: 100_000,
      vault: 8_000_000,
    },
  },
  {
    id: "none",
    label: "No edge",
    patch: {
      pModel: 0.52,
      pMkt: 0.52,
      L: 10_000_000,
      clip: 500_000,
      mu: 0.3,
      bankroll: 250_000,
    },
  },
  {
    id: "m1",
    label: "M1 · 10m",
    patch: {
      G: 0.05,
      targetProfit: 10_000_000,
      deposit: 200,
      days: 30,
      casinos: 10,
      mu: 0.18,
      spread0: 0.02,
      leverage: 3.5,
    },
  },
];

export function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function seedBook(L: number, p: number): Book {
  const pClamped = clamp(p, 0.05, 0.95);
  return { qYes: L * (1 - pClamped), qNo: L * pClamped };
}

export function mid(b: Book) {
  const L = b.qYes + b.qNo;
  const pYes = L > 0 ? b.qNo / L : 0.5;
  return { pYes, pNo: 1 - pYes, L, oddsYes: pYes > 0 ? 1 / pYes : 99, k: b.qYes * b.qNo };
}

export function skew(b: Book) {
  const L = b.qYes + b.qNo;
  return L > 0 ? (b.qNo - b.qYes) / L : 0;
}

export function inventorySpread(base: number, sk: number, kappa = 0.04) {
  return base + kappa * Math.abs(sk);
}

export function ammLambda(L: number, p: number) {
  return (2 * (1 - p)) / Math.max(L, 1);
}

export function buyYes(b: Book, a: number, spread = 0.02) {
  const aIn = Math.max(0, a);
  const k = b.qYes * b.qNo;
  if (k <= 0 || aIn === 0) {
    const m = mid(b);
    return {
      next: b,
      yesOut: 0,
      pExec: m.pYes,
      pQuote: Math.min(0.99, m.pYes * (1 + spread)),
      odds: 1 / Math.min(0.99, m.pYes * (1 + spread)),
      impact: 0,
      spread,
      skew: skew(b),
      after: m,
    };
  }
  const qNo2 = b.qNo + aIn;
  const qYes2 = k / qNo2;
  const yesFromSwap = b.qYes - qYes2;
  const yesOut = aIn + yesFromSwap;
  const pExec = yesOut > 0 ? aIn / yesOut : 1;
  const pQuote = Math.min(0.99, pExec * (1 + spread));
  const next: Book = { qYes: qYes2, qNo: qNo2 };
  const before = mid(b);
  return {
    next,
    yesOut,
    pExec,
    pQuote,
    odds: 1 / pQuote,
    impact: before.pYes > 0 ? pExec / before.pYes - 1 : 0,
    spread,
    skew: skew(next),
    after: mid(next),
  };
}

export function sizeForImpact(b: Book, impact: number) {
  const m = mid(b);
  const k = b.qYes * b.qNo;
  if (k <= 0) return 0;
  const pTarget = Math.min(0.99, m.pYes * (1 + impact));
  if (pTarget >= 1) return 0;
  const qNo2 = Math.sqrt((pTarget * k) / (1 - pTarget));
  return Math.max(0, qNo2 - b.qNo);
}

export function expectedValue(trueProb: number, decimalOdds: number) {
  return trueProb * decimalOdds - 1;
}

export function kellyFull(trueProb: number, decimalOdds: number) {
  const b = decimalOdds - 1;
  if (b <= 0) return 0;
  const full = (b * trueProb - (1 - trueProb)) / b;
  return Math.max(0, full);
}

export function fractionalKelly(trueProb: number, decimalOdds: number, fraction = 0.25, cap = 0.1) {
  const full = kellyFull(trueProb, decimalOdds);
  if (full <= 0) return 0;
  return Math.min(full * fraction, cap);
}

export function expectedLogGrowth(p: number, decimalOdds: number, f: number) {
  if (f <= 0 || f >= 1) return 0;
  const b = decimalOdds - 1;
  const win = 1 + b * f;
  const lose = 1 - f;
  if (win <= 0 || lose <= 0) return Number.NEGATIVE_INFINITY;
  return p * Math.log(win) + (1 - p) * Math.log(lose);
}

export function clv(dTaken: number, dClose: number) {
  if (dClose <= 0) return 0;
  return dTaken / dClose - 1;
}

export function vammHole(p: { notional: number; pYes: number; lev: number; vault: number; junior: number }) {
  const margin = p.notional / Math.max(p.lev, 1);
  const winPayout = p.notional * (1 - p.pYes);
  const hole = Math.max(0, winPayout);
  const vaultLeft = p.vault - margin;
  const uncovered = Math.max(0, hole - Math.max(0, vaultLeft) - p.junior);
  return { margin, winPayout, hole, uncovered, covered: uncovered <= 0 };
}

function linspace(a: number, b: number, n: number) {
  if (n <= 1) return [a];
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}

export function valueMax(i: DeskInput): Verdict {
  const pUse = clamp(i.shrinkW * i.pModel + (1 - i.shrinkW) * i.pMkt, 0.02, 0.98);
  const book = seedBook(i.L, i.pMkt);
  const m0 = mid(book);
  const sk0 = skew(book);
  const sQuoted = inventorySpread(i.spread0, sk0, i.kappa);
  const delta = Math.abs(pUse - m0.pYes);
  const mu = clamp(i.mu, 0, 0.95);
  const sStar = (mu / (1 - mu + 1e-9)) * delta + i.kappa * Math.abs(sk0);
  const spread = Math.max(sQuoted, sStar);
  const lambda = ammLambda(i.L, m0.pYes);
  const depth2 = sizeForImpact(book, 0.02);

  const fillHint = buyYes(book, i.clip, spread);
  const evHint = expectedValue(pUse, fillHint.odds);
  const dClose = m0.pYes > 0 ? 1 / m0.pYes : 2;
  const clvHint = clv(fillHint.odds, dClose);
  const kFull = kellyFull(pUse, fillHint.odds);
  const kFrac = fractionalKelly(pUse, fillHint.odds, i.kellyFrac, i.kellyCap);
  const stakeKelly = kFrac * i.bankroll;
  const stakeCapped = Math.min(stakeKelly, depth2, i.bankroll * i.kellyCap);
  const fillStake = buyYes(book, stakeCapped, spread);
  const growthHint = expectedLogGrowth(pUse, fillStake.odds, stakeCapped / Math.max(i.bankroll, 1));

  const maxClip = Math.min(i.bankroll, Math.max(depth2, i.clip), i.L * 0.2);
  const sweep: SweepPoint[] = [];
  let optClip = 0;
  let optGrowth = 0;
  let optEv = -1;
  for (const a of linspace(0, Math.max(maxClip, 1), 48)) {
    const f = buyYes(book, a, spread);
    const ev = expectedValue(pUse, f.odds);
    const frac = a / Math.max(i.bankroll, 1);
    const g = expectedLogGrowth(pUse, f.odds, Math.min(frac, 0.99));
    sweep.push({ clip: a, ev, growth: g, impact: f.impact });
    if (g > optGrowth && ev >= i.evFloor && a <= depth2 + 1) {
      optGrowth = g;
      optClip = a;
      optEv = ev;
    }
  }

  const lvr = mu * i.clip * delta;
  const spreadRev = spread * i.clip;
  const makerPi = spreadRev - lvr;

  const holePack = vammHole({
    notional: i.clip * i.leverage,
    pYes: m0.pYes,
    lev: i.leverage,
    vault: i.vault,
    junior: i.junior,
  });

  const eventLine = i.facility * i.eventPct;
  const monthlyHandle = i.casinos * i.monthlyHandleEach;
  const annualHandle = monthlyHandle * 12;
  const weeklyHandle = monthlyHandle / (365 / 7 / 12);
  const peakOneSided = weeklyHandle * i.peakWeeklyShare;
  const reserveAtImpact = i.spread0 > 0 ? (peakOneSided * (1 - i.spread0)) / i.spread0 : peakOneSided;
  const poolNeed = i.targetUtil > 0 ? reserveAtImpact / i.targetUtil : reserveAtImpact;
  const drawnAvg = i.facility * i.avgDrawn;
  const undrawnAvg = i.facility - drawnAvg;
  const annualCost = drawnAvg * i.rate + undrawnAvg * i.commitment;
  const lpRev = annualHandle * i.lpTake;
  const coverage = annualCost > 0 ? lpRev / annualCost : 0;
  const peakUtil = i.facility > 0 ? reserveAtImpact / i.facility : 1;
  const impliedSlip = i.L + i.clip > 0 ? i.clip / (i.L + i.clip) : 1;

  const alerts: Alert[] = [];
  if (i.L > i.vault + 1) {
    alerts.push({ level: "halt", code: "VAULT", text: "Line L above vault. Naked depth." });
  }
  if (!holePack.covered) {
    alerts.push({
      level: "halt",
      code: "HOLE",
      text: `Favourite-win payout exceeds vault leftover + junior.`,
    });
  }
  if (coverage < 1) {
    alerts.push({ level: "halt", code: "CARRY", text: `LP skim does not cover carry (${coverage.toFixed(2)}x).` });
  } else if (coverage < 1.3) {
    alerts.push({ level: "watch", code: "CARRY", text: `Coverage ${coverage.toFixed(2)}x is thin after first-loss.` });
  }
  if (Math.abs(sk0) > 0.4 || fillHint.skew > 0.7) {
    alerts.push({ level: "watch", code: "SKEW", text: "One side heavy. Widen spread or halt new leverage." });
  }
  if (i.clip > depth2) {
    alerts.push({ level: "watch", code: "IMPACT", text: "Clip walks through 2% depth. Cut size." });
  }
  if (i.clip > eventLine) {
    alerts.push({ level: "watch", code: "LINE", text: "Clip exceeds event line (2% of facility)." });
  }
  if (poolNeed > i.facility * 1.05) {
    alerts.push({ level: "halt", code: "CAPACITY", text: "Peak one-sided flow needs more than the facility." });
  }

  const halted = alerts.some((a) => a.level === "halt");
  const takeValue = optEv > 0 ? optEv * optClip : 0;
  const makeValue = makerPi;
  let seat: Seat = "PASS";
  let valueEur = 0;
  let reason = "No edge after impact and vig. Stake is zero.";

  if (halted) {
    seat = "HALT";
    valueEur = 0;
    reason = "Facility or solvency halt. Do not seed this line.";
  } else if (optGrowth > 0 && optEv >= i.evFloor) {
    seat = "TAKE";
    valueEur = takeValue;
    reason = `Beat quote after impact. Quarter-Kelly clip ${formatClip(optClip)}. EV ${pct(optEv)}.`;
  } else if (makeValue > 0 && sStar <= 0.12) {
    seat = "MAKE";
    valueEur = makeValue;
    reason = `Taker EV does not clear the floor. Earn spread ${pct(spread)} minus LVR.`;
  } else {
    seat = "PASS";
    valueEur = 0;
    reason = "Neither seat clears. Pass.";
  }

  if (alerts.length === 0) {
    alerts.push({
      level: "ok",
      code: "OK",
      text: "No halt. Watch skew, oracle lag, and group correlation.",
    });
  }

  return {
    pUse,
    pMid: m0.pYes,
    pExec: fillHint.pExec,
    pQuote: fillHint.pQuote,
    odds: fillHint.odds,
    impact: fillHint.impact,
    lambda,
    skew: fillHint.skew,
    spread,
    sStar,
    ev: evHint,
    clv: clvHint,
    kellyFull: kFull,
    kellyFracUsed: kFrac,
    stakeKelly,
    stakeCapped,
    growth: growthHint,
    depth2,
    makerPi,
    lvr,
    spreadRev,
    hole: holePack.hole,
    uncovered: holePack.uncovered,
    eventLine,
    coverage,
    peakUtil,
    impliedSlip,
    seat,
    valueEur,
    reason,
    alerts,
    sweep,
    optClip,
    optGrowth,
    optEv,
  };
}

function pct(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${(Math.abs(n) * 100).toFixed(1)}%`;
}

function formatClip(n: number) {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(2)}m`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}k`;
  return `€${n.toFixed(0)}`;
}

export type DayRow = {
  d: number;
  handle: number;
  starts: number;
  gross: number;
  netCum: number;
};

export type MonthPlan = {
  G: number;
  target: number;
  handle: number;
  starts: number;
  startsPerCasino: number;
  startsPerDay: number;
  events: number;
  eventsPerWeek: number;
  deposit: number;
  unitHandle: number;
  deployed: number;
  eventLine: number;
  carry: number;
  lvr: number;
  gross: number;
  net: number;
  hitsTarget: boolean;
  days: DayRow[];
  note: string;
};

/** Net ≥ target in `days`. G is hold on handle. Starts = handle / (deposit × leverage). */
export function monthOne(i: DeskInput): MonthPlan {
  const G = Math.max(0.005, i.G);
  const target = Math.max(0, i.targetProfit);
  const days = Math.max(7, Math.round(i.days));
  const delta = Math.max(0.015, Math.abs(i.pModel - i.pMkt));
  const eventLine = i.facility * i.eventPct;

  let handle = target / G;
  let deployed = target / G;
  let carry = 0;
  let lvr = 0;
  let gross = 0;
  let net = 0;

  for (let k = 0; k < 12; k++) {
    deployed = Math.min(i.facility, Math.max(target / G, handle * 0.12));
    const drawn = Math.min(i.facility, Math.max(deployed, i.facility * i.avgDrawn));
    const undrawn = Math.max(0, i.facility - drawn);
    carry = (drawn * i.rate + undrawn * i.commitment) / 12;
    lvr = i.mu * handle * delta;
    gross = handle * G;
    net = gross - carry - lvr;
    if (net >= target) break;
    handle += (target - net) / G;
  }

  const unit = Math.max(1, i.deposit * i.leverage);
  const starts = handle / unit;
  const events = eventLine > 0 ? handle / eventLine : 0;

  const raw = Array.from({ length: days }, (_, t) => 1 / (1 + Math.exp(-0.28 * (t + 1 - days * 0.55))));
  const sum = raw.reduce((a, b) => a + b, 0);
  let cum = 0;
  const rows: DayRow[] = raw.map((w, idx) => {
    const h = (handle * w) / sum;
    const g = h * G;
    const n = g - carry / days - lvr / days;
    cum += n;
    return { d: idx + 1, handle: h, starts: (starts * w) / sum, gross: g, netCum: cum };
  });

  const hitsTarget = net + 1e-6 >= target;
  const note = hitsTarget
    ? `Hold ${pct(G).replace("+", "")} on ${formatClip(handle)} handle. Player starts ${Math.round(starts).toLocaleString("en-GB")}. Card starts ${events.toFixed(1)}.`
    : "Cannot clear €10m net inside facility and G. Raise G, cut μ, or add casinos.";

  return {
    G,
    target,
    handle,
    starts,
    startsPerCasino: starts / Math.max(i.casinos, 1),
    startsPerDay: starts / days,
    events,
    eventsPerWeek: events / (days / 7),
    deposit: i.deposit,
    unitHandle: unit,
    deployed,
    eventLine,
    carry,
    lvr,
    gross,
    net,
    hitsTarget,
    days: rows,
    note,
  };
}

export function lockMonthOne(i: DeskInput): DeskInput {
  const m = monthOne(i);
  const each = m.handle / Math.max(i.casinos, 1);
  const line = i.facility * i.eventPct;
  return {
    ...i,
    G: 0.05,
    targetProfit: 10_000_000,
    monthlyHandleEach: each,
    vault: Math.max(i.vault, line),
    L: Math.min(line, Math.max(i.L, line * 0.8)),
    junior: Math.max(i.junior, line * 0.15),
    clip: Math.min(i.clip, line * 0.2),
  };
}

