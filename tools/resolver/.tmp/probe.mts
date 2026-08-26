import { join } from "node:path";
import { loadData, PACKAGE_ROOT } from "../src/data.ts";
import { loadTuning } from "../src/tuning.ts";
import { buildGraph } from "../src/graph.ts";
import { resolveWeek, seedThreadsFromContent } from "../src/week.ts";
const DATA_DIR = join(PACKAGE_ROOT, "data");
const data = loadData(DATA_DIR, []);
const tuning = loadTuning(DATA_DIR, []);
const graph = buildGraph(data, tuning);
const days = resolveWeek(data, { slot:1, life:1, picked_location:"town", threads:[], lead_pool:["LEAD-01","LEAD-02","LEAD-03"], aliveness_band:"quiet" } as any, tuning, { seedThreads: seedThreadsFromContent(data) });
const byId = new Map<string,any>(graph.scenes.map((s:any)=>[s.scene_id,s]));
function sceneEntryDay(s:any){ if(!s.choice_nodes.length) return 1;
  return Math.max(...s.choice_nodes.map((n:any)=>{let f=1;for(const c of n.availability_conditions??[]){const m=/^day\s*(>=|==|=|>)\s*(\d+)$/.exec(c.trim());if(m)f=Math.max(f,m[1]===">"?+m[2]+1:+m[2]);}return f;}));}
const memo=new Map<string,number>();
function gf(id:string):number{ if(memo.has(id))return memo.get(id)!; memo.set(id,1); const s=byId.get(id); if(!s)return 1;
  let floor=1; for(const c of s.entry_gate??[]){ const m=/^played\(([^)]+)\)$/.exec(c.trim()); if(m){const p=byId.get(m[1].trim()); if(p) floor=Math.max(floor, Math.max(sceneEntryDay(p), gf(m[1].trim())));}}
  memo.set(id,floor); return floor;}
for(const id of ["SC-T2-08","SC-T2-09","SC-T2-10","SC-T2-11","SC-T2-15","SC-T2-16","SC-T2-17","SC-T2-18","SC-T2-20","SC-T2-21","SC-F1-03","SC-T2-22","SC-T2-23"])
  console.log(id, "gateFloor=", gf(id), "entryDay=", sceneEntryDay(byId.get(id)));
console.log("\n-- presence toby/mara --");
for(const d of days) for(const f of d.slot_fill) if(f.soul==="toby"||f.soul==="mara") console.log(`  d${d.day} ${f.time_block} ${f.soul} ${f.screen_id}`);
