import { copyFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { isMigrationFile } from "./scripts/migration-plan.mjs";

/** The files `src/lib/db.ts` globs — same directory, same non-recursive scope. */
function hasGlobbedMigrations(root: string): boolean {
  try {
    return readdirSync(join(root, "migrations")).some(isMigrationFile);
  } catch {
    return false;
  }
}

const PGLITE_ASSETS = ["pglite.data", "pglite.wasm", "initdb.wasm"] as const;

/** Nitro bundles the PGLite JS but can race / skip the wasm + data files. */
function copyPgliteAssets(root: string): void {
  const destDir = join(root, ".vercel/output/functions/__server.func/_libs");
  const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
  if (!existsSync(destDir) || !existsSync(srcDir)) return;
  for (const file of PGLITE_ASSETS) {
    const src = join(srcDir, file);
    const dest = join(destDir, file);
    if (!existsSync(src) || existsSync(dest)) continue;
    copyFileSync(src, dest);
  }
}

function pgliteAssetsPlugin(): Plugin {
  return {
    name: "scoop:pglite-assets",
    closeBundle() {
      copyPgliteAssets(process.cwd());
    },
    configurePreviewServer() {
      copyPgliteAssets(process.cwd());
    },
  };
}

/**
 * Finish PGLite bootstrap during dev-server setup (before traffic). Vite awaits
 * async `configureServer` hooks. Production: `src/lib/db` kicks `ensureDbReady`
 * on import.
 *
 * Vite awaiting the hook puts this on time-to-first-render, so an app with no
 * migrations — no schema to apply — skips it entirely rather than paying for a
 * PGLite instance it never queries.
 */
function pgliteBootstrapPlugin(): Plugin {
  return {
    name: "scoop:pglite-bootstrap",
    apply: "serve",
    async configureServer(server) {
      if (!hasGlobbedMigrations(server.config.root)) return;
      try {
        const mod = (await server.ssrLoadModule("/src/lib/db.ts")) as {
          ensureDbReady?: () => Promise<void>;
        };
        if (typeof mod.ensureDbReady === "function") {
          await mod.ensureDbReady();
        }
      } catch (err) {
        console.error("[scoop] DB bootstrap failed:", err);
        throw err;
      }
    },
  };
}

export default defineConfig(({ command, isPreview }) => ({
  resolve: { tsconfigPaths: true },
  plugins: [
    pgliteBootstrapPlugin(),
    pgliteAssetsPlugin(),
    tailwindcss(),
    tanstackStart(),
    ...(command === "build" || isPreview ? [nitro({ preset: "vercel" })] : []),
    viteReact(),
  ],
}));
