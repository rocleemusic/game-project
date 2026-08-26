import { compileInkFiles } from "../src/story.ts";
const main = `VAR _div = false
-> go
=== go ===
~ _div = true
- (a) { true: {_div: DIV #id:d|NORM #id:n} }
* [ "{_div: dlabel|nlabel}" ] #opt:x #id:{_div: L-div|L-norm}
    resp
- (g) done
~ _div = false
-> DONE
`;
const r = compileInkFiles(new Map([["main.ink", main]]));
console.log("E",r.errors, "W",r.warnings);
const s = r.story!;
while (s.canContinue) console.log(JSON.stringify(s.Continue()), JSON.stringify(s.currentTags));
console.log(s.currentChoices.map(c=>[c.text, c.tags]));
s.ChooseChoiceIndex(0);
while (s.canContinue) console.log(JSON.stringify(s.Continue()), JSON.stringify(s.currentTags));
