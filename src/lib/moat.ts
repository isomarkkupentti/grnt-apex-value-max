export const COMPARE = [
  { k: "Leverage", trad: "1x", poly: "1x", grnt: "2x–20x" },
  { k: "Live tape", trad: "Suspended", poly: "Not live", grnt: "Open. LMSR b moves." },
  { k: "Winners", trad: "Limit / ban", poly: "No limit", grnt: "LP model. No ban." },
  { k: "Capital", trad: "House book", poly: "Order book", grnt: "Yield pool" },
  { k: "Price", trad: "Manual / slow", poly: "Spread", grnt: "XGB + LMSR" },
] as const;

export const REVENUE = `flowchart TB
  Engine["GRNT revenue"]
  Engine --> Fees["Trade fee 0.1-0.5pct"]
  Engine --> Fund["Funding cut 10-20pct"]
  Engine --> Liq["Liquidation 1-3pct"]
  Fees --> Net["Net to treasury"]
  Fund --> Net
  Liq --> Net
  Net --> LP["70pct LP yield"]
  Net --> GRNT["30pct GRNT"]`;

export const ECO = `flowchart LR
  subgraph data [Data]
    UFC[UFCStats Phase I]
    Tap[Tapology Phase I]
    SR[Sportradar Phase IV]
  end
  subgraph b2b [B2B]
    Cur[Curacao crypto]
    MGA[MGA tier-2]
    Soft[SoftSwiss widget]
  end
  subgraph lp [Liquidity]
    HN[HNW LPs]
    YF[Yield funds]
    CS[Community stake]
  end
  UFC --> Core[LMSR core]
  Tap --> Core
  SR --> Core
  Core --> Cur
  Core --> MGA
  Core --> Soft
  HN --> Vault[Vault]
  YF --> Vault
  CS --> Vault
  Vault --> Core`;

export const FUND = `gantt
  title Raise
  dateFormat YYYY-MM-DD
  axisFormat %b
  section Pre-seed
  250k at 2.5m post     :a1, 2026-10-01, 90d
  section Seed
  1.5m at 10m post      :a2, 2027-04-01, 60d
  section Phase III
  1.0m LP vault         :a3, 2027-04-01, 90d`;

export const PHASES = `flowchart LR
  P1["I FastAPI math"] --> P2["II Quant tipster"]
  P2 --> P3["III 1m LP vault"]
  P3 --> P4["IV Redis Kafka C++"]`;

export const SPRINTS = [
  { id: "s1", when: "W1–2", title: "Lake", text: "Fights, fighters, results. Licensed or public dumps — not a ban-evading scrape." },
  { id: "s2", when: "W3–4", title: "Model", text: "Four diffs: cardio, mileage, control, age. XGB + isotonic. Brier vs Pinnacle open is the test." },
  { id: "s3", when: "W5–6", title: "LMSR API", text: "quote / execute. b from quarter-Kelly. Tape stays open; vault can still HALT." },
  { id: "s4", when: "W7–8", title: "Tipster", text: "Public EV tape + affiliate. Audit PnL before anyone seeds the vault." },
  { id: "s5", when: "M6–8", title: "Vault", text: "€1m first-loss + Redis positions. Yield from fees, not from fading winners." },
  { id: "s6", when: "M9–12", title: "B2B", text: "Widget into Curacao/MGA. Same LMSR identities. Kafka audit." },
] as const;
