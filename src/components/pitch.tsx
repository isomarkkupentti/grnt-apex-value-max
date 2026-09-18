import { Link } from "@tanstack/react-router";
import { COMPARE } from "@/lib/moat";
import { Button } from "@/components/ui/button";

const STATS = [
  { k: "GRNT EV", v: "€1.97bn" },
  { k: "JV 100%", v: "€6.55bn" },
  { k: "Split", v: "30 / 35 / 35" },
  { k: "Y5 EV/NGR", v: "2.81x" },
] as const;

const PILLARS = [
  {
    t: "Never suspend",
    d: "Knockdown moves b. Price jumps. Tape stays open. Vault HALT is a different door.",
  },
  {
    t: "2x–20x on a binary",
    d: "Margin × leverage. Liq = entry × (1 − 1/lev). Fees from flow, not from fading winners.",
  },
  {
    t: "No winner bans",
    d: "LPs earn trade, funding, and liquidation. 70/30 LP / GRNT. If fees miss LVR, you are a book again.",
  },
  {
    t: "Software take",
    d: "C-SOE and SBOBET pay CAC, rails, licences. GRNT takes 30% of FCF. Put it in the SHA.",
  },
] as const;

const CLOCKS = [
  { t: "Now", d: "Pre-seed €250k at €2.5m post. Tipster + LMSR paper tape." },
  { t: "Seed", d: "€1.5m at €10m. B2B widget. Curacao / MGA supplier." },
  { t: "Vault", d: "€1m first-loss LP. Yield from fees. Not equity." },
  { t: "Year 5", d: "DCF €1.97bn at 18% WACC, g 3.5%. Do not staple to a SAFE." },
] as const;

export function Pitch() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,var(--color-bg)_88%),radial-gradient(80%_60%_at_80%_-10%,color-mix(in_oklab,var(--color-accent)_14%,transparent),transparent)]" />
        <div className="relative mx-auto grid min-h-[78dvh] max-w-6xl content-end gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted">GRNT Partners</p>
            <h1 className="mt-4 max-w-[14ch] text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
              Sports perp.
              <span className="mt-1 block text-muted">Software take.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              LMSR tape that never suspends. 30% of JV cash. Not a book. Not Polymarket.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/desk">Open the desk</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/jv">JV DCF</Link>
              </Button>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3">
            {STATS.map((s) => (
              <div key={s.k} className="rounded-lg border border-border bg-surface/80 px-4 py-4">
                <dt className="text-[11px] uppercase tracking-wide text-subtle">{s.k}</dt>
                <dd className="mt-2 font-mono text-2xl tabular-nums tracking-tight text-gain">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">The market is broken</p>
        <h2 className="mt-3 max-w-[22ch] text-3xl font-semibold tracking-tight sm:text-4xl">
          House books suspend. Prediction markets do not live. Winners get banned.
        </h2>
        <div className="mt-8 max-w-full overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-3 font-medium">Feature</th>
                <th className="px-3 py-3 font-medium">Stake-class</th>
                <th className="px-3 py-3 font-medium">Polymarket</th>
                <th className="px-3 py-3 font-medium">GRNT</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r) => (
                <tr key={r.k} className="border-t border-border">
                  <td className="px-3 py-3 text-muted">{r.k}</td>
                  <td className="px-3 py-3">{r.trad}</td>
                  <td className="px-3 py-3">{r.poly}</td>
                  <td className="px-3 py-3 text-gain">{r.grnt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <article key={p.t} className="rounded-xl border border-border bg-bg p-5 sm:p-6">
              <h3 className="text-lg font-medium tracking-tight">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Two clocks</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Do not staple year 5 to a SAFE</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CLOCKS.map((c) => (
            <article key={c.t} className="rounded-lg border border-border bg-raised p-4">
              <p className="text-xs uppercase tracking-wide text-subtle">{c.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Open the model</h2>
            <p className="mt-2 max-w-md text-sm text-muted">
              Desk sizes Month-1 €10m at G = 5%. JV is the DCF. Moat is the LMSR tape. Bible is the doctrine.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/moat">Moat</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/bible">Bible</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
