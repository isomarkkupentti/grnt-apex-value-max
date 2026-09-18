import { useMemo, useState } from "react";
import { COMPARE, ECO, FUND, PHASES, REVENUE, SPRINTS } from "@/lib/moat";
import { protocolFees, quoteTrade, resizeB, unitEcon, type LmsrPool, type Side } from "@/lib/lmsr";
import { formatEur, formatPct } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MermaidBlock } from "@/components/mermaid-block";

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

export function Moat() {
  const [capital] = useState(1_000_000);
  const [trueP, setTrueP] = useState(0.58);
  const [publicP, setPublicP] = useState(0.62);
  const [margin, setMargin] = useState(100);
  const [lev, setLev] = useState(10);
  const [side, setSide] = useState<Side>("A");
  const [fee, setFee] = useState(0.003);
  const [fundCut, setFundCut] = useState(0.15);
  const [liqPen, setLiqPen] = useState(0.02);
  const [volume, setVolume] = useState(2_000_000);
  const [arpu, setArpu] = useState(180);
  const [cac, setCac] = useState(32);
  const [months, setMonths] = useState(8);
  const [take, setTake] = useState(0.35);

  const b = useMemo(() => resizeB(capital, trueP, publicP), [capital, trueP, publicP]);
  const pool: LmsrPool = { b, qA: 0, qB: 0, capital };
  const q = quoteTrade(pool, side, margin, lev);
  const fees = useMemo(
    () =>
      protocolFees({
        volume,
        tradeFee: fee,
        notional: volume * 1.6,
        longShare: 0.72,
        fundCut,
        liqNotional: volume * 0.04,
        liqPen,
      }),
    [volume, fee, fundCut, liqPen],
  );
  const ue = useMemo(() => unitEcon(arpu, cac, months, take), [arpu, cac, months, take]);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Unfair advantage</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Sports perp</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Not a book. Not Polymarket. LMSR tape that stays open, leverage on a binary, fees from flow — not from
            banning winners.
          </p>
        </div>
      </header>

      <main className="mx-auto grid min-w-0 max-w-6xl gap-4 px-4 py-4 sm:px-6">
        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-medium">Why this wins</h2>
          <div className="mt-3 max-w-full overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-raised text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Feature</th>
                  <th className="px-3 py-2 font-medium">Stake-class</th>
                  <th className="px-3 py-2 font-medium">Polymarket</th>
                  <th className="px-3 py-2 font-medium">GRNT</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r.k} className="border-t border-border">
                    <td className="px-3 py-2 text-muted">{r.k}</td>
                    <td className="px-3 py-2">{r.trad}</td>
                    <td className="px-3 py-2">{r.poly}</td>
                    <td className="px-3 py-2 text-gain">{r.grnt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="text-sm font-medium">LMSR tape — never suspend</h2>
            <p className="mt-1 text-xs text-muted">
              Knockdown raises b. Price jumps. Market stays open. Vault HALT is still a halt.
            </p>
            <div className="mt-4 grid gap-4">
              <Field
                label="Model p"
                display={formatPct(trueP, 1).replace("+", "")}
                min={0.2}
                max={0.8}
                step={0.01}
                value={trueP}
                onChange={setTrueP}
              />
              <Field
                label="Public p"
                display={formatPct(publicP, 1).replace("+", "")}
                min={0.2}
                max={0.8}
                step={0.01}
                value={publicP}
                onChange={setPublicP}
              />
              <Field
                label="Margin"
                display={formatEur(margin)}
                min={20}
                max={2000}
                step={10}
                value={margin}
                onChange={setMargin}
              />
              <Field
                label="Leverage"
                display={`${lev.toFixed(0)}x`}
                min={2}
                max={20}
                step={1}
                value={lev}
                onChange={setLev}
              />
              <div className="flex gap-2">
                <Button size="sm" variant={side === "A" ? "default" : "outline"} onClick={() => setSide("A")}>
                  Buy A
                </Button>
                <Button size="sm" variant={side === "B" ? "default" : "outline"} onClick={() => setSide("B")}>
                  Buy B
                </Button>
              </div>
            </div>
          </section>

          <section className="min-w-0 rounded-xl border border-border bg-raised p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="ok">QUOTE</Badge>
              <span className="text-xs uppercase tracking-wide text-muted">b {b.toFixed(0)}</span>
            </div>
            <p className="mt-2 font-mono text-4xl font-medium tabular-nums">{q.entry.toFixed(3)}</p>
            <p className="mt-2 text-sm text-muted">
              {lev.toFixed(0)}x on {formatEur(margin)} → {formatEur(q.notional)}. After {q.pAfter.toFixed(3)}. Liq{" "}
              {q.liq.toFixed(3)}.
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3">
              <Stat k="Slippage" n={formatPct(q.slippage)} />
              <Stat k="Shares" n={q.shares.toFixed(1)} />
              <Stat k="Cost" n={formatEur(q.cost)} />
              <Stat k="Liq" n={q.liq.toFixed(3)} />
            </dl>
          </section>
        </div>

        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-medium">Treasury — fees, not fading winners</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Day volume"
              display={formatEur(volume)}
              min={100_000}
              max={10_000_000}
              step={100_000}
              value={volume}
              onChange={setVolume}
            />
            <Field
              label="Trade fee"
              display={formatPct(fee, 2).replace("+", "")}
              min={0.001}
              max={0.005}
              step={0.0005}
              value={fee}
              onChange={setFee}
            />
            <Field
              label="Funding cut"
              display={formatPct(fundCut, 0).replace("+", "")}
              min={0.1}
              max={0.2}
              step={0.01}
              value={fundCut}
              onChange={setFundCut}
            />
            <Field
              label="Liq penalty"
              display={formatPct(liqPen, 1).replace("+", "")}
              min={0.01}
              max={0.03}
              step={0.002}
              value={liqPen}
              onChange={setLiqPen}
            />
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat k="Trade" n={formatEur(fees.trade)} />
            <Stat k="Funding" n={formatEur(fees.funding)} />
            <Stat k="Liq" n={formatEur(fees.liq)} />
            <Stat k="LP 70%" n={formatEur(fees.lp)} />
            <Stat k="GRNT 30%" n={formatEur(fees.grnt)} />
          </dl>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-medium">Unit economics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="ARPU / mo" display={formatEur(arpu)} min={35} max={400} step={5} value={arpu} onChange={setArpu} />
            <Field label="CAC" display={formatEur(cac)} min={15} max={120} step={1} value={cac} onChange={setCac} />
            <Field label="Months" display={`${months}`} min={2} max={18} step={1} value={months} onChange={setMonths} />
            <Field
              label="Take"
              display={formatPct(take, 0).replace("+", "")}
              min={0.15}
              max={0.7}
              step={0.05}
              value={take}
              onChange={setTake}
            />
          </div>
          <p className="mt-4 text-sm text-muted">
            LTV {formatEur(ue.ltv)} · LTV/CAC {ue.ratio.toFixed(1)}x · payback {ue.payback.toFixed(1)} mo. Floor for
            scale is 4.5x — this page computes, it does not advertise.
          </p>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <MermaidBlock title="Revenue" chart={REVENUE} />
        </section>
        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <MermaidBlock title="Ecosystem" chart={ECO} />
        </section>
        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <MermaidBlock title="Raise" chart={FUND} />
          <p className="mt-3 text-sm text-muted">
            Pre-seed €250k at €2.5m post is now. Seed €1.5m at €10m. LP vault €1m is first-loss, not equity. The JV
            DCF €1.97bn is a year-5 story — do not staple it to a SAFE.
          </p>
        </section>
        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <MermaidBlock title="Phases" chart={PHASES} />
          <ol className="mt-4 grid gap-2">
            {SPRINTS.map((s) => (
              <li key={s.id} className="rounded-md border border-border bg-raised px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-subtle">
                  {s.when} · {s.title}
                </p>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-medium">Rules that keep this honest</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted">
            <li>LMSR never suspends a knockdown. UNKNOWN fighter / broken oracle still HALT. Those are different doors.</li>
            <li>20x on a binary is a liquidation machine. Size b so a whale cannot empty the vault. Quarter-Kelly, 2.5% cap.</li>
            <li>No winner bans because LPs earn fees. If fees do not cover LVR, you are the book again — raise s or cut mu.</li>
            <li>Brier vs Pinnacle open is the only model claim. Four features are a hypothesis until that print exists.</li>
            <li>70/30 B2B GGR is a term sheet. Widget partners will try 30/70 the other way.</li>
            <li>Math stays TypeScript in this product. Same identities in Phase IV. Database can change; C(q) cannot.</li>
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
