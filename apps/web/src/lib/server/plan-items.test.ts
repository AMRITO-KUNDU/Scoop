import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isDuplicateItem,
  isValidCalendarDate,
  isValidTimeStr,
  stringsSimilar,
} from "./plan-items.ts";
import type { ExtractedItem } from "../plan.ts";

describe("plan-items validation and duplicate handling", () => {
  it("rejects impossible calendar dates", () => {
    assert.equal(isValidCalendarDate("2026-02-31"), false);
    assert.equal(isValidCalendarDate("2026-04-31"), false);
    assert.equal(isValidCalendarDate("2026-13-01"), false);
    assert.equal(isValidCalendarDate("invalid-date"), false);
    assert.equal(isValidCalendarDate("2026-02-28"), true);
    assert.equal(isValidCalendarDate("2024-02-29"), true); // leap year
    assert.equal(isValidCalendarDate("2025-02-29"), false); // non-leap year
  });

  it("validates 24-hour time strings strictly", () => {
    assert.equal(isValidTimeStr("09:15"), true);
    assert.equal(isValidTimeStr("23:59"), true);
    assert.equal(isValidTimeStr("24:00"), false);
    assert.equal(isValidTimeStr("12:60"), false);
    assert.equal(isValidTimeStr("9:15"), false);
  });

  it("does NOT consider two null or empty notes as similar or duplicate", () => {
    assert.equal(stringsSimilar(null, null), false);
    assert.equal(stringsSimilar("", ""), false);
    assert.equal(stringsSimilar("   ", null), false);
  });

  it("does not mark different tasks on the same date/time/location as duplicates when notes are null", () => {
    const item1: ExtractedItem = {
      type: "task",
      title: "Math Homework",
      date: "2026-10-15",
      time: "10:00",
      location: "Room 4",
      notes: null,
    };
    const item2: ExtractedItem = {
      type: "task",
      title: "Science Project",
      date: "2026-10-15",
      time: "10:00",
      location: "Room 4",
      notes: null,
    };

    assert.equal(isDuplicateItem(item1, item2), false);
  });

  it("identifies true duplicates based on title similarity and matching metadata", () => {
    const item1: ExtractedItem = {
      type: "task",
      title: "Complete Math Homework Page 42",
      date: "2026-10-15",
      time: "10:00",
      location: "Room 4",
      notes: "Bring pencil",
    };
    const item2: ExtractedItem = {
      type: "task",
      title: "Complete Math Homework Page 42!",
      date: "2026-10-15",
      time: "10:00",
      location: "Room 4",
      notes: null,
    };

    assert.equal(isDuplicateItem(item1, item2), true);
  });
});
