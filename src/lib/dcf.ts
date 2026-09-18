/** 3-way JV DCF. Units: € million. */

export const JV_NGR = [83.33, 283.33, 700, 1400, 2333.33] as const;
export const JV_EBIT = [54.16, 212.5, 560, 1162, 1983.33] as const;
export const JV_FCF = [43.33, 170, 448, 929.6, 1586.66] as const;
export const EBIT_MARGIN = [0.65, 0.75, 0.8, 0.83, 0.85] as const;

export const BASE_WACC = 0.18;
export const BASE_G = 0.035;
export const BASE_SHARE = 0.3;

export type DcfInput = {
  wacc: number;
  g: number;
  share: number;
  haircut: number;
};

export type YearRow = {
  year: number;
  ngr: number;
  ebit: number;
  margin: number;
  fcf: number;
  grntNgr: number;
  grntFcf: number;
  pv: number;
};

export type DcfResult = {
  rows: YearRow[];
  pvOps: number;
  tv: number;
  pvTv: number;
  evGrnt: number;
  evJv: number;
  evSalesY5: number;
  terminalShare: number;
  wacc: number;
  g: number;
  share: number;
};

export function pvFactor(wacc: number, t: number) {
  return 1 / (1 + wacc) ** t;
}

export function terminalValue(fcf5: number, g: number, wacc: number) {
  const gap = wacc - g;
  if (gap <= 0.001) return Number.POSITIVE_INFINITY;
  return (fcf5 * (1 + g)) / gap;
}

export function valueJv(i: DcfInput): DcfResult {
  const hair = 1 - Math.min(0.9, Math.max(0, i.haircut));
  const share = Math.min(0.9, Math.max(0.05, i.share));
  const wacc = Math.min(0.4, Math.max(0.06, i.wacc));
  const g = Math.min(wacc - 0.005, Math.max(0, i.g));

  const rows: YearRow[] = JV_NGR.map((ngr0, idx) => {
    const t = idx + 1;
    const ngr = ngr0 * hair;
    const ebit = JV_EBIT[idx]! * hair;
    const fcf = JV_FCF[idx]! * hair;
    const grntFcf = fcf * share;
    const pv = grntFcf * pvFactor(wacc, t);
    return {
      year: t,
      ngr,
      ebit,
      margin: ngr > 0 ? ebit / ngr : 0,
      fcf,
      grntNgr: ngr * share,
      grntFcf,
      pv,
    };
  });

  const pvOps = rows.reduce((s, r) => s + r.pv, 0);
  const fcf5 = rows[4]!.grntFcf;
  const tv = terminalValue(fcf5, g, wacc);
  const pvTv = tv * pvFactor(wacc, 5);
  const evGrnt = pvOps + pvTv;
  const evJv = share > 0 ? evGrnt / share : 0;
  const y5Ngr = rows[4]!.grntNgr;

  return {
    rows,
    pvOps,
    tv,
    pvTv,
    evGrnt,
    evJv,
    evSalesY5: y5Ngr > 0 ? evGrnt / y5Ngr : 0,
    terminalShare: evGrnt > 0 ? pvTv / evGrnt : 0,
    wacc,
    g,
    share,
  };
}

export function sensitivity(share: number, haircut: number) {
  const waccs = [0.12, 0.14, 0.16, 0.18, 0.2, 0.22, 0.24];
  const gs = [0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05];
  return {
    waccs,
    gs,
    grid: gs.map((g) =>
      waccs.map((wacc) => valueJv({ wacc, g, share, haircut }).evGrnt),
    ),
  };
}
