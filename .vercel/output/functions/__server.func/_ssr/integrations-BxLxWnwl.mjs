//#region node_modules/.nitro/vite/services/ssr/assets/integrations-BxLxWnwl.js
var DEFAULT_GROK_MODEL = "grok-4.5";
function readTrimmedEnv(source, key) {
	const value = source[key]?.trim();
	return value ? value : void 0;
}
function resolveIntegrations(source) {
	const databaseUrl = readTrimmedEnv(source, "DATABASE_URL");
	const groqKey = readTrimmedEnv(source, "GROQ_API_KEY");
	const groqModel = readTrimmedEnv(source, "GROQ_MODEL") ?? "llama-3.3-70b-versatile";
	const xaiKey = readTrimmedEnv(source, "XAI_API_KEY");
	return {
		google: {
			id: "google",
			label: "Google sign-in",
			envVar: null,
			wired: true,
			detail: "Real Google + X + email login. No Clerk, no Cloud Console."
		},
		neon: {
			id: "neon",
			label: "Neon Postgres",
			envVar: "DATABASE_URL",
			wired: Boolean(databaseUrl),
			detail: databaseUrl ? "Connected to Neon. Plans persist across devices." : "Local preview database. Publish to get Neon automatically."
		},
		groq: {
			id: "groq",
			label: "Groq extract",
			envVar: "GROQ_API_KEY",
			extraEnvVar: "GROQ_MODEL",
			wired: Boolean(groqKey),
			model: groqModel,
			detail: groqKey ? `Live on ${groqModel}.` : "Waiting for GROQ_API_KEY. On-device parser until then."
		},
		grok: {
			id: "grok",
			label: "Grok backup",
			envVar: "XAI_API_KEY",
			wired: Boolean(xaiKey),
			model: DEFAULT_GROK_MODEL,
			detail: xaiKey ? `Live on ${DEFAULT_GROK_MODEL} if Groq is down.` : "Optional backup. Used automatically when the key is present."
		}
	};
}
//#endregion
export { readTrimmedEnv as n, resolveIntegrations as r, DEFAULT_GROK_MODEL as t };
