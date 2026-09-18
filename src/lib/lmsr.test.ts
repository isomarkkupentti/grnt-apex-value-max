import assert from "node:assert/strict";
import test from "node:test";
import { lmsrCost, lmsrPrices, protocolFees, quoteTrade, resizeB } from "./lmsr.ts";

test("LMSR prices sum to 1 and cost is overflow-safe", () => {
  const p = { b: 1500, qA: 800, qB: 200, capital: 1_000_000 };
  const { pA, pB } = lmsrPrices(p);
  assert.ok(Math.abs(pA + pB - 1) < 1e-12);
  assert.ok(pA > pB);
  const c = lmsrCost(p.qA, p.qB, p.b);
  assert.ok(Number.isFinite(c) && c > 0);
});

test("buy moves price the same way and never suspends", () => {
  const p = { b: 1500, qA: 0, qB: 0, capital: 1_000_000 };
  const q = quoteTrade(p, "A", 100, 10);
  assert.equal(q.notional, 1000);
  assert.ok(q.pAfter > q.entry);
  assert.ok(q.liq < q.entry);
  assert.ok(q.shares > 0);
});

test("70/30 treasury split", () => {
  const f = protocolFees({
    volume: 1_000_000,
    tradeFee: 0.003,
    notional: 2_000_000,
    longShare: 0.8,
    fundCut: 0.15,
    liqNotional: 50_000,
    liqPen: 0.02,
  });
  assert.ok(Math.abs(f.lp + f.grnt - f.net) < 1e-9);
  assert.ok(Math.abs(f.grnt / f.net - 0.3) < 1e-9);
});

test("resizeB stays positive — tape stays open", () => {
  const b = resizeB(1_000_000, 0.55, 0.7);
  assert.ok(b >= 100);
});
