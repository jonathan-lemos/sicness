/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { SicBase } from "./SicBase";
import { asByte, asHex, asWord, bytesToString } from "./SicFmt";
import { SicLiteral } from "./SicLiteral";
import { SicLitTab } from "./SicLitTab";
import { SicLstEntry } from "./SicLstEntry";
import { SicPending } from "./SicPending";
import { SicSplit } from "./SicSplit";
import { SicLocPair, SicUseTab } from "./SicUseTab";

/**
 * A class holding the context for a csect.
 */
export class SicCsect {
	/** The processed lines of code. */
	public lst: SicLstEntry[];
	/** The literal tab in use. */
	public litTab: SicLitTab;
	/** The label tab in use. This is a hashtable mapping strings to numbers. */
	public tagTab: { [key: string]: number };
	/** The EQU tab in use. This is a hashtable mapping strings to strings. */
	public equTab: { [key: string]: string };
	/** A list of EXTDEFS made. */
	public extDefTab: Set<string>;
	/** A list of EXTREFS made. */
	public extRefTab: Set<string>;
	/** The USE tab / locctr tracker. */
	public useTab: SicUseTab;
	/** SicBase if base-relative can be used, or undefined if not. */
	public base: SicBase | undefined;
	/** A list of modification records to place in the code. */
	public modRecs: Array<{ loc: number, len: number, symbol: string }>;

	/**
	 * Constructs a SicCsect
	 * @constructor
	 */
	constructor(startAddr: number) {
		this.lst = [];
		this.litTab = new SicLitTab();
		this.tagTab = {};
		this.equTab = {};
		this.useTab = new SicUseTab(startAddr);
		this.extDefTab = new Set<string>();
		this.extRefTab = new Set<string>();
		this.modRecs = [];
	}

	/**
	 * Sets the starting address of the internal USE tab.
	 * This will wipe out the current USE tab.
	 */
	public setStartAddr(startAddr: number) {
		this.useTab = new SicUseTab(startAddr);
	}
}

/**
 * Class that keeps track of csect.
 */
export class SicCsectTab {
	/** The compiler directives this SicCsectTab supports. */
	public directives: { [key: string]: (source: string, split: SicSplit) => void };
	/** The START data. */
	private startData: { name: string, loc: number } | undefined;
	/** Hashtable containing this program's CSECTs */
	private csects: { [key: string]: SicCsect };
	/** The current CSECT. By default this is "" */
	private currentSect: string;
	/** The lst of this program */
	private lst: SicLstEntry[];

