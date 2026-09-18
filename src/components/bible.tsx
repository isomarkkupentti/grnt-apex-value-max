import { useMemo } from "react";
import { DEFAULT_INPUT, monthOne } from "@/lib/engine";
import { CHARTS, HALTS, IDENTITIES, OPEX_M1, ROADMAP, TACTICS } from "@/lib/bible";
import { formatEur } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { MermaidBlock } from "@/components/mermaid-block";

const TOC = [
  { href: "#doctrine", label: "Doctrine" },
  { href: "#logic", label: "Logic" },
  { href: "#maps", label: "Maps" },
  { href: "#tactics", label: "Tactics" },
  { href: "#budget", label: "Budget" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#halts", label: "Halts" },
];

export function Bible() {
  const m1 = useMemo(() => monthOne(DEFAULT_INPUT), []);
  const opexM = OPEX_M1.reduce((s, r) => s + r.month, 0);
  const opexY = OPEX_M1.reduce((s, r) => s + r.year, 0);
  const drawn = DEFAULT_INPUT.facility * DEFAULT_INPUT.avgDrawn;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Tactical book</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">APEX Bible</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Business logic, dev maps, month-1 budget, 12-month road. Same identities as the desk.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-3 lg:self-start">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {TOC.map((t) => (
              <a
                key={t.href}
                href={t.href}
                className="shrink-0 rounded-sm px-3 py-2 text-sm text-muted hover:bg-raised hover:text-fg"
              >
                {t.label}
              </a>
            ))}
          </nav>
        </aside>

        <article className="grid min-w-0 gap-10 pb-16">
          <section id="doctrine" className="grid gap-3">
            <h2 className="text-lg font-medium">Doctrine</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              APEX is not a sportsbook. The casino keeps the player. APEX is a complete-set CPMM with a
              vault, a junior first-loss, and a senior facility. We price tickets, warehouse inventory, and
              halt when the hole is uncovered. €10m in month one is a hold identity, not a hero bet: G = 5%
              on handle, net of carry and LVR.
            </p>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Three seats only: TAKE the quote if model-after-shrink beats it through impact; MAKE if spread
              covers informed flow; PASS or HALT otherwise. Quarter-Kelly, 10% cap, 2% depth. Oracle is the
              close, not the model.
            </p>
          </section>

          <section id="logic" className="grid gap-4">
            <h2 className="text-lg font-medium">Business logic</h2>
            <div className="max-w-full overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-raised text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Identity</th>
                    <th className="px-3 py-2 font-medium">Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {IDENTITIES.map((r) => (
                    <tr key={r.name} className="border-t border-border">
                      <td className="px-3 py-2 font-mono text-xs text-fg">{r.name}</td>
                      <td className="px-3 py-2 font-mono text-xs text-accent">{r.eq}</td>
                      <td className="px-3 py-2 text-muted">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Locked M1: handle {formatEur(m1.handle)}, player starts {Math.round(m1.starts).toLocaleString("en-GB")},
              card starts {m1.events.toFixed(1)}, carry {formatEur(m1.carry)}, LVR {formatEur(m1.lvr)}, net{" "}
              {formatEur(m1.net)}. If starts do not print, net does not print.
            </p>
          </section>

          <section id="maps" className="grid gap-6">
            <h2 className="text-lg font-medium">Dev maps</h2>
            <MermaidBlock title="Capital stack" chart={CHARTS.stack} />
            <MermaidBlock title="Ticket path" chart={CHARTS.ticket} />
            <MermaidBlock title="Seat machine" chart={CHARTS.seat} />
            <MermaidBlock title="Month-1 funnel" chart={CHARTS.funnel} />
            <MermaidBlock title="Desk vs live" chart={CHARTS.dev} />
            <MermaidBlock title="12-month gantt" chart={CHARTS.roadmap} />
          </section>

          <section id="tactics" className="grid gap-3">
            <h2 className="text-lg font-medium">Tactical book</h2>
            <ul className="grid gap-3">
              {TACTICS.map((t) => (
                <li key={t.name} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium">{t.name}</h3>
                    <Badge tone="ok">{t.seat}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">{t.rule}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="budget" className="grid gap-4">
            <h2 className="text-lg font-medium">Budget</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Capital is the facility. Cost of capital is carry. Opex is small next to both. Do not confuse
              a €200k payroll with a €200m draw.
            </p>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <BudgetStat k="Facility" n={formatEur(DEFAULT_INPUT.facility)} />
              <BudgetStat k="Drawn (40%)" n={formatEur(drawn)} />
              <BudgetStat k="M1 carry" n={formatEur(m1.carry)} />
              <BudgetStat k="M1 LVR" n={formatEur(m1.lvr)} />
              <BudgetStat k="Vault" n={formatEur(DEFAULT_INPUT.vault)} />
              <BudgetStat k="Junior" n={formatEur(DEFAULT_INPUT.junior)} />
              <BudgetStat k="Opex M1" n={formatEur(opexM)} />
              <BudgetStat k="Opex Y1" n={formatEur(opexY)} />
            </dl>
            <div className="max-w-full overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-raised text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Opex line</th>
                    <th className="px-3 py-2 font-medium">Month 1</th>
                    <th className="px-3 py-2 font-medium">Year 1</th>
                  </tr>
                </thead>
                <tbody>
                  {OPEX_M1.map((r) => (
                    <tr key={r.line} className="border-t border-border">
                      <td className="px-3 py-2 text-fg">{r.line}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{formatEur(r.month)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{formatEur(r.year)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-border bg-raised">
                    <td className="px-3 py-2 font-medium">Total opex</td>
                    <td className="px-3 py-2 font-mono tabular-nums">{formatEur(opexM)}</td>
                    <td className="px-3 py-2 font-mono tabular-nums">{formatEur(opexY)}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-medium">Gross hold G·H</td>
                    <td className="px-3 py-2 font-mono tabular-nums text-gain">{formatEur(m1.gross)}</td>
                    <td className="px-3 py-2 text-muted">If handle repeats</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-medium">Net after carry+LVR</td>
                    <td className="px-3 py-2 font-mono tabular-nums text-gain">{formatEur(m1.net)}</td>
                    <td className="px-3 py-2 text-muted">Opex still to subtract</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="max-w-2xl text-sm text-muted">
              M1 cash: net {formatEur(m1.net)} − opex {formatEur(opexM)} = {formatEur(m1.net - opexM)}. Still
              clears €10m if starts hit. Miss 20% of starts and you miss the number; opex will not save you.
            </p>
          </section>

          <section id="roadmap" className="grid gap-3">
            <h2 className="text-lg font-medium">Roadmap</h2>
            <ol className="grid gap-3">
              {ROADMAP.map((r) => (
                <li key={r.id} className="rounded-lg border border-border bg-surface p-4">
                  <p className="text-xs uppercase tracking-wide text-subtle">{r.when}</p>
                  <h3 className="mt-1 text-sm font-medium">{r.title}</h3>
                  <ul className="mt-2 grid gap-1">
                    {r.points.map((p) => (
                      <li key={p} className="text-sm text-muted">
                        {p}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          <section id="halts" className="grid gap-3">
            <h2 className="text-lg font-medium">Halt board</h2>
            <ul className="grid gap-2">
              {HALTS.map((h) => (
                <li
                  key={h.code}
                  className="flex items-start gap-2 rounded-md border border-border bg-raised px-3 py-2"
                >
                  <Badge tone="loss" className="mt-0.5 shrink-0">
                    {h.code}
                  </Badge>
                  <span className="text-sm text-muted">{h.text}</span>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}

function BudgetStat({ k, n }: { k: string; n: string }) {
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wide text-subtle">{k}</dt>
      <dd className="mt-1 font-mono text-sm tabular-nums">{n}</dd>
    </div>
  );
}
