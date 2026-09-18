import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { googleCalendarUrl, toIcs } from "./calendar.ts";

const trip = {
  type: "event" as const,
  title: "Science Museum trip",
  date: "2026-09-25",
  time: "09:15",
  location: "Science Museum, London",
  notes: "Packed lunch. No nuts.",
};

describe("googleCalendarUrl", () => {
  it("returns null without a date", () => {
    assert.equal(googleCalendarUrl({ ...trip, date: null }), null);
  });

  it("builds a timed Google Calendar template", () => {
    const url = googleCalendarUrl(trip);
    assert.ok(url);
    const parsed = new URL(url);
    assert.equal(parsed.origin, "https://calendar.google.com");
    assert.equal(parsed.searchParams.get("action"), "TEMPLATE");
    assert.equal(parsed.searchParams.get("text"), "Science Museum trip");
    assert.equal(parsed.searchParams.get("dates"), "20260925T091500/20260925T101500");
    assert.equal(parsed.searchParams.get("location"), "Science Museum, London");
  });

  it("uses all-day range when there is no time", () => {
    const url = googleCalendarUrl({ ...trip, time: null });
    assert.ok(url);
    assert.equal(new URL(url).searchParams.get("dates"), "20260925/20260926");
  });
});

describe("toIcs", () => {
  it("returns null without a date", () => {
    assert.equal(toIcs({ ...trip, date: null }), null);
  });

  it("emits a timed VEVENT", () => {
    const ics = toIcs(trip, new Date("2026-09-18T12:00:00.000Z"));
    assert.ok(ics);
    assert.match(ics, /BEGIN:VCALENDAR/);
    assert.match(ics, /DTSTART:20260925T091500/);
    assert.match(ics, /DTEND:20260925T101500/);
    assert.match(ics, /SUMMARY:Science Museum trip/);
    assert.match(ics, /LOCATION:Science Museum\\, London/);
  });
});
