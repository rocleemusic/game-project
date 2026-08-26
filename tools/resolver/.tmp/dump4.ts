import {loadData} from '../src/data.ts';
import {buildGraph} from '../src/graph.ts';
import {emitInk} from '../src/ink.ts';
const d=loadData();
console.log(JSON.stringify(d.sceneGraph.scenes,null,1).slice(0,3000));
console.log('===INK===');
console.log(emitInk(buildGraph(d)).get('souls/toby.ink'));
