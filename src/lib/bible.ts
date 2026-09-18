export const CHARTS = {
  stack: `flowchart TB
  Senior["Senior facility EUR 500m"] --> Holdco["GRNT holdco"]
  Junior["Junior first-loss EUR 1.5m"] --> Vault
  Holdco --> Vault["Vault / L"]
  Vault --> CPMM["Complete-set CPMM"]
  LP["LP / maker"] --> CPMM
  Casino["Casino front"] -->|"ticket, not bankroll"| CPMM
  Player["Player"] -->|"bets at casino"| Casino`,

  ticket: `sequenceDiagram
  participant P as Player
  participant C as Casino
  participant Q as Quote
  participant B as CPMM
  participant V as Vault
  P->>C: stake
  C->>Q: p_mkt, clip
  Q->>B: buyYes / buyNo
  B->>Q: p_exec, impact
  Q->>C: p_quote = p_exec x 1+s
  C->>P: ticket
  alt favourite wins
    V-->>B: payout hole
  else underdog wins
    B-->>V: inventory gain
  end`,

  seat: `flowchart TD
  Start[New clip] --> Halt{VAULT HOLE CARRY CAPACITY?}
  Halt -->|yes| H[HALT]
  Halt -->|no| Edge{opt EV >= 2pct and log-growth > 0?}
  Edge -->|yes| T[TAKE quarter-Kelly]
  Edge -->|no| Make{maker pi > 0 and s-star <= 12pct?}
  Make -->|yes| M[MAKE widen to s-star]
  Make -->|no| P[PASS]`,

  funnel: `flowchart LR
  FTD["Player start FTD"] -->|"deposit x leverage"| H["Handle"]
  Card["Card start"] -->|"event line 2pct facility"| H
  H -->|"G = 5pct"| Gross["Gross"]
  Gross --> Carry["Carry 6.5pct drawn + 75bp undrawn"]
  Gross --> LVR["LVR = mu x H x delta"]
  Carry --> Net["Net >= EUR 10m"]
  LVR --> Net`,

  dev: `flowchart TB
  subgraph desk [Desk]
    UI[Inputs / presets]
    Eng[engine.ts]
    UI --> Eng
    Eng --> SeatOut[Seat]
    Eng --> M1[monthOne]
  end
  subgraph live [Live APEX]
    API[Quote API]
    Book[CPMM book]
    Orac[Oracle / close]
    Risk[Halt board]
    API --> Book
    Orac --> API
    Book --> Risk
    Risk --> Vault2[Vault + junior]
  end
  Eng -.->|"same identities"| API
  M1 -.->|"H, starts, G"| Risk`,

  roadmap: `gantt
  title APEX 12-month
  dateFormat YYYY-MM-DD
  axisFormat %b
  section Vault
  Paper CPMM and halt board     :a1, 2026-10-01, 21d
  Vault plus junior live        :a2, after a1, 21d
  section Product
  UFC one book two casinos      :b1, 2026-10-15, 30d
  CLV feed and s-star           :b2, after b1, 30d
  NFL plus 10 brands            :b3, 2026-12-01, 45d
  section Scale
  Handle path to M1 10m         :c1, 2026-11-01, 60d
  Util 72pct of facility        :c2, 2027-02-01, 90d
  Audit pack and lender report  :c3, 2027-04-01, 60d`,
} as const;

export const OPEX_M1 = [
  { line: "AMM / quant (2)", month: 28_000, year: 336_000 },
  { line: "Engineering (4)", month: 48_000, year: 576_000 },
  { line: "Risk / halt (1)", month: 12_000, year: 144_000 },
  { line: "Compliance (2)", month: 22_000, year: 264_000 },
  { line: "Oracle / feeds", month: 15_000, year: 180_000 },
  { line: "Infra / custody", month: 8_000, year: 96_000 },
  { line: "Operator BD (2)", month: 20_000, year: 240_000 },
  { line: "Insurance / D&O", month: 25_000, year: 180_000 },
  { line: "Legal / audit", month: 18_000, year: 220_000 },
  { line: "Contingency", month: 30_000, year: 200_000 },
] as const;

