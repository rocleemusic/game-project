import { compileInkFiles } from "../src/story.ts";
const main = `VAR _div = false
-> go
=== go ===
~ _div = true
- (a) {_div: DIV TEXT #id:d|NORM TEXT #id:n}
* [ {_div: dlabel|nlabel} ] #opt:x
    resp {_div: A|B} #id:r
- (g) done
-> DONE
`;
const r = compileInkFiles(new Map([["main.ink", main]]));
console.log("E",r.errors, "W",r.warnings);
const s = r.story!;
while (s.canContinue) console.log(JSON.stringify(s.Continue()), JSON.stringify(s.currentTags));
console.log(s.currentChoices.map(c=>c.text));
s.ChooseChoiceIndex(0);
while (s.canContinue) console.log(JSON.stringify(s.Continue()), JSON.stringify(s.currentTags));
