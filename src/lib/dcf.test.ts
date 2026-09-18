import assert from "node:assert/strict";
import test from "node:test";
import { BASE_G, BASE_SHARE, BASE_WACC, terminalValue, valueJv } from "./dcf.ts";

test("base DCF matches the 30% GRNT pack", () => {
  const v = valueJv({ wacc: BASE_WACC, g: BASE_G, share: BASE_SHARE, haircut: 0 });
  const pvs = v.rows.map((r) => r.pv);
  assert.ok(Math.abs(pvs[0]! - 11.02) < 0.02);
  assert.ok(Math.abs(pvs[1]! - 36.63) < 0.02);
  assert.ok(Math.abs(pvs[2]! - 81.8) < 0.02);
  assert.ok(Math.abs(pvs[3]! - 143.84) < 0.03);
  assert.ok(Math.abs(pvs[4]! - 208.06) < 0.03);
  assert.ok(Math.abs(v.pvOps - 481.35) < 0.05);
  assert.ok(Math.abs(v.tv - 3397.66) < 0.1);
  assert.ok(Math.abs(v.pvTv - 1485.15) < 0.2);
  assert.ok(Math.abs(v.evGrnt - 1966.5) < 0.3);
  assert.ok(Math.abs(v.evJv - 6555) < 2);
  assert.ok(Math.abs(v.evSalesY5 - 2.81) < 0.02);
});

test("Gordon TV identity", () => {
  const tv = terminalValue(476, 0.035, 0.18);
  assert.ok(Math.abs(tv - 3397.66) < 0.02);
});

test("haircut 50% halves EV", () => {
  const full = valueJv({ wacc: 0.18, g: 0.035, share: 0.3, haircut: 0 });
  const half = valueJv({ wacc: 0.18, g: 0.035, share: 0.3, haircut: 0.5 });
  assert.ok(Math.abs(half.evGrnt / full.evGrnt - 0.5) < 0.001);
});
