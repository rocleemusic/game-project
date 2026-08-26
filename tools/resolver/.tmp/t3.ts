import { compileInkFiles } from "../src/story.ts";
const main = `VAR _div = false
-> go
=== go ===
~ _div = true
* [ "{_div:dlabel|nlabel}" ] #opt:x {_div:#id:L-div|#id:L-norm}
    resp
- (g) done
-> DONE
`;
const r = compileInkFiles(new Map([["main.ink", main]]));
console.log("E",r.errors,"W",r.warnings);
const s=r.story!;
while(s.canContinue) console.log(JSON.stringify(s.Continue()),JSON.stringify(s.currentTags));
console.log(s.currentChoices.map(c=>[c.text,c.tags]));
s.ChooseChoiceIndex(0);
while(s.canContinue) console.log(JSON.stringify(s.Continue()),JSON.stringify(s.currentTags));
