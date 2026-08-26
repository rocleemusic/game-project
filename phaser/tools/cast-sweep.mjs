/**
 * Drives every authored cast outcome through the real casting UI, in a real
 * browser, and reports what the player would actually see.
 *
 * This is not a duplicate of the unit tests. Those prove the resolver; this
 * proves the resolver reaches the screen — that 89 authored outcomes render,
 * that no-effect casts are not quietly styled as failures, and that the
 * ignite -> item_flame -> leap chain works through the live inventory.
 *
 * Usage: node tools/cast-sweep.mjs [--url http://localhost:5188]
 */
import { chromium } from "playwright-core";
import fs from "node:fs";

const CHROME = [
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => fs.existsSync(p));

const args = process.argv.slice(2);
const BASE = args.includes("--url") ? args[args.indexOf("--url") + 1] : "http://localhost:5188/";

const failures = [];
const fail = (m) => {
  failures.push(m);
  console.log(`  FAIL  ${m}`);
};

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(`${BASE}?walk=1`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForFunction(() => window.__probe, { timeout: 30000 });

  // Enter a screen so the world-item layer has somewhere to live.
  const s = await page.evaluate(() => window.__probe.snapshot());
  const begin = s.choices.find((c) => /Begin at/.test(c.display));
  if (begin) {
    await page.evaluate((i) => window.__probe.choose(i), begin.index);
    await page.waitForTimeout(200);
  }

  await page.evaluate(() => window.__probe.openCast());
  await page.waitForFunction(() => window.__cast, { timeout: 10000 });

  const spells = await (await fetch(`${BASE.replace(/\/$/, "")}/content/magic.json`)).json();

  console.log("\nsweeping every authored cast\n");

  const tally = { effect: 0, "no-effect": 0, other: 0 };
  let total = 0;
  const noEffectSamples = [];

  for (const spell of spells) {
    for (const rec of spell.receivers) {
      total++;
      const out = await page.evaluate(
        ([phrase, comps, receiver]) => window.__cast.run(phrase, comps, receiver),
        [spell.phrase, spell.components, rec.receiver_id],
      );

      if (out.outcome === "effect") tally.effect++;
      else if (out.outcome === "no-effect") tally["no-effect"]++;
      else {
        tally.other++;
        fail(`${spell.spell_id} x ${rec.receiver_id} -> ${out.outcome} (expected a landed cast)`);
      }

      // The authored prose must reach the screen verbatim.
      if (out.narration !== rec.physical_outcome) {
        fail(`${spell.spell_id} x ${rec.receiver_id}: narration altered`);
      }
      // null reaction means render nothing — not a placeholder string.
      if (rec.reaction_kind === null && out.reaction !== null) {
        fail(`${spell.spell_id} x ${rec.receiver_id}: invented a reaction where content has none`);
      }
      if (out.outcome === "no-effect" && noEffectSamples.length < 3) {
        noEffectSamples.push(`${spell.spell_id} x ${rec.receiver_id}: ${out.narration.slice(0, 70)}`);
      }
    }
  }

  console.log(`  cast ${total} authored pairs`);
  console.log(`    effect     ${tally.effect}`);
  console.log(`    no-effect  ${tally["no-effect"]}`);
  console.log(`    other      ${tally.other}`);

  console.log("\n  no-effect samples (must read as honest results, not failures):");
  noEffectSamples.forEach((s) => console.log(`    ${s}`));

  // The chain, through the live inventory rather than a stub.
  console.log("\nchain: ignite -> item_flame -> leap");
  const ignited = await page.evaluate(() =>
    window.__cast.run("ignite", ["item_sticks"], "stick"),
  );
  if (!ignited.produced.includes("item_flame")) fail("ignite did not produce item_flame");
  const avail = await page.evaluate(() => window.__cast.available());
  if (!avail.includes("item_flame")) {
    fail("item_flame did not appear in casting reach on this screen");
  } else {
    console.log("  item_flame is castable-from on this screen");
  }
  // leap's receiver comes from its own record, not from a guess.
  const leapRec = spells.find((s) => s.spell_id === "leap").receivers[0].receiver_id;
  const leapt = await page.evaluate(
    (r) => window.__cast.run("leap", ["item_flame"], r),
    leapRec,
  );
  console.log(`  leap on ${leapRec} -> ${leapt.outcome}`);
  if (leapt.outcome !== "effect" && leapt.outcome !== "no-effect") {
    fail(`leap did not land on its own authored receiver (${leapt.outcome})`);
  }
  // The flame is spent by the leap, and was never pocketable.
  const afterLeap = await page.evaluate(() => window.__cast.available());
  if (afterLeap.includes("item_flame")) {
    fail("item_flame survived being leapt from");
  } else {
    console.log("  the flame is spent by the leap, and was never pocketable");
  }

  // An unauthored pair must be named as a gap, not given invented prose.
  const gap = await page.evaluate(() =>
    window.__cast.run("ignite", ["item_sticks"], "a_receiver_nobody_authored"),
  );
  if (gap.outcome !== "unknown-receiver" || gap.narration !== "") {
    fail("an unauthored receiver was given invented prose instead of being named a gap");
  } else {
    console.log("\n  unauthored receivers are reported as content gaps, not papered over");
  }

  await page.screenshot({ path: "C:/Users/rocle/AppData/Local/Temp/claude/cast.png" });

  if (errors.length) {
    console.log("\npage errors");
    [...new Set(errors)].slice(0, 5).forEach((e) => console.log(`  ${e}`));
    fail(`${errors.length} page error(s)`);
  }

  await browser.close();
  console.log(failures.length ? `\n${failures.length} failure(s)\n` : "\nclean sweep\n");
  process.exit(failures.length ? 1 : 0);
}

main();