	/**
	 * Constructs a SicCsectTab
	 * @constructor
	 */
	constructor() {
		this.currentSect = "";
		this.csects = {};
		this.csects[this.currentSect] = new SicCsect(0);
		this.lst = [];

		/**
		 * Parses a numeric argument as decimal, hexadecimal, or character.
		 */
		const parseNum = (val: string): number => {
			const reDec = new RegExp("^(\\d+)$");
			const reHex = new RegExp("^X'([0-9A-Fa-f]+)'$");
			const reChar = new RegExp("^C'.{1,3}'$");
			let match: RegExpMatchArray | null;

			if ((match = val.match(reDec)) !== null) {
				return parseInt(match[1], 10);
			}
			if ((match = val.match(reHex)) !== null) {
				return parseInt(match[1], 16);
			}
			if ((match = val.match(reChar)) !== null) {
				let x = 0;
				// i have no idea how this works lmao
				for (let ptr = 0, s = match[1]; s !== ""; ptr += 8, s = s.slice(0, -1)) {
					x += s.charCodeAt(s.length - 1) << ptr;
				}
				return x;
			}
			throw new Error(val + " was not of a valid numeric format.");
		};

		// Contains the compiler directive functions.
		// This is a hashtable mapping strings to functions.
		// For example, to use the RESW directive, call it like `directiveOps["RESW"](source, split);`
		this.directives = {
			RESW: (source: string, split: SicSplit): void => {
				// Make a new lst entry containing locctrs, but no instruction.
				// This is so this RESW can be jumped to.
				this.addLst(new SicLstEntry(source,
					{ loc: this.current.useTab.loc() , inst: undefined }));
				// Increment locctr by the correct amount of bytes.
				this.current.useTab.inc(3 * parseNum(split.args));
			},

			RESB: (source: string, split: SicSplit): void => {
				// Make a new lst entry containing locctrs, but no instruction.
				// This is so this RESB can be jumped to.
				this.addLst(new SicLstEntry(source,
					{ loc: this.current.useTab.loc(), inst: undefined }));
				// Increment locctr by the correct amount of bytes.
				this.current.useTab.inc(parseNum(split.args));
			},

			// TODO fix bug where START can be used multiple times if starting locctr === 0
			START: (source: string, split: SicSplit): void => {
				if (this.currentSect !== "" || this.current.lst.length !== 0) {
					throw new Error("START can only be used as the first line of a program.");
				}
				// START arguments are always hexadecimal
				this.current.setStartAddr(parseInt(split.args, 16));
				this.addLst(new SicLstEntry(source,
					{ loc: this.current.useTab.loc(), inst: undefined }));
				this.startData = { name: split.tag, loc: this.current.useTab.aloc };
			},

			// TODO fix bug where this doesn't have to be the final line of code.
			END: (source: string, split: SicSplit): void => {
				// find the correct CSECT
				let cs: string;
				if (split.args === "") {
					throw new Error("END must have a label");
				}
				if (this.startData !== undefined && this.startData.name === split.args) {
					cs = "";
				}
				else if (this.csects[name] === undefined) {
					throw new Error(`${split.args} does not correspond to any given CSECT/START label.`);
				}
				else {
					cs = split.args;
				}

				this.csect(cs);
				if (this.current.litTab.hasPending()) {
					this.directives["SILENT_LTORG"]("", new SicSplit("\tSILENT_LTORG"));
				}
				this.current.useTab.correct();
				if ((this.startData === undefined && split.args !== "") ||
					(this.startData !== undefined && split.args !== this.startData.name)) {
					throw new Error("END label must be the same as the start label.");
				}
				this.addLst(new SicLstEntry(source,
					{ loc: this.current.useTab.loc(), inst: undefined }));
			},

			BASE: (source: string, split: SicSplit): void => {
				try {
					this.current.base = new SicBase(parseNum(split.args));
				}
				// the operand is not numeric, meaning it is a label
				catch (e) {
					this.current.base = new SicBase(new SicPending(split.args));
				}
				this.addLst(new SicLstEntry(source));
			},

			NOBASE: (source: string, split: SicSplit): void => {
				this.current.base = undefined;
				this.addLst(new SicLstEntry(source));
			},

			SILENT_LTORG: (source: string, split: SicSplit): void => {
				const l = this.current.litTab.createOrg(this.current.useTab.aloc);
				l.forEach(v => {
					this.addLst(new SicLstEntry(`X'${asHex(v.val)}' BYTE X'${asHex(v.val)}'`,
						{ loc: this.current.useTab.loc(), inst: new SicLiteral(v.val) }));
					this.current.useTab.inc(3);
				});
			},

			LTORG: (source: string, split: SicSplit): void => {
				this.addLst(new SicLstEntry(source));
				const l = this.current.litTab.createOrg(this.current.useTab.aloc);
				l.forEach(v => {
					this.addLst(new SicLstEntry(`X'${asHex(v.val)}' BYTE X'${asHex(v.val)}'`,
						{ loc: this.current.useTab.loc(), inst: new SicLiteral(v.val) }));
					this.current.useTab.inc(3);
				});
			},

			EQU: (source: string, split: SicSplit): void => {
				if (split.tag === "") {
					throw new Error("EQU needs a non-empty label.");
				}
				if (this.current.equTab[split.args] !== undefined) {
					throw new Error("EQU " + split.args + " was already defined.");
				}
				this.current.equTab[split.tag] = split.args;
				// this.equTab["foo"] -> bar.
				// this.equTab["bar"] -> ...
				this.addLst(new SicLstEntry(source));
			},

			USE: (source: string, split: SicSplit): void => {
				this.current.useTab.use(split.args);
				this.addLst(new SicLstEntry(source,
					{ loc: this.current.useTab.loc(), inst: undefined }));
			},

			CSECT: (source: string, split: SicSplit): void => {
				this.addLst(new SicLstEntry(source));
				this.csect(split.tag);
			},

			EXTDEF: (source: string, split: SicSplit): void => {
				const s = split.args.split(",");
				this.addLst(new SicLstEntry(source));
				s.forEach(r => this.current.extDefTab.add(r));
			},

			EXTREF: (source: string, split: SicSplit): void => {
				const s = split.args.split(",");
				this.addLst(new SicLstEntry(source));
				s.forEach(r => {
					if (this.current.extRefTab.has(r)) {
						throw new Error("Duplicate EXTREF " + r);
					}
					if (this.current.tagTab[r] !== undefined) {
						throw new Error("Duplicate label " + r);
					}
					this.current.extRefTab.add(r);
				});
			},
		};
	}

	public litPool(): void {
		const l = this.current.litTab.createOrg(this.current.useTab.aloc);
		l.forEach(v => {
			this.addLst(new SicLstEntry(`X'${asHex(v.val)}' BYTE X'${asHex(v.val)}'`,
				{ loc: this.current.useTab.loc(), inst: new SicLiteral(v.val) }));
			this.current.useTab.inc(3);
		});

	}

	public isDirective(mnemonic: string): boolean {
		if (mnemonic === "SILENT_LTORG") {
			return false;
		}
		return this.directives[mnemonic] !== undefined;
	}

	public addLst(l: SicLstEntry): void {
		this.lst.push(l);
		this.current.lst.push(l);
	}