export const ROADMAP = [
  {
    id: "d30",
    when: "Day 0–30",
    title: "Paper that can halt",
    points: [
      "Ship CPMM, vault, junior, halt codes. No live leverage until VAULT and HOLE are green.",
      "One sport: UFC mains. Two casinos, one netted book.",
      "Oracle = close of the two biggest books, not a model hero.",
      "Desk Value Max is the gate: HALT means no seed.",
    ],
  },
  {
    id: "d90",
    when: "Day 31–90",
    title: "CLV and inventory",
    points: [
      "Wire close feed. Track CLV on every fill. Kill any lane with 30-day CLV < 0.",
      "s* live: widen when μ or |skew| rises. Do not advertise a 2% spread you cannot keep.",
      "Event line hard-cap at 2% of facility. Clip ≤ 2% depth.",
      "Add NFL sides only after UFC halt board is boring.",
    ],
  },
  {
    id: "q2",
    when: "Q2",
    title: "Ten brands, one book",
    points: [
      "Route 10 casinos into APEX. Players never leave the casino.",
      "Handle path: 24k starts/day is a load test, not a slogan. Miss starts → miss €10m.",
      "Carry coverage from LP skim ≥ 1.3× after first-loss. Else HALT new L.",
    ],
  },
  {
    id: "h2",
    when: "H2",
    title: "Facility at 72% util",
    points: [
      "Peak one-sided week must still sit inside impact budget.",
      "Lender pack: coverage, util, hole, CLV, halt log.",
      "Do not raise G. 5% is the hold. Volume is the job.",
    ],
  },
] as const;

export const TACTICS = [
  {
    name: "UFC main",
    seat: "TAKE if p_use beats quote after impact; else MAKE",
    rule: "Shrink ω=0.4 to close. Quarter-Kelly, 10% cap, 2% depth cap. Favourite-win hole must be covered by vault leftover + junior.",
  },
  {
    name: "NFL side",
    seat: "MAKE unless CLV ≥ 2%",
    rule: "Vig already in the number. μ lower than UFC. Do not walk a 400k clip through a thin L.",
  },
  {
    name: "Soft book",
    seat: "TAKE",
    rule: "p_mkt 0.50 vs model 0.58 is the textbook +EV. Still size by Kelly, not by ego.",
  },
  {
    name: "No edge",
    seat: "MAKE",
    rule: "Earn s − LVR. If μ spikes, s* jumps; if s* > 12%, PASS.",
  },
  {
    name: "Month-1 book",
    seat: "MAKE the pool; TAKE only +EV residuals",
    rule: "€10m is hold on handle, not a hero bet. Starts × €200 × 3.5× must actually print.",
  },
] as const;

export const HALTS = [
  { code: "VAULT", text: "L above vault. Naked depth. Do not seed." },
  { code: "HOLE", text: "Favourite-win payout > vault leftover + junior." },
  { code: "CARRY", text: "LP skim / (rate×drawn + commitment×undrawn) < 1." },
  { code: "CAPACITY", text: "Peak one-sided flow needs more than the facility." },
  { code: "IMPACT", text: "Clip > 2% depth. Cut size." },
  { code: "LINE", text: "Clip > event line (2% of facility)." },
  { code: "SKEW", text: "One side heavy. Widen or halt new leverage." },
] as const;

export const IDENTITIES = [
  { name: "p_use", eq: "ω · p_model + (1−ω) · p_mkt", note: "ω = 0.4. Model is not the close." },
  { name: "EV", eq: "p_use · d − 1", note: "d = 1 / p_quote. Floor 2%." },
  { name: "Kelly", eq: "f* = (b p − q) / b ; f = min(0.25 f*, 0.10)", note: "Then cap by 2% depth." },
  { name: "CLV", eq: "d0 / d_close − 1", note: "If this is not > 0 over a month, the edge is fake." },
  { name: "λ", eq: "2 (1−p) / L", note: "Impact per euro. Size for 2%." },
  { name: "s*", eq: "(μ/(1−μ)) Δ + κ |skew|", note: "Inventory + informed flow." },
  { name: "LVR", eq: "μ · flow · |p* − p|", note: "Maker tax. Spread must cover it." },
  { name: "G", eq: "π_gross = G · H", note: "G = 5% hold. Not Kelly G." },
  { name: "Net", eq: "G·H − carry − LVR ≥ 10m", note: "Solver lifts H until this holds." },
  { name: "Starts", eq: "H / (deposit · leverage)", note: "€200 × 3.5× = €700 handle per FTD." },
] as const;
