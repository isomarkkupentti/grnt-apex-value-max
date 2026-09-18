import assert from "node:assert/strict";
import test from "node:test";
import {
  ammLambda,
  buyYes,
  DEFAULT_INPUT,
  expectedValue,
  fractionalKelly,
  kellyFull,
  monthOne,
  seedBook,
  sizeForImpact,
  valueMax,
} from "./engine.ts";

test("seed + lambda match APEX book", () => {
  const b = seedBook(10_000_000, 0.62);
  assert.equal(b.qYes, 3_800_000);
  assert.equal(b.qNo, 6_200_000);
  assert.ok(Math.abs(ammLambda(10_000_000, 0.62) - 7.6e-8) < 1e-12);
});

test("no taker edge sits MAKE", () => {
  const v = valueMax({ ...DEFAULT_INPUT, pModel: 0.52, pMkt: 0.52, mu: 0.3 });
  assert.equal(v.seat, "MAKE");
  assert.ok(v.makerPi > 0);
});

test("soft book with edge is TAKE", () => {
  const v = valueMax({
    ...DEFAULT_INPUT,
    pModel: 0.58,
    pMkt: 0.5,
    shrinkW: 0.4,
    L: 8_000_000,
    clip: 200_000,
    mu: 0.08,
    bankroll: 100_000,
    vault: 8_000_000,
  });
  assert.equal(v.seat, "TAKE");
  assert.ok(v.optClip > 0);
  assert.ok(v.optEv >= 0.02);
});

test("naked L above vault halts", () => {
  const v = valueMax({ ...DEFAULT_INPUT, L: 20_000_000, vault: 1_000_000, junior: 0 });
  assert.equal(v.seat, "HALT");
});

test("Kelly and EV identities", () => {
  const ev = expectedValue(0.55, 2.1);
  assert.ok(Math.abs(ev - 0.155) < 1e-9);
  const full = kellyFull(0.55, 2.1);
  assert.ok(Math.abs(full - 0.140909) < 1e-4);
  const q = fractionalKelly(0.55, 2.1, 0.25, 0.1);
  assert.ok(q <= 0.1);
  assert.ok(Math.abs(q - full * 0.25) < 1e-9);
});

test("impact size moves mid ~2%", () => {
  const b = seedBook(10_000_000, 0.62);
  const d = sizeForImpact(b, 0.02);
  assert.ok(d > 0);
  const f = buyYes(b, d, 0);
  const move = f.after.pYes / 0.62 - 1;
  assert.ok(move > 0.018 && move < 0.022);
});

test("month one nets at least 10m at G=5%", () => {
  const m = monthOne(DEFAULT_INPUT);
  assert.equal(m.G, 0.05);
  assert.ok(m.net + 1 >= 10_000_000);
  assert.ok(m.handle >= 10_000_000 / 0.05);
  assert.ok(m.starts > 0);
  assert.ok(m.events > 0);
  assert.equal(m.days.length, 30);
  assert.ok(m.days[29]!.netCum + 1 >= 10_000_000);
  const unit = DEFAULT_INPUT.deposit * DEFAULT_INPUT.leverage;
  assert.ok(Math.abs(m.starts * unit - m.handle) < 1);
});

