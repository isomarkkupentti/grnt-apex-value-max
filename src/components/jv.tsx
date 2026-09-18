import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BASE_G, BASE_SHARE, BASE_WACC, sensitivity, valueJv } from "@/lib/dcf";
import { formatEur, formatPct } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { MermaidBlock } from "@/components/mermaid-block";

function m(n: number) {
  const sign = n < 0 ? "−" : "";
  return `${sign}€${Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
}

function Field({
  label,
  display,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  display: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
        <span className="font-mono text-sm tabular-nums">{display}</span>
      </span>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} />
    </label>
  );
}

const OWNERSHIP = `flowchart LR
  GRNT["GRNT 30pct software"]
  CSOE["C-SOE 35pct e-CNY / CIPS"]
  SBO["SBOBET + Boyaa 35pct Asia volume"]
  JV["JV book"]
  GRNT --> JV
  CSOE --> JV
  SBO --> JV`;

export function Jv() {
  const [wacc, setWacc] = useState(BASE_WACC);
  const [g, setG] = useState(BASE_G);
  const [share, setShare] = useState(BASE_SHARE);
  const [haircut, setHaircut] = useState(0);
  const v = useMemo(() => valueJv({ wacc, g, share, haircut }), [wacc, g, share, haircut]);
  const sens = useMemo(() => sensitivity(share, haircut), [share, haircut]);
  const waccLine = useMemo(
    () =>
      sens.waccs.map((w, i) => ({
        wacc: Math.round(w * 100),
        ev: Number(sens.grid[3]![i]!.toFixed(0)),
      })),
    [sens],
  );

  const ngrChart = v.rows.map((r) => ({
    y: `Y${r.year}`,
    ngr: Number(r.ngr.toFixed(1)),
    fcf: Number(r.fcf.toFixed(1)),
  }));

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Joint venture</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">30 / 35 / 35 DCF</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            WACC {formatPct(BASE_WACC, 0).replace("+", "")}, g {formatPct(BASE_G, 1).replace("+", "")}. GRNT is 30%
            software. Partners fund CAC, licences, rails.
          </p>
        </div>
      </header>

      <main className="mx-auto grid min-w-0 max-w-6xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-medium">Negotiation knobs</h2>
          <div className="mt-5 grid gap-5">
            <Field
              label="WACC"
              display={formatPct(wacc, 1).replace("+", "")}
              min={0.1}
              max={0.28}
              step={0.005}
              value={wacc}
              onChange={setWacc}
            />
            <Field
              label="Perpetuity g"
              display={formatPct(g, 1).replace("+", "")}
              min={0}
              max={0.06}
              step={0.0025}
              value={g}
              onChange={setG}
            />
            <Field
              label="GRNT share"
              display={formatPct(share, 0).replace("+", "")}
              min={0.15}
              max={0.5}
              step={0.01}
              value={share}
              onChange={setShare}
            />
            <Field
              label="NGR haircut"
              display={formatPct(haircut, 0).replace("+", "")}
              min={0}
              max={0.6}
              step={0.05}
              value={haircut}
              onChange={setHaircut}
            />
          </div>
          <p className="mt-5 text-xs leading-relaxed text-muted">
            Haircut scales the whole path. Use it when the other side does not buy 2.3bn NGR in year 5.
          </p>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-raised p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="gain">GRNT EV</Badge>
            <span className="text-xs uppercase tracking-wide text-muted">Standalone</span>
          </div>
          <p className="mt-2 font-mono text-4xl font-medium tabular-nums tracking-tight text-gain">
            {formatEur(v.evGrnt * 1_000_000)}
          </p>
          <p className="mt-2 text-sm text-muted">
            Ops PV {m(v.pvOps)} + TV PV {m(v.pvTv)}. Terminal is {formatPct(v.terminalShare, 0).replace("+", "")} of
            EV. JV 100% {formatEur(v.evJv * 1_000_000)}. Y5 EV/NGR {v.evSalesY5.toFixed(2)}x.
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat k="PV ops" n={m(v.pvOps)} />
            <Stat k="TV" n={m(v.tv)} />
            <Stat k="PV of TV" n={m(v.pvTv)} />
            <Stat k="JV EV" n={formatEur(v.evJv * 1_000_000)} />
          </dl>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5 lg:col-span-2">
          <h2 className="text-sm font-medium">JV cash (100%) then GRNT {formatPct(v.share, 0).replace("+", "")}</h2>
          <div className="mt-3 max-w-full overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-raised text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Line</th>
                  {v.rows.map((r) => (
                    <th key={r.year} className="px-3 py-2 font-medium">
                      Y{r.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label="JV NGR" cells={v.rows.map((r) => m(r.ngr))} />
                <Row label="JV EBIT" cells={v.rows.map((r) => m(r.ebit))} />
                <Row label="EBIT %" cells={v.rows.map((r) => formatPct(r.margin, 1).replace("+", ""))} />
                <Row label="JV FCF" cells={v.rows.map((r) => m(r.fcf))} />
                <Row label="GRNT NGR" cells={v.rows.map((r) => m(r.grntNgr))} />
                <Row label="GRNT FCF" cells={v.rows.map((r) => m(r.grntFcf))} />
                <Row label="PV FCF" cells={v.rows.map((r) => m(r.pv))} />
              </tbody>
            </table>
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-medium">NGR vs FCF</h2>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ngrChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="y" tick={{ fill: "var(--color-muted)", fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: "var(--color-muted)", fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-raised)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    color: "var(--color-fg)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="ngr" fill="var(--color-accent)" radius={2} />
                <Bar dataKey="fcf" fill="var(--color-gain)" radius={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-medium">GRNT EV vs WACC at g = 3.5%</h2>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waccLine} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="wacc" tick={{ fill: "var(--color-muted)", fontSize: 11 }} tickLine={false} unit="%" />
                <YAxis tick={{ fill: "var(--color-muted)", fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-raised)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    color: "var(--color-fg)",
                    fontSize: 12,
                  }}
                  formatter={(val) => [m(Number(val)), "EV"]}
                />
                <Line type="monotone" dataKey="ev" stroke="var(--color-gain)" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5 lg:col-span-2">
          <h2 className="text-sm font-medium">Sensitivity — GRNT EV €M</h2>
          <p className="mt-1 text-xs text-muted">Rows g, columns WACC. Base is 18% / 3.5%.</p>
          <div className="mt-3 max-w-full overflow-x-auto">
            <table className="w-full text-center font-mono text-xs tabular-nums">
              <thead>
                <tr className="text-muted">
                  <th className="px-2 py-2 text-left font-medium">g \ WACC</th>
                  {sens.waccs.map((w) => (
                    <th key={w} className="px-2 py-2 font-medium">
                      {(w * 100).toFixed(0)}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sens.gs.map((gv, ri) => (
                  <tr key={gv} className="border-t border-border">
                    <td className="px-2 py-2 text-left text-muted">{(gv * 100).toFixed(1)}%</td>
                    {sens.grid[ri]!.map((ev, ci) => {
                      const base = Math.abs(gv - 0.035) < 1e-9 && Math.abs(sens.waccs[ci]! - 0.18) < 1e-9;
                      return (
                        <td key={ci} className={base ? "px-2 py-2 text-gain" : "px-2 py-2"}>
                          {ev.toFixed(0)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5 lg:col-span-2">
          <h2 className="text-sm font-medium">Cap table</h2>
          <div className="mt-3">
            <MermaidBlock title="Ownership" chart={OWNERSHIP} />
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5 lg:col-span-2">
          <h2 className="text-sm font-medium">What this number is — and is not</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted">
            <li>
              Algebra checks. PV = FCF / (1.18)^t, TV = FCF5 × 1.035 / (0.18 − 0.035). Base GRNT EV €1.97bn, JV
              €6.55bn, Y5 EV/NGR 2.81x.
            </li>
            <li>
              GRNT FCF is 30% of JV FCF. That only holds if GRNT takes 30% of cash after partners pay CAC, rails,
              and licences. Put that in the SHA, not in the slide.
            </li>
            <li>
              65–85% EBIT on NGR is a software take, not an operator take. If GRNT is forced onto a fee of NGR
              instead of equity FCF, re-cut share or haircut.
            </li>
            <li>
              Terminal is ~75% of EV. You are mostly paying for years 6–∞ at 3.5% growth after a hockey-stick. A 20%
              NGR haircut is the adult case in the room.
            </li>
            <li>
              WACC 18% is already punitive. Do not let the other side cut WACC to 12% on the same path without
              cutting g and volume. The grid is the negotiation map.
            </li>
            <li>
              HKEX / SGX is an exit story, not a DCF input. C-SOE 35% is political risk sitting outside WACC.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

function Stat({ k, n }: { k: string; n: string }) {
  return (
    <div className="rounded-md border border-border bg-bg px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wide text-subtle">{k}</dt>
      <dd className="mt-1 font-mono text-sm tabular-nums">{n}</dd>
    </div>
  );
}

function Row({ label, cells }: { label: string; cells: string[] }) {
  return (
    <tr className="border-t border-border">
      <td className="px-3 py-2 text-muted">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="px-3 py-2 font-mono tabular-nums">
          {c}
        </td>
      ))}
    </tr>
  );
}
