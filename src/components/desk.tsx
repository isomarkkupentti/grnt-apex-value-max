import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DEFAULT_INPUT, PRESETS, lockMonthOne, monthOne, valueMax, type DeskInput, type Seat } from "@/lib/engine";
import { formatEur, formatOdds, formatPct } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const SEAT_TONE: Record<Seat, "gain" | "ok" | "muted" | "loss"> = {
  TAKE: "gain",
  MAKE: "ok",
  PASS: "muted",
  HALT: "loss",
};

function Field({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
        <span className="font-mono text-sm tabular-nums text-fg">{display}</span>
      </span>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </label>
  );
}

export function Desk() {
  const [input, setInput] = useState<DeskInput>(DEFAULT_INPUT);
  const [preset, setPreset] = useState("ufc");
  const v = useMemo(() => valueMax(input), [input]);
  const m1 = useMemo(() => monthOne(input), [input]);

  function patch(p: Partial<DeskInput>) {
    setInput((s) => ({ ...s, ...p }));
  }

  function applyPreset(id: string) {
    const found = PRESETS.find((x) => x.id === id);
    setPreset(id);
    const next = { ...DEFAULT_INPUT, ...found?.patch };
    setInput(id === "m1" ? lockMonthOne(next) : next);
  }

  function snapClip() {
    if (v.seat === "TAKE" && v.optClip > 0) patch({ clip: Math.round(v.optClip) });
  }

  const chartData = v.sweep.map((p) => ({
    clip: Math.round(p.clip / 1000),
    ev: Number((p.ev * 100).toFixed(2)),
    growth: Number((p.growth * 10000).toFixed(2)),
  }));
  const m1Chart = m1.days.map((r) => ({
    d: r.d,
    net: Number((r.netCum / 1_000_000).toFixed(2)),
    handle: Number((r.handle / 1_000_000).toFixed(2)),
  }));

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">GRNT APEX</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Value Max</h1>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Month-1 net ≥ €10m at G = 5%. Starts, handle, LVR and carry in one book.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant={preset === p.id ? "default" : "outline"}
                onClick={() => applyPreset(p.id)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Inputs</h2>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={snapClip} disabled={v.seat !== "TAKE"}>
                Snap to max clip
              </Button>
              <Button size="sm" variant="default" onClick={() => setInput(lockMonthOne(input))}>
                Lock €10m
              </Button>
            </div>
          </div>
          <div className="grid gap-5">
            <Field
              label="Model p"
              value={input.pModel}
              display={formatPct(input.pModel, 1).replace("+", "")}
              min={0.05}
              max={0.95}
              step={0.005}
              onChange={(n) => patch({ pModel: n })}
            />
            <Field
              label="Market p (close)"
              value={input.pMkt}
              display={formatPct(input.pMkt, 1).replace("+", "")}
              min={0.05}
              max={0.95}
              step={0.005}
              onChange={(n) => patch({ pMkt: n })}
            />
            <Field
              label="Shrink ω"
              value={input.shrinkW}
              display={input.shrinkW.toFixed(2)}
              min={0}
              max={1}
              step={0.05}
              onChange={(n) => patch({ shrinkW: n })}
            />
            <Field
              label="Line L"
              value={input.L}
              display={formatEur(input.L)}
              min={500_000}
              max={50_000_000}
              step={100_000}
              onChange={(n) => patch({ L: n })}
            />
            <Field
              label="Clip"
              value={input.clip}
              display={formatEur(input.clip)}
              min={10_000}
              max={5_000_000}
              step={10_000}
              onChange={(n) => patch({ clip: n })}
            />
            <Field
              label="Bankroll"
              value={input.bankroll}
              display={formatEur(input.bankroll)}
              min={10_000}
              max={5_000_000}
              step={10_000}
              onChange={(n) => patch({ bankroll: n })}
            />
            <Field
              label="Informed μ"
              value={input.mu}
              display={formatPct(input.mu, 0).replace("+", "")}
              min={0}
              max={0.8}
              step={0.01}
              onChange={(n) => patch({ mu: n })}
            />
            <Field
              label="Base spread"
              value={input.spread0}
              display={formatPct(input.spread0, 1).replace("+", "")}
              min={0.005}
              max={0.08}
              step={0.001}
              onChange={(n) => patch({ spread0: n })}
            />
            <Field
              label="G hold"
              value={input.G}
              display={formatPct(input.G, 1).replace("+", "")}
              min={0.02}
              max={0.12}
              step={0.005}
              onChange={(n) => patch({ G: n })}
            />
            <Field
              label="FTD deposit"
              value={input.deposit}
              display={formatEur(input.deposit)}
              min={50}
              max={500}
              step={10}
              onChange={(n) => patch({ deposit: n })}
            />
            <Field
              label="Leverage"
              value={input.leverage}
              display={`${input.leverage.toFixed(1)}x`}
              min={1}
              max={20}
              step={0.5}
              onChange={(n) => patch({ leverage: n })}
            />
          </div>
        </section>

        <div className="grid gap-4">
          <section className="rounded-xl border border-border bg-raised p-4 sm:p-5">
            <div className="grid gap-2">
              <Badge tone={m1.hitsTarget ? "gain" : "loss"} className="w-fit">
                {m1.hitsTarget ? "M1 CLEAR" : "M1 SHORT"}
              </Badge>
              <span className="text-xs uppercase tracking-wide text-muted">
                Month-1 net at G {formatPct(m1.G, 1).replace("+", "")}
              </span>
            </div>
            <p
              className={`mt-2 font-mono text-4xl font-medium tabular-nums tracking-tight ${
                m1.net >= m1.target ? "text-gain" : "text-loss"
              }`}
            >
              {formatEur(m1.net, 0)}
            </p>
            <p className="mt-2 max-w-xl text-sm text-muted">{m1.note}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat k="Handle" n={formatEur(m1.handle)} />
              <Stat k="Player starts" n={Math.round(m1.starts).toLocaleString("en-GB")} />
              <Stat k="Starts / casino" n={Math.round(m1.startsPerCasino).toLocaleString("en-GB")} />
              <Stat k="Starts / day" n={Math.round(m1.startsPerDay).toLocaleString("en-GB")} />
              <Stat k="Card starts" n={m1.events.toFixed(1)} />
              <Stat k="Cards / week" n={m1.eventsPerWeek.toFixed(1)} />
              <Stat k="Carry" n={formatEur(m1.carry)} tone="warn" />
              <Stat k="LVR" n={formatEur(m1.lvr)} tone={m1.lvr > 0 ? "loss" : undefined} />
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={SEAT_TONE[v.seat]}>{v.seat}</Badge>
              <span className="text-xs uppercase tracking-wide text-muted">Ticket</span>
            </div>
            <p
              className={`mt-2 font-mono text-4xl font-medium tabular-nums tracking-tight ${
                v.valueEur > 0 ? "text-gain" : v.seat === "HALT" ? "text-loss" : "text-fg"
              }`}
            >
              {formatEur(v.valueEur, 0)}
            </p>
            <p className="mt-2 max-w-xl text-sm text-muted">{v.reason}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat k="p use" n={formatPct(v.pUse, 1).replace("+", "")} />
              <Stat k="Quote" n={formatOdds(v.pQuote)} />
              <Stat k="EV" n={formatPct(v.ev)} tone={v.ev >= 0.02 ? "gain" : v.ev < 0 ? "loss" : undefined} />
              <Stat k="CLV vs mid" n={formatPct(v.clv)} tone={v.clv > 0 ? "gain" : v.clv < 0 ? "loss" : undefined} />
              <Stat k="Impact" n={formatPct(v.impact)} />
              <Stat k="¼ Kelly" n={formatEur(v.stakeCapped)} />
              <Stat k="s*" n={formatPct(v.sStar).replace("+", "")} />
              <Stat k="Maker π" n={formatEur(v.makerPi)} tone={v.makerPi > 0 ? "gain" : "loss"} />
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="text-sm font-medium">30-day net</h2>
            <p className="mt-1 text-xs text-muted">
              Cumulative net €m (solid). Daily handle €m (dashed). Logistic ramp, back-loaded.
            </p>
            <div className="mt-3 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={m1Chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="d"
                    tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--color-border)" }}
                  />
                  <YAxis
                    tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-raised)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      color: "var(--color-fg)",
                      fontSize: 12,
                    }}
                    formatter={(val, name) => [
                      `€${val}m`,
                      name === "net" ? "Net cum" : "Handle",
                    ]}
                    labelFormatter={(l) => `Day ${l}`}
                  />
                  <Line type="monotone" dataKey="net" stroke="var(--color-gain)" dot={false} strokeWidth={2} />
                  <Line
                    type="monotone"
                    dataKey="handle"
                    stroke="var(--color-accent)"
                    dot={false}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="text-sm font-medium">Clip vs EV / growth</h2>
            <p className="mt-1 text-xs text-muted">
              Solid: EV %. Dashed: log-growth × 10⁴. Cap is 2% depth {formatEur(v.depth2)}.
            </p>
            <div className="mt-3 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="clip"
                    tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--color-border)" }}
                    unit="k"
                  />
                  <YAxis
                    tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-raised)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      color: "var(--color-fg)",
                      fontSize: 12,
                    }}
                    formatter={(val, name) => [
                      name === "ev" ? `${val}%` : String(val),
                      name === "ev" ? "EV" : "Growth",
                    ]}
                    labelFormatter={(l) => `Clip €${l}k`}
                  />
                  <Line type="monotone" dataKey="ev" stroke="var(--color-accent)" dot={false} strokeWidth={2} />
                  <Line
                    type="monotone"
                    dataKey="growth"
                    stroke="var(--color-gain)"
                    dot={false}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="text-sm font-medium">Facility / hole</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat k="Event line" n={formatEur(v.eventLine)} />
              <Stat k="Coverage" n={`${v.coverage.toFixed(2)}x`} tone={v.coverage >= 1.3 ? "gain" : v.coverage < 1 ? "loss" : "warn"} />
              <Stat k="Peak util" n={formatPct(v.peakUtil).replace("+", "")} />
              <Stat k="Uncovered" n={formatEur(v.uncovered)} tone={v.uncovered > 0 ? "loss" : "gain"} />
            </dl>
            <ul className="mt-4 grid gap-2">
              {v.alerts.map((a) => (
                <li
                  key={a.code + a.text}
                  className="flex items-start gap-2 rounded-md border border-border bg-raised px-3 py-2 text-sm"
                >
                  <Badge
                    tone={a.level === "halt" ? "loss" : a.level === "watch" ? "warn" : "ok"}
                    className="mt-0.5 shrink-0"
                  >
                    {a.code}
                  </Badge>
                  <span className="text-muted">{a.text}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

function Stat({
  k,
  n,
  tone,
}: {
  k: string;
  n: string;
  tone?: "gain" | "loss" | "warn";
}) {
  const color =
    tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : tone === "warn" ? "text-warn" : "text-fg";
  return (
    <div className="rounded-md border border-border bg-bg px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wide text-subtle">{k}</dt>
      <dd className={`mt-1 font-mono text-sm tabular-nums ${color}`}>{n}</dd>
    </div>
  );
}
