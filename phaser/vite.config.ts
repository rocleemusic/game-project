import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * The prototype imports Lantern's ink engine rather than forking it — see the
 * plan's "core architectural decision". `LanternPlayer` (tools/lantern/src/lib/
 * play.ts) already binds the four EXTERNALs, owns the satchel/arms/pack-triage
 * model and reads ink's own clock. A copy here would drift from the tested
 * original and quietly turn this probe into a third build track.
 *
 * The alias points at lantern's `src` (not `src/lib`) so play.ts's own
 * `../types` import resolves without rewriting it.
 */
const LANTERN_SRC = path.resolve(root, "../tools/lantern/src");

/** The resolver's run folder. Backdrops are served from here, never copied. */
const RUN_IMAGES = path.resolve(root, "../lantern-projects/v01/images");

export default defineConfig({
  // Itch.io serves an HTML5 build from a CDN subpath, not the site root, so
  // every asset reference — this file's injected <script>/<link> tags, and
  // every hardcoded fetch/load path in src/ — must resolve relative to
  // index.html rather than to "/". Relative here; absolute paths fixed
  // alongside it (see PreloadScene.ts and loadRun.ts).
  base: "./",
  resolve: {
    alias: { "@lantern": LANTERN_SRC },
  },
  server: {
    fs: {
      // Reading outside this package's root is deliberate: the ink engine lives
      // in tools/lantern and is aliased above.
      allow: [root, LANTERN_SRC, RUN_IMAGES],
    },
  },
  // Serving the run's images in place means the probe can never drift from the
  // run folder — a copied backdrop set would silently go stale after a reroll.
  publicDir: "public",
  plugins: [
    {
      name: "run-images",
      configureServer(server) {
        server.middlewares.use("/run-images", (req, res, next) => {
          const name = decodeURIComponent((req.url ?? "").replace(/^\//, "").split("?")[0]);
          // Contain the route to the images folder — no traversal.
          const file = path.resolve(RUN_IMAGES, name);
          if (!file.startsWith(RUN_IMAGES) || !fs.existsSync(file)) return next();
          // Roc, 2026-08-22: the manifest's first .png backdrops (T9, T1, T2,
          // T3, HOME, T4, TN) exposed this route always answering .jpg for
          // anything it didn't recognize — every one served as image/jpeg.
          const ext = path.extname(file).toLowerCase();
          const type =
            ext === ".webp" ? "image/webp"
            : ext === ".avif" ? "image/avif"
            : ext === ".png" ? "image/png"
            : "image/jpeg";
          res.setHeader("Content-Type", type);
          fs.createReadStream(file).pipe(res);
        });
      },
    },
  ],
});
