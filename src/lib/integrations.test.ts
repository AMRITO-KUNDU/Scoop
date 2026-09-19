import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_GROK_MODEL,
  DEFAULT_GROQ_MODEL,
  resolveIntegrations,
} from "./integrations.ts";

describe("resolveIntegrations", () => {
  it("treats empty env as local preview with Google live", () => {
    const status = resolveIntegrations({});
    assert.equal(status.google.wired, true);
    assert.equal(status.googleCloud.wired, false);
    assert.equal(status.clerk.wired, false);
    assert.equal(status.neon.wired, false);
    assert.equal(status.groq.wired, false);
    assert.equal(status.grok.wired, false);
    assert.equal(status.groq.model, DEFAULT_GROQ_MODEL);
    assert.equal(status.grok.model, DEFAULT_GROK_MODEL);
  });

  it("wires neon, groq, grok, clerk, and googleCloud from trimmed env", () => {
    const status = resolveIntegrations({
      DATABASE_URL: "  postgres://neon  ",
      GROQ_API_KEY: "gsk_test",
      GROQ_MODEL: "llama-3.1-8b-instant",
      XAI_API_KEY: " xai-test ",
      GOOGLE_CLIENT_ID: "google_id.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "google_secret",
      VITE_CLERK_PUBLISHABLE_KEY: "pk_test_123",
      CLERK_SECRET_KEY: "sk_test_456",
    });
    assert.equal(status.neon.wired, true);
    assert.equal(status.groq.wired, true);
    assert.equal(status.groq.model, "llama-3.1-8b-instant");
    assert.equal(status.grok.wired, true);
    assert.equal(status.googleCloud.wired, true);
    assert.equal(status.clerk.wired, true);
  });

  it("ignores whitespace-only secrets", () => {
    const status = resolveIntegrations({
      DATABASE_URL: "   ",
      GROQ_API_KEY: "",
      XAI_API_KEY: "  ",
      GOOGLE_CLIENT_ID: "  ",
      CLERK_SECRET_KEY: " ",
    });
    assert.equal(status.neon.wired, false);
    assert.equal(status.groq.wired, false);
    assert.equal(status.grok.wired, false);
    assert.equal(status.googleCloud.wired, false);
    assert.equal(status.clerk.wired, false);
  });
});
