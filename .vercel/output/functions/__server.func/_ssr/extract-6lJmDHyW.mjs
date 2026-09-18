import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CyXujKyT.mjs";
import { i as isItemType } from "./plan-BrPv_pMX.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { n as readTrimmedEnv, t as DEFAULT_GROK_MODEL } from "./integrations-BxLxWnwl.mjs";
import { t as localExtract } from "./local-extract-BIP-eJa6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/extract-6lJmDHyW.js
function asString(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length ? trimmed : null;
}
function normalizeDate(value) {
	const s = asString(value);
	if (!s) return null;
	if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
	return null;
}
function normalizeTime(value) {
	const s = asString(value);
	if (!s) return null;
	const m = /^(\d{1,2}):(\d{2})/.exec(s);
	if (!m) return null;
	const h = Number(m[1]);
	const min = Number(m[2]);
	if (h > 23 || min > 59) return null;
	return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
/** Parse a model JSON payload into typed extract items. Never throws. */
function parseExtractedItems(raw) {
	const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
	let parsed;
	try {
		parsed = JSON.parse(cleaned);
	} catch {
		return [];
	}
	if (!Array.isArray(parsed.items)) return [];
	const out = [];
	for (const row of parsed.items) {
		if (!row || typeof row !== "object") continue;
		const rec = row;
		const type = asString(rec.type);
		const title = asString(rec.title);
		if (!type || !title || !isItemType(type)) continue;
		out.push({
			type,
			title: title.slice(0, 140),
			date: normalizeDate(rec.date),
			time: normalizeTime(rec.time),
			location: asString(rec.location)?.slice(0, 160) ?? null,
			notes: asString(rec.notes)?.slice(0, 280) ?? null
		});
		if (out.length >= 12) break;
	}
	return out;
}
var SYSTEM = `You extract structured school-life items from messy parent/school messages (emails, WhatsApp, newsletters, flyers, permission slips, welcome letters, club notes, bus times, supply lists).

Return ONLY JSON of the form: {"items": ExtractedItem[]}

Each ExtractedItem:
- type: "event" | "deadline" | "task" | "rsvp"
- title: short human title, no trailing period
- date: YYYY-MM-DD or null. Resolve relative dates using TODAY (next occurrence).
- time: HH:mm 24-hour or null
- location: string or null
- notes: one-line helpful context or null

Rules:
- Split distinct things into separate items (a trip AND a permission deadline = event + deadline)
- event = a happening (party, trip, conference, photos, club, INSET, meet the teacher, bus run)
- deadline = a due-by date (return slip by Friday, pay by Wednesday, supply list, forms)
- task = an action without a firm calendar event (pack lunch, buy swimsuit, PE kit, uniform)
- rsvp = a reply/confirmation needed (party RSVP, club spot, bus seat)
- Ignore greetings, signatures, and fluff
- Prefer the child's first name in titles when present
- Never invent items that are not in the text
- Max 12 items. If nothing actionable, return {"items": []}`;
async function extractWithChat(text, target) {
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const weekday = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	});
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 12e3);
	try {
		const res = await fetch(target.url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${target.apiKey}`
			},
			signal: controller.signal,
			body: JSON.stringify({
				model: target.model,
				temperature: .2,
				max_tokens: 1400,
				response_format: { type: "json_object" },
				messages: [{
					role: "system",
					content: SYSTEM
				}, {
					role: "user",
					content: `TODAY is ${weekday} (${today}).\n\nMESSAGE:\n${text}`
				}]
			})
		});
		if (!res.ok) return null;
		return parseExtractedItems((await res.json()).choices?.[0]?.message?.content ?? "");
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}
function chatTargets() {
	const targets = [];
	const groqKey = readTrimmedEnv(process.env, "GROQ_API_KEY");
	if (groqKey) targets.push({
		engine: "groq",
		url: "https://api.groq.com/openai/v1/chat/completions",
		apiKey: groqKey,
		model: readTrimmedEnv(process.env, "GROQ_MODEL") ?? "llama-3.3-70b-versatile"
	});
	const xaiKey = readTrimmedEnv(process.env, "XAI_API_KEY");
	if (xaiKey) targets.push({
		engine: "grok",
		url: "https://api.x.ai/v1/chat/completions",
		apiKey: xaiKey,
		model: DEFAULT_GROK_MODEL
	});
	return targets;
}
var extractItems_createServerFn_handler = createServerRpc({
	id: "78f7a18ba111d88ad19628e64f106f8887fc5d87366aa23e066488a3e3b0fd28",
	name: "extractItems",
	filename: "src/lib/server/extract.ts"
}, (opts) => extractItems.__executeServer(opts));
var extractItems = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const text = (input?.text ?? "").trim();
	if (text.length < 8) throw new Error("Paste a bit more text first.");
	if (text.length > 6e3) throw new Error("That's too long — try a shorter excerpt.");
	return { text: text.slice(0, 6e3) };
}).handler(extractItems_createServerFn_handler, async ({ data }) => {
	for (const target of chatTargets()) {
		const items = await extractWithChat(data.text, target);
		if (items?.length) return {
			ok: true,
			items,
			engine: target.engine
		};
	}
	const local = localExtract(data.text);
	if (local.length) return {
		ok: true,
		items: local,
		engine: "local"
	};
	return {
		ok: false,
		error: "Nothing to pull from that message. Try a different excerpt."
	};
});
//#endregion
export { extractItems_createServerFn_handler };
