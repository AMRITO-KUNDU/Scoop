import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EXAMPLE_CHIPS, LANDING_CHIPS } from "./examples.ts";
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

  it("welcome letter: meet the teacher, INSET, form, uniform", () => {
    const items = byLabel("welcome");
    assert.ok(items.length >= 3);
    const meet = items.find((i) => /meet the teacher/i.test(i.title));
    assert.equal(meet?.type, "event");
    assert.equal(meet?.date, "2026-09-24");
    assert.equal(meet?.time, "15:30");
    assert.match(meet?.location ?? "", /year 3 classroom/i);
    const inset = items.find((i) => /inset/i.test(i.title));
    assert.equal(inset?.type, "event");
    assert.equal(inset?.date, "2026-09-26");
    assert.ok(items.some((i) => i.type === "deadline" && /data collection/i.test(i.title)));
    assert.ok(items.some((i) => /uniform/i.test(i.title)));
  });

  it("after-school club: event + rsvp + bottle + pay", () => {
    const items = byLabel("club");
    const club = items.find((i) => i.type === "event");
    assert.match(club?.title ?? "", /coding club/i);
    assert.equal(club?.date, "2026-09-25");
    assert.equal(club?.time, "15:20");
    assert.match(club?.location ?? "", /ict suite/i);
    assert.ok(items.some((i) => i.type === "rsvp"));
    assert.ok(items.some((i) => /water bottle/i.test(i.title)));
    assert.ok(items.some((i) => /parentpay|£4/i.test(i.title)));
  });

  it("bus times: pickup event + seat rsvp", () => {
    const items = byLabel("bus");
    const bus = items.find((i) => i.type === "event");
    assert.match(bus?.title ?? "", /bus|route 7/i);
    assert.equal(bus?.date, "2026-09-22");
    assert.equal(bus?.time, "08:10");
    assert.match(bus?.location ?? "", /oak street/i);
    assert.ok(items.some((i) => i.type === "rsvp" && /seat|bus/i.test(i.title)));
  });

  it("supply list: deadline, kit tasks, welcome evening", () => {
    const items = byLabel("supplies");
    assert.ok(items.some((i) => i.type === "deadline" && /supply/i.test(i.title)));
    assert.ok(items.some((i) => /pe kit/i.test(i.title)));
    assert.ok(items.some((i) => /wellies/i.test(i.title)));
    const evening = items.find((i) => /welcome evening/i.test(i.title));
    assert.equal(evening?.type, "event");
    assert.equal(evening?.date, "2026-09-23");
    assert.equal(evening?.time, "17:00");
    assert.match(evening?.location ?? "", /hall/i);
  });

  it("landing demo chips are the back-to-school set", () => {
    assert.deepEqual(
      LANDING_CHIPS.map((c) => c.id),
      ["welcome", "club", "bus", "supplies"],
    );
  });
});
