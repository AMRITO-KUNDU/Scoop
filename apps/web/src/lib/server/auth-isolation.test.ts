import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateClerkKeys } from "../auth/verify.server.ts";

describe("auth isolation and key validation", () => {
  it("rejects missing Clerk publishable or secret keys", () => {
    assert.equal(validateClerkKeys(undefined, undefined).valid, false);
    assert.equal(validateClerkKeys("pk_test_123", undefined).valid, false);
    assert.equal(validateClerkKeys(undefined, "sk_test_123").valid, false);
  });

  it("rejects mismatched key scopes (live vs test)", () => {
    const res = validateClerkKeys("pk_live_123", "sk_test_123");
    assert.equal(res.valid, false);
    assert.match(res.error || "", /scopes do not match/i);
  });

  it("accepts matching test key pairs", () => {
    const res = validateClerkKeys("pk_test_12345", "sk_test_12345");
    assert.equal(res.valid, true);
  });

  it("accepts matching live key pairs", () => {
    const res = validateClerkKeys("pk_live_12345", "sk_live_12345");
    assert.equal(res.valid, true);
  });
});
