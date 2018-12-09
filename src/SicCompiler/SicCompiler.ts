/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { ISicInstruction } from "./ISicInstruction";
import { SicCsectTab } from "./SicCsect";
import { SicFormat1 } from "./SicFormat1";
import { SicFormat2 } from "./SicFormat2";
import { SicFormat3 } from "./SicFormat3";
import { SicFormat4 } from "./SicFormat4";
import { SicFormatLegacy } from "./SicFormatLegacy";
import { SicLstEntry } from "./SicLstEntry";
import { SicSpace } from "./SicSpace";
import { SicSplit } from "./SicSplit";

/**
 * Class that compiles raw source code into LST and OBJ formats.
 */
export class SicCompiler {
	/**
	 * A hashtable containing csects (compiler contexts)
	 * The default is "".
	 */
	private ctab: SicCsectTab;

	/** True if an error was found during compilation. */
	private errflag: boolean;

	/**
	 * Constructs a SicCompiler and compiles the code.
	 * @constructor
	 * @param lines The lines of code to compile.
	 */
	constructor(lines: string[]) {
		this.ctab = new SicCsectTab();
		this.errflag = false;

		// pass 1
		lines.forEach(val => {
			try {
				// if the line without any comments/whitespace is a blank string
				if (val.replace(/\..*$/, "").trim() === "") {
					// continue
					return;
				}

				const split = new SicSplit(val);
				let instr: ISicInstruction;

				// replace * with current loc
				split.args.replace(/(#|@|=)\*$/, "$1" + this.ctab.current.useTab.rloc.toString(10));
				// replace strings in equTab
				for (const key of Object.keys(this.ctab.current.equTab)) {
					if (split.args.match(key) === null) {
						continue;
					}
					// keep replacing EQU like the prototype chain
					for (let s: string | undefined = this.ctab.current.equTab[key];
						s !== undefined;
						s = this.ctab.current.equTab[s]) {
						split.args = split.args.replace(key, this.ctab.current.equTab[key]);
					}
					break;
				}

				// if this line has a label, add it to the label tab
				if (split.tag !== "") {
					if (this.ctab.current.tagTab[split.tag] !== undefined) {
						throw new Error("Duplicate label " + split.tag);
					}
					this.ctab.current.tagTab[split.tag] = this.ctab.current.useTab.rloc;
				}

				// if this line is a directive, process the directive and continue.
				if (this.ctab.isDirective(split.op)) {
					this.ctab.directives[split.op](val, split);
					return;
				}

				// create the line of code

				if (SicFormat1.isFormat1(split.op)) {
					instr = new SicFormat1(split);
				}
				else if (SicFormat2.isFormat2(split.op)) {
					instr = new SicFormat2(split);
				}
				else if (SicFormat3.isFormat3(split.op)) {
					instr = new SicFormat3(split, this.ctab.current);
				}
				else if (SicFormat4.isFormat4(split.op)) {
					instr = new SicFormat4(split, this.ctab.current);
				}
				else if (SicFormatLegacy.isFormatLegacy(split.op)) {
					instr = new SicFormatLegacy(split, this.ctab.current);
				}
				else if (SicSpace.isSpace(split.op)) {
					instr = new SicSpace(split);
				}
				else {
					throw new Error(split.op + " is not a valid mnemonic.");
				}

				// add the instruction to the lst
				this.ctab.addLst(new SicLstEntry(split.tag, val,
					{ loc: this.ctab.current.useTab.loc(), inst: instr }));
				// increment usetab accordingly
				this.ctab.current.useTab.inc(instr.length());
			}
			// if there was an error
			catch (e) {
				this.errflag = true;
				// report it
				this.ctab.addLst(new SicLstEntry("", val, (e as Error).message));
			}
		});

		// add final ltorg if literals are not in one
		this.ctab.forEach(p => {
			if (p.litTab.hasPending()) {
				this.ctab.directives["SILENT_LTORG"]("", new SicSplit("\tSILENT_LTORG"));
			}
			p.useTab.correct();
			p.lst.forEach(l => {
				if (l.tag !== "" && l.bcData !== undefined) {
					p.tagTab[l.tag] = l.bcData.loc.r;
				}
			});
		});

		// pass 2
		this.ctab.forEach(p => {
			p.lst.forEach(l => {
				// make all pending instructions ready
				if (l.bcData !== undefined && l.bcData.inst !== undefined && !l.bcData.inst.ready()) {
					try {
						const res = l.bcData.inst.makeReady(l.bcData.loc.r, p.tagTab, p.litTab, p.extRefTab);
						if (res !== null) {
							p.modRecs.push({loc: l.bcData.loc.r, len: 5, symbol: res});
						}
					}
					catch (e) {
						const str = (e as Error).message;
						l.bcData = undefined;
						l.errmsg = str;
					}
				}
			});
		});
	}

	/**
	 * Creates an LST out of the processed lines of code.
	 */
	public makeLst(): string[] {
		return this.ctab.makeLst();
	}

	/**
	 * Creates an OBJ out of the processed lines of code.
	 */
	public makeObj(): string[] {
		return this.ctab.makeObj();
	}

	/**
	 * True if there was an error during compilation.
	 */
	public get err() {
		return this.errflag;
	}

	/**
	 * Converts the lines of code to raw bytes.
	 *
	 * public toBytes(): number[][] {
	 * 	return this.lst.filter(l => l.hasInstruction()).map(l => l.byteCode());
	 * }
	 */
}