	public makeLst(): string[] {
		const s = ["n"];
		s[0] = "n    \taloc \trloc \tbytecode\tsource";
		s[1] = "-----\t-----\t-----\t--------\t------";
		let i = 1;

		return s.concat(this.lst.map(ls => {
			const astr = ls.bcData === undefined ? "" : asHex(ls.bcData.loc.a);
			const rstr = ls.bcData === undefined ? "" : asHex(ls.bcData.loc.r);
			const inststr = ls.hasInstruction() ? ls.byteString() : "";
			const istr = i.toString(10);
			++i;

			let msg = istr.padEnd(5, " ") + "\t" +
				astr.padEnd(5, " ") + "\t" +
				rstr.padEnd(5, " ") + "\t" +
				inststr.padEnd(8, " ") + "\t" +
				ls.source;

			if (ls.errmsg !== undefined) {
				msg += "\n* Error: " + ls.errmsg + " *";
			}

			return msg;
		}));
	}

	/**
	 * Creates an OBJ out of the lines of code.
	 */
	public makeObj(): string[] {
		let s: string[] = [];

		const mkH = (len: number, loc?: number, name?: string): string => {
			if (loc === undefined) {
				loc = 0;
			}
			if (name === undefined) {
				name = "";
			}
			return `H ${name} ${asWord(loc)} ${asWord(len)}`;
		};

		const mkD = (defs: Set<string>, tagTab: { [key: string]: number }): string => {
			if (defs.size === 0) {
				return "";
			}
			let a = "D ";
			defs.forEach(v => a += `${v} ${asWord(tagTab[v])}`, "");
			return a;
		};

		const mkR = (refs: Set<string>): string => {
			if (refs.size === 0) {
				return "";
			}
			let a = "R ";
			refs.forEach(v => a += v + " ", "");
			return a.trim();
		};

		const mkT = (arr: SicLstEntry[]): string[] => {
			const buf: string[] = [];
			arr.forEach(l => {
				if (l.bcData === undefined || l.bcData.inst === undefined) {
					return;
				}
				buf.push(`T ${asWord(l.bcData.loc.a)} ${asByte(l.bcData.inst.length())} ${bytesToString(l.bcData.inst.toBytes())}`);
			});
			return buf;
		};

		const mkE = (loc?: number): string => {
			if (loc === undefined) {
				return "E";
			}
			return `E ${asWord(loc)}`;
		};

		const mkM = (modrec: Array<{ loc: number, len: number, symbol: string }>): string[] => {
			return modrec.map(m => {
				return `M ${asWord(m.loc)} ${asByte(m.len)} +${m.symbol}`;
			});
		};

		const getLen = (a: SicLstEntry[]): number => {
			let start = 0;
			let end = 0;

			for (const b of a) {
				if (b.bcData !== undefined) {
					start = b.bcData.loc.a;
					break;
				}
			}
			for (let i = a.length - 1; i >= 0; --i) {
				const bc = a[i].bcData;
				if (bc !== undefined) {
					end = bc.loc.a + (bc.inst !== undefined ? bc.inst.length() : 0);
					break;
				}
			}
			return end - start;
		};

		const sloc = this.startData !== undefined ? this.startData.loc : 0;
		const sname = this.startData !== undefined ? this.startData.name : "";

		s.push(mkH(getLen(this.csects[""].lst), sloc, sname));
		s.push(mkD(this.csects[""].extDefTab, this.csects[""].tagTab));
		s.push(mkR(this.csects[""].extRefTab));
		s = s.concat(mkT(this.csects[""].lst));
		s = s.concat(mkM(this.csects[""].modRecs));
		s.push(mkE(sloc));

		this.forEachAux((c, n) => {
			s.push(mkH(getLen(c.lst), 0, n));
			s.push(mkD(c.extDefTab, c.tagTab));
			s.push(mkR(c.extRefTab));
			s = s.concat(mkT(c.lst));
			s = s.concat(mkM(c.modRecs));
			s.push(mkE());
		});

		return s.filter(r => r !== "");
	}

	public get current(): SicCsect {
		return this.csects[this.currentSect];
	}

	/**
	 * Switches the current CSECT
	 * @param newSect The new CSECT name.
	 */
	public csect(newSect: string): void {
		this.currentSect = newSect;
		if (this.csects[this.currentSect] === undefined) {
			this.csects[this.currentSect] = new SicCsect(0);
		}
	}

	public get default(): SicCsect {
		return this.csects[""];
	}

	public forEach(callback: (par: SicCsect, name: string) => void): void {
		const curBuf = this.currentSect;
		Object.keys(this.csects).forEach(c => {
			this.currentSect = c;
			callback(this.csects[c], c);
		});
		this.currentSect = curBuf;
	}

	public forEachAux(callback: (par: SicCsect, name: string) => void): void {
		const curBuf = this.currentSect;
		Object.keys(this.csects).forEach(c => {
			if (c === "") {
				return;
			}
			this.currentSect = c;
			callback(this.csects[c], c);
		});
		this.currentSect = curBuf;
	}
}
