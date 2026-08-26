import {loadData} from '../src/data.ts';
import {buildGraph} from '../src/graph.ts';
const g=buildGraph(loadData());
console.log(g.scenes.map(s=>s.scene_id).join(' '));
