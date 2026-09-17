import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EXAMPLE_CHIPS } from "./examples.ts";
import { localExtract } from "./local-extract.ts";

const FROM = new Date("2026-09-16T12:00:00");

function byLabel(id: string) {
  const chip = EXAMPLE_CHIPS.find((c) => c.id === id);
  assert.ok(chip);
  return localExtract(chip.text, FROM);
}

describe("localExtract examples", () => {
  it("party invite: event + rsvp + socks, no greeting", () => {
    const items = byLabel("party");
    assert.ok(items.length >= 2);
    assert.equal(items[0].type, "event");
    assert.match(items[0].title, /maya/i);
    assert.match(items[0].title, /party/i);
    assert.ok(!/hi parents/i.test(items[0].title));
    assert.equal(items[0].time, "15:00");
    assert.match(items[0].location ?? "", /bounce house/i);
    assert.ok(items.some((i) => i.type === "rsvp" && /maya/i.test(i.title)));
    assert.ok(items.some((i) => /socks/i.test(i.title)));
  });

  it("school trip: event + slip deadline + packed lunch", () => {
    const items = byLabel("trip");
    const types = items.map((i) => i.type);
    assert.ok(types.includes("event"));
    assert.ok(types.includes("deadline"));
    assert.ok(types.includes("task"));
    const trip = items.find((i) => i.type === "event");
    assert.match(trip?.title ?? "", /science museum/i);
    assert.equal(trip?.date, "2026-10-03");
    assert.equal(trip?.time, "08:45");
    const slip = items.find((i) => i.type === "deadline");
    assert.match(slip?.title ?? "", /permission slip/i);
    assert.equal(slip?.date, "2026-09-24");
  });

  it("newsletter: conferences stay an event, plus fair/bake/photos", () => {
    const items = byLabel("newsletter");
    assert.ok(items.length >= 3);
    const conf = items.find((i) => /parent-teacher|conference/i.test(i.title));
    assert.equal(conf?.type, "event");
    assert.equal(conf?.date, "2026-09-22");
    assert.ok(items.some((i) => /book fair/i.test(i.title)));
    assert.ok(items.some((i) => /bake sale/i.test(i.title)));
    assert.ok(items.some((i) => /photo/i.test(i.title)));
  });

  it("permission slip: swimming event + return deadline + kit task", () => {
    const items = byLabel("permission");
    const swim = items.find((i) => i.type === "event");
    assert.match(swim?.title ?? "", /swim/i);
    assert.equal(swim?.date, "2026-09-21");
    assert.equal(swim?.time, "13:15");
    assert.match(swim?.location ?? "", /riverside/i);
    assert.ok(items.some((i) => i.type === "deadline"));
    assert.ok(items.some((i) => /swimsuit/i.test(i.title)));
  });

  it("dentist: appointment event + confirm rsvp, greeting stripped", () => {
    const items = byLabel("dentist");
    const appt = items.find((i) => i.type === "event");
    assert.match(appt?.title ?? "", /leo/i);
    assert.match(appt?.title ?? "", /dentist/i);
    assert.ok(!/^hi/i.test(appt?.title ?? ""));
    assert.equal(appt?.date, "2026-09-23");
    assert.equal(appt?.time, "16:20");
    assert.match(appt?.location ?? "", /smile kids/i);
    assert.ok(items.some((i) => i.type === "rsvp"));
  });
});
