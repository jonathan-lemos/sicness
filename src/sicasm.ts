import * as fs from "fs";
import { SicCompiler } from "./SicCompiler/SicCompiler";

const arrToString = (arr: string[]) => arr.reduce((acc: string, s: string) => acc + "\n" + s);

if (process.argv.length !== 3 || process.argv[process.argv.length - 1] === "--help") {
	console.log(`Usage: ${process.argv[0]} ${process.argv[1]} [filename]`);
}

const fname = process.argv[2];
const lines = fs.readFileSync(fname, "utf8").split("\n");
const comp = new SicCompiler(lines);
const lst = comp.makeLst();
const obj = comp.makeObj();

fs.writeFileSync(`${fname}.lst`, arrToString(lst), "utf8");
if (!comp.err) {
	fs.writeFileSync(`${fname}.obj`, arrToString(obj), "utf8");
	console.log(`lst: ${fname}.lst`);
	console.log(`obj: ${fname}.obj`);
}
else {
	console.log("No obj generation due to errors in lst.");
	console.log(`See ${fname}.lst for details.`);
}
