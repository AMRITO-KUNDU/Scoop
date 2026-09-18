import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseExtractedItems } from "./extract-parse.ts";

describe("parseExtractedItems", () => {
  it("reads a groq-style json object", () => {
    const items = parseExtractedItems(
      JSON.stringify({
        items: [
          {
            type: "event",
            title: "Science Museum trip",
            date: "2026-10-03",
            time: "8:45",
            location: "coach bay",
            notes: "Year 4",
          },
          {
            type: "nope",
            title: "ignored",
          },
        ],
      }),
    );
    assert.equal(items.length, 1);
    assert.equal(items[0].type, "event");
    assert.equal(items[0].time, "08:45");
    assert.equal(items[0].date, "2026-10-03");
  });

  it("strips fences and ignores junk", () => {
    const items = parseExtractedItems(
      '```json\n{"items":[{"type":"task","title":"Pack lunch"}]}\n```',
    );
    assert.equal(items.length, 1);
    assert.equal(items[0].title, "Pack lunch");
  });

  it("returns [] on invalid json", () => {
    assert.deepEqual(parseExtractedItems("not json"), []);
  });
});
