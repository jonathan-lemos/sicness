/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

// TODO: expression parser

// comments are for suckers
// if it was hard to write it should be hard to read

export const asHex = (n: number): string => n.toString(16).toUpperCase();

export const asWord = (n: number): string => asHex(n).padStart(6, "0");

export const asByte = (n: number): string => asHex(n).padStart(2, "0");

export const bytesToString = (n: number[]): string => n.reduce((acc: string, val: number) => acc + asByte(val), "");

export const sicMakeMask = (nBits: number): number => {
	let m = 0x0;
	for (let i = 0; i < nBits; ++i) {
		m |= (1 << i);
	}
	return m;
};

export const sicCheckUnsigned = (val: number, nBits: number): void => {
	if (val < 0x0 || val > sicMakeMask(nBits)) {
		throw new Error(asHex(val) + " does not fit in an unsigned " + nBits + "-bit range");
	}
};

export const sicMakeUnsigned = (val: number, nBits: number): number => {
	const m = sicMakeMask(nBits - 1);
	if (val < -m - 1 || val > m) {
		throw new Error(asHex(val) + " does not fit in a signed " + nBits + "-bit range");
	}

	val >>>= 0;
	val &= sicMakeMask(nBits);
	return val;
};

export class SicSplit {
	public tag: string;
	public op: string;
	public args: string;

	constructor(line: string) {
		line = line.replace(/\..*$/, "").toUpperCase();

		const lineArr = line.split(/\s+/);
		if (lineArr.length <= 1) {
			throw new Error(
				"This line does not have the correct number of entries. Did you forget to put whitespace before the operand?");
		}
		this.tag = lineArr[0];
		this.op = lineArr[1];
		if (lineArr.length >= 3) {
			this.args = lineArr.slice(2).reduce((acc, val) => acc + val);
		}
		else {
			this.args = "";
		}
	}
}

export class SicBytecode {
	public mnemonic: string;
	public opcode: number;
	public format: number;

	constructor(mnemonic: string, opcode: number, format: number) {
		this.mnemonic = mnemonic;
		this.opcode = opcode;
		this.format = format;
	}
}

export const bytecodeTable: {[key: string]: SicBytecode} = {
	ADD: new SicBytecode("ADD", 0x18, 3),
	ADDF: new SicBytecode("ADDF", 0x58, 3),
	ADDR: new SicBytecode("ADDR", 0x90, 2),
	AND: new SicBytecode("AND", 0x40, 3),
	CLEAR: new SicBytecode("CLEAR", 0xB4, 2),
	COMP: new SicBytecode("COMP", 0x28, 3),
	COMPF: new SicBytecode("COMPF", 0x88, 3),
	COMPR: new SicBytecode("COMPR", 0xA0, 2),
	DIV: new SicBytecode("DIV", 0x24, 3),
	DIVF: new SicBytecode("DIVF", 0x64, 3),
	DIVR: new SicBytecode("DIVR", 0x9C, 2),
	FIX: new SicBytecode("FIX", 0xC4, 1),
	FLOAT: new SicBytecode("FLOAT", 0xC0, 1),
	HIO: new SicBytecode("HIO", 0xF4, 1),
	J: new SicBytecode("J", 0x3C, 3),
	JEQ: new SicBytecode("JEQ", 0x30, 3),
	JLT: new SicBytecode("JLT", 0x38, 3),
	JSUB: new SicBytecode("JSUB", 0x48, 3),
	LDA: new SicBytecode("LDA", 0x00, 3),
	LDB: new SicBytecode("LDB", 0x68, 3),
	LDCH: new SicBytecode("LDCH", 0x50, 3),
	LDF: new SicBytecode("LDF", 0x70, 3),
	LDL: new SicBytecode("LDL", 0x08, 3),
	LDS: new SicBytecode("LDS", 0x6C, 3),
	LDT: new SicBytecode("LDT", 0x74, 3),
	LDX: new SicBytecode("LDX", 0x04, 3),
	LPS: new SicBytecode("LPS", 0xD0, 3),
	MUL: new SicBytecode("MUL", 0x20, 3),
	MULF: new SicBytecode("MULF", 0x60, 3),
	MULR: new SicBytecode("MULR", 0x98, 2),
	NORM: new SicBytecode("NORM", 0xC8, 1),
	OR: new SicBytecode("OR", 0x44, 3),
	RD: new SicBytecode("RD", 0xD8, 3),
	RMO: new SicBytecode("RMO", 0xAC, 2),
	RSUB: new SicBytecode("RSUB", 0x4C, 3),
	SHIFTL: new SicBytecode("SHIFTL", 0xA4, 2),
	SHIFTR: new SicBytecode("SHIFTR", 0xA8, 2),
	SIO: new SicBytecode("SIO", 0xF0, 1),
	SSK: new SicBytecode("SSK", 0xEC, 3),
	STA: new SicBytecode("STA", 0x0C, 3),
	STB: new SicBytecode("STB", 0x78, 3),
	STCH: new SicBytecode("STCH", 0x54, 3),
	STF: new SicBytecode("STF", 0x80, 3),
	STI: new SicBytecode("STI", 0xD4, 3),
	STS: new SicBytecode("STS", 0x7C, 3),
	STSW: new SicBytecode("STSW", 0xE8, 3),
	STT: new SicBytecode("STT", 0x84, 3),
	STX: new SicBytecode("STX", 0x10, 3),
	SUB: new SicBytecode("SUB", 0x1C, 3),
	SUBF: new SicBytecode("SUBF", 0x5C, 3),
	SUBR: new SicBytecode("SUBR", 0x94, 2),
	SVC: new SicBytecode("SVC", 0xB0, 2),
	TD: new SicBytecode("TD", 0xE0, 3),
	TIO: new SicBytecode("TIO", 0xF8, 1),
	TIX: new SicBytecode("TIX", 0x2C, 3),
	TIXR: new SicBytecode("TIXR", 0xB8, 2),
	WD: new SicBytecode("WD", 0xDC, 3),
};

export class SicBase {
	public val: number | SicPending;

	constructor(val: number | SicPending) {
		this.val = val;
		if (this.val instanceof SicPending && typeof (this.val as SicPending).val === "number") {
			this.val = (this.val as SicPending).val as number;
		}
	}

	public ready(): boolean {
		return typeof this.val === "number";
	}

	public makeReady(p: {[key: string]: number} | number): void {
		if (typeof this.val === "number") {
			return;
		}
		if (typeof p === "number") {
			this.val = p;
		}
		const tagTab = p as {[key: string]: number};
		const pending = this.val as SicPending;

		this.val = pending.convert(tagTab, null);
	}
}

export class SicPending {
	public val: string | number;

	constructor(val: string | number) {
		this.val = val;
	}

	public isLiteral(): boolean {
		return typeof this.val === "number";
	}

	public isTag(): boolean {
		return typeof this.val === "string";
	}

	public convert(tagTab: {[key: string]: number} | null, litTab: SicLitTab | null): number {
		let s: number | null;
		if (typeof this.val === "number") {
			if (litTab === null) {
				throw new Error("litTab is undefined but this SicPending is a literal");
			}
			s = litTab.getLitLoc(this.val);
			if (s === null) {
				throw new Error(this.val + "was not found in the literal table");
			}
		}
		else {
			if (tagTab === null) {
				throw new Error("tagTab is undefined but this SicPending is a tag");
			}
			s = tagTab[this.val];
			if (s === null) {
				throw new Error(this.val + "was not found in the tag table");
			}
		}
		return s;
	}
}

export enum SicOpAddrType {
	immediate,
	direct,
	indirect,
}

export enum SicOpType {
	f3,
	f4,
	legacy,
}
export class SicOperandAddr {
	public val: number | SicPending;
	public type: SicOpType;
	public addr: SicOpAddrType;
	public indexed: boolean;
	public base: SicBase | undefined;
	public pcrel: boolean;
	private rdy: boolean;

	constructor(arg: string, type: SicOpType, litList: SicLitTab, baserel?: SicBase) {
		const reDecimal = new RegExp("^(=|#|@)?(\\d+)(,X)?$");
		const reHex = new RegExp("^(=|#|@)?X'([0-9A-F]+)'(,X)?$");
		const reChar = new RegExp("^(=|#|@)?C'(.)'(,X)?$");
		const reTag = new RegExp("^(#|@)?([A-Z0-9]+)(,X)?$");

		const getType = (char: string): SicOpAddrType => {
			switch (char) {
				case "#":
					return SicOpAddrType.immediate;
				case "@":
					return SicOpAddrType.indirect;
				case "=":
				default:
					return SicOpAddrType.direct;
			}
		};

		const isLiteral = (c: string): boolean => c !== undefined && c.charAt(0) === "=";

		this.type = type;
		this.base = this.type === SicOpType.f3 ? baserel : undefined;
		this.pcrel = this.type === SicOpType.f3;

		let match: RegExpMatchArray | null;
		if ((match = arg.match(reDecimal)) !== null) {
			const x = parseInt(match[2], 10);
			if (isLiteral(match[1])) {
				litList.add(x);
				this.val = new SicPending(x);
			}
			else {
				this.val = x;
				this.pcrel = false;
			}
			this.addr = getType(match[1]);
			this.indexed = match[3] != null;
		}
		else if ((match = arg.match(reHex)) !== null) {
			const x = parseInt(match[2], 16);
			if (isLiteral(match[1])) {
				litList.add(x);
				this.val = new SicPending(x);
			}
			else {
				this.val = x;
				this.pcrel = false;
			}
			this.addr = getType(match[1]);
			this.indexed = match[3] != null;
		}
		else if ((match = arg.match(reChar)) !== null) {
			const x = match[2].charCodeAt(0);
			if (isLiteral(match[1])) {
				litList.add(x);
				this.val = new SicPending(x);
			}
			else {
				this.val = x;
				this.pcrel = false;
			}
			this.addr = getType(match[1]);
			this.indexed = match[3] != null;
		}
		else if ((match = arg.match(reTag)) != null) {
			this.val = new SicPending(match[2]);
			this.addr = getType(match[1]);
			this.indexed = match[3] != null;
		}
		else {
			throw new Error("Operand " + arg + " is not of any valid format.");
		}

		if (this.addr !== SicOpAddrType.direct && this.type === SicOpType.legacy) {
			throw new Error("SIC Legacy instructions can only use direct addressing");
		}

		this.rdy = !this.pcrel &&
			this.base === undefined &&
			typeof this.val === "number";
	}

	public ready(): boolean {
		return this.rdy;
	}

	public makeReady(pc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		if (this.rdy) {
			return;
		}

		if (this.base !== undefined && !this.base.ready()) {
			this.base.makeReady(tagTab);
		}

		if (typeof this.val !== "number") {
			this.val = (this.val as SicPending).convert(tagTab, litTab);
		}

		let maxAddr: number;
		switch (this.type) {
			case SicOpType.f3:
				maxAddr = 12;
				break;
			case SicOpType.legacy:
				maxAddr = 15;
				break;
			case SicOpType.f4:
				maxAddr = 20;
				break;
			default:
				throw new Error("type is not valid");
		}

		if (this.pcrel) {
			try {
				this.val = sicMakeUnsigned(this.val - pc, maxAddr);
				this.rdy = true;
				return;
			}
			catch (e) {
				this.pcrel = false;
			}
		}
		if (this.base) {
			try {
				this.val = sicMakeUnsigned(this.val - (this.base.val as number), maxAddr);
				this.rdy = true;
				return;
			}
			catch (e) {
				this.base = undefined;
			}
		}
		sicCheckUnsigned(this.val, maxAddr);
		this.rdy = true;
	}

	public nixbpe(): number[] {
		let n: boolean;
		let i: boolean;
		const x = this.indexed;
		const b = !this.pcrel && this.base !== undefined;
		const p = this.pcrel;
		const e = this.type !== SicOpType.f3;

		switch (this.addr) {
			case SicOpAddrType.direct:
				n = true;
				i = true;
				break;
			case SicOpAddrType.indirect:
				n = true;
				i = false;
				break;
			case SicOpAddrType.immediate:
				n = false;
				i = true;
				break;
			default:
				throw new Error("Registers do not have an nixbpe value");
		}

		const bytes = [0x0, 0x0];
		if (n) {
			bytes[0] |= 0x2;
		}
		if (i) {
			bytes[0] |= 0x1;
		}
		if (x) {
			bytes[1] |= 0x80;
		}
		if (b) {
			bytes[1] |= 0x40;
		}
		if (p) {
			bytes[1] |= 0x20;
		}
		if (e) {
			bytes[1] |= 0x10;
		}
		return bytes;
	}
}

interface ISicInstruction {
	ready(): boolean;
	length(): number;
	toBytes(): number[];
	makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void;
}

export class SicFormat1 implements ISicInstruction {
	public static isFormat1(mnemonic: string): boolean {
		const bc = bytecodeTable[mnemonic];
		return bc !== undefined && bc.format === 1;
	}

	public bc: SicBytecode;

	constructor(line: SicSplit) {
		if (!SicFormat1.isFormat1(line.op)) {
			throw new Error(line.op + " is not a format 1 operation");
		}
		if (line.args !== "") {
			throw new Error("Format 1 arguments cannot have arguments");
		}
		this.bc = bytecodeTable[line.op];
	}

	public ready(): boolean {
		return true;
	}

	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		return;
	}

	public length(): number {
		return 1;
	}

	public toBytes(): number[] {
		return [this.bc.opcode];
	}
}

export class SicFormat2 implements ISicInstruction {
	public static isFormat2(mnemonic: string) {
		const bc = bytecodeTable[mnemonic];
		return bc !== undefined && bc.format === 2;
	}

	public bc: SicBytecode;
	public op1: number;
	public op2: number;

	constructor(line: SicSplit) {
		if (!SicFormat2.isFormat2(line.op)) {
			throw new Error(line.op + " is not a format 2 opcode");
		}
		this.bc = bytecodeTable[line.op];

		const s = line.args.trim().split(/\s*,\s*/);
		if (s.length !== 2) {
			throw new Error("Args needs to have 2 and only 2 values.");
		}

		const matcher = (str: string): number => {
			const reIndexed = new RegExp("^(.+),X$");
			const reRegister = new RegExp("^(A|X|L|PC|SW|B|S|T|F)$");
			const reHex = new RegExp("^X'([0-9A-Fa-f]+)'$");
			const reDec = new RegExp("^([0-9]+)$");
			let match: RegExpMatchArray | null;

			if ((match = str.match(reRegister)) !== null) {
				return sicRegToDec(match[1]);
			}
			else if ((match = str.match(reHex)) !== null) {
				return parseInt(match[1], 16);
			}
			else if ((match = str.match(reDec)) !== null) {
				return parseInt(match[1], 10);
			}
			throw new Error(str + " is not a valid format 2 operand.");
		};

		this.op1 = matcher(s[0]);
		sicCheckUnsigned(this.op1, 4);
		this.op2 = matcher(s[1]);
		sicCheckUnsigned(this.op2, 4);
	}

	public ready(): boolean {
		return true;
	}

	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		return;
	}

	public length(): number {
		return 2;
	}

	public toBytes(): number[] {
		const bytes = [0x00, 0x00];
		bytes[0] = this.bc.opcode;
		bytes[1] |= (this.op1 & 0x0F) << 4;
		bytes[1] |= (this.op2 & 0x0F);
		return bytes;
	}
}

export class SicFormat3 implements ISicInstruction {
	public static isFormat3(mnemonic: string): boolean {
		const bc = bytecodeTable[mnemonic];
		return bc !== undefined && bc.format === 3;
	}

	public bc: SicBytecode;
	public op: SicOperandAddr;

	constructor(line: SicSplit, litSet: SicLitTab, baserel?: SicBase) {
		if (!SicFormat3.isFormat3(line.op)) {
			throw new Error(line.op + " is not format 3");
		}

		this.bc = bytecodeTable[line.op];
		this.op = new SicOperandAddr(line.args, SicOpType.f3, litSet, baserel);
	}

	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		this.op.makeReady(loc + 3, tagTab, litTab);
	}

	public ready(): boolean {
		return this.op.ready();
	}

	public length(): number {
		return 3;
	}

	public toBytes(): number[] {
		if (!this.ready()) {
			throw new Error("MY BODY IS NOT READY");
		}
		const bytes = this.op.nixbpe();
		bytes[0] |= (this.bc.opcode & 0xFC);
		bytes[1] |= ((this.op.val as number) & 0x0F00) >>> 8;
		bytes[2] = ((this.op.val as number) & 0xFF);
		return bytes;
	}
}

export class SicFormatLegacy implements ISicInstruction {
	public static isFormatLegacy(mnemonic: string): boolean {
		if (mnemonic.charAt(0) !== "*") {
			return false;
		}
		const bc = bytecodeTable[mnemonic.slice(1)];
		return bc !== undefined && bc.format === 3;
	}

	public bc: SicBytecode;
	public op: SicOperandAddr;

	constructor(line: SicSplit, litList: SicLitTab) {
		if (!SicFormatLegacy.isFormatLegacy(line.op)) {
			throw new Error(line.op + " is not SIC legacy format");
		}

		this.bc = bytecodeTable[line.op];
		this.op = new SicOperandAddr(line.args, SicOpType.legacy, litList);
	}

	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		this.op.makeReady(loc + this.length(), tagTab, litTab);
	}

	public ready(): boolean {
		return this.op.ready();
	}

	public length(): number {
		return 3;
	}

	public toBytes(): number[] {
		if (!this.ready()) {
			throw new Error("MY BODY IS NOT READY");
		}
		const bytes = this.op.nixbpe();
		bytes[0] |= (this.bc.opcode & 0xFC);
		bytes[1] |= ((this.op.val as number) & 0x0F00) >>> 8;
		bytes[2] = ((this.op.val as number) & 0xFF);
		return bytes;
	}
}

export class SicFormat4 implements ISicInstruction {
	public static isFormat4(mnemonic: string): boolean {
		if (mnemonic.charAt(0) !== "+") {
			return false;
		}
		const bc = bytecodeTable[mnemonic.slice(1)];
		return bc !== undefined && bc.format === 3;
	}

	public bc: SicBytecode;
	public op: SicOperandAddr;

	constructor(line: SicSplit, litList: SicLitTab) {
		if (!SicFormat4.isFormat4(line.op)) {
			throw new Error(line.op + " is not format 4");
		}

		this.bc = bytecodeTable[line.op.slice(1)];
		this.op = new SicOperandAddr(line.args, SicOpType.f4, litList);
	}

	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		this.op.makeReady(loc + this.length(), tagTab, litTab);
	}

	public ready(): boolean {
		return this.op.ready();
	}

	public length(): number {
		return 4;
	}

	public toBytes(): number[] {
		if (!this.ready()) {
			throw new Error("MY BODY IS NOT READY");
		}
		const bytes = this.op.nixbpe();
		bytes[0] |= (this.bc.opcode & 0xFC);
		bytes[1] |= ((this.op.val as number) & 0x0F0000) >>> 16;
		bytes[2] = ((this.op.val as number) & 0xFF00) >>> 8;
		bytes[3] = ((this.op.val as number) & 0xFF);
		return bytes;
	}
}

export class SicSpace implements ISicInstruction {
	public static isSpace(mnemonic: string): boolean {
		const re = new RegExp("^(WORD|BYTE)$");
		return re.test(mnemonic);
	}

	public static splitWord(n: number): number[] {
		sicCheckUnsigned(n, 24);
		return [(n & 0xFF0000) >>> 16, (n & 0xFF00) >>> 8, (n & 0xFF)];
	}

	public mnemonic: string;
	public arg: number[];

	constructor(line: SicSplit) {
		if (!SicSpace.isSpace(line.op)) {
			throw new Error("This mnemonic is not a space.");
		}
		this.mnemonic = line.op;
		const reDec = new RegExp("^(\\d+)$");
		const reHex = new RegExp("^X'([0-9A-Fa-f]+)'$");
		const reChar = new RegExp("^C'(.+)'$");
		let match: RegExpMatchArray | null;

		if ((match = line.args.match(reDec)) !== null) {
			this.arg = SicSpace.splitWord(parseInt(match[1], 10));
		}
		else if ((match = line.args.match(reHex)) !== null) {
			this.arg = SicSpace.splitWord(parseInt(match[1], 16));
		}
		else if ((match = line.args.match(reChar)) !== null) {
			this.arg = [];
			for (let i = 0; i < match[1].length; ++i) {
				this.arg.push(match[1].charCodeAt(i));
			}
		}
		else {
			throw new Error(line.args + " is not a valid operand format.");
		}
	}

	public ready(): boolean {
		return true;
	}

	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		return;
	}

	public length(): number {
		switch (this.mnemonic) {
			case "WORD":
				return this.arg.length + (this.arg.length % 3 !== 0 ? 1 : 0);
			case "BYTE":
				return this.arg.length;
			default:
				throw new Error(this.mnemonic + " is invalid. this is a ultra mega bug");
		}
	}

	public toBytes(): number[] {
		const a: number[] = [];
		switch (this.mnemonic) {
			case "WORD":
				for (let i = 0; i < this.arg.length % 3; ++i) {
					a.push(0x00);
				}
				this.arg.forEach(val => a.push(val));
			case "BYTE":
				return this.arg;
			default:
				throw new Error("Mnemonic is invalid.");
		}
	}
}

export class SicLiteral implements ISicInstruction {
	private val: number;

	constructor(val: number) {
		this.val = val;
	}

	public length(): number {
		return 3;
	}

	public ready(): boolean {
		return true;
	}

	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		return;
	}

	public toBytes(): number[] {
		return SicSpace.splitWord(this.val);
	}
}

export class SicLstEntry {
	public source: string;
	public bcData: { aloc: number, rloc: number, inst: ISicInstruction | undefined } | undefined;
	public errmsg: string | undefined;

	constructor(source: string, bcData?: { aloc: number, rloc: number, inst: ISicInstruction | undefined } | string) {
		this.source = source;
		if (typeof bcData === "string") {
			this.bcData = undefined;
			this.errmsg = bcData;
		}
		else {
			this.bcData = bcData;
			this.errmsg = undefined;
		}
	}

	public hasInstruction(): boolean {
		return this.bcData !== undefined && this.bcData.inst !== undefined;
	}

	public byteCode(): number[] {
		if (!(this.bcData !== undefined && this.bcData.inst !== undefined)) {
			throw new Error("This SicLstEntry does not have an instruction in it");
		}
		return this.bcData.inst.toBytes();
	}

	public byteString(): string {
		if (this.bcData === undefined || this.bcData.inst === undefined) {
			throw new Error("Cannot make a byteString() if there is no instruction.");
		}
		return bytesToString(this.bcData.inst.toBytes());
	}
}

export class SicLitTab {
	public ltorgs: Array<{ loc: number, val: number }>;
	private pending: Set<number>;

	constructor() {
		this.ltorgs = [];
		this.pending = new Set<number>();
	}

	public getLitLoc(n: number, pc: number = 0): number | null {
		let diffMin = Number.MAX_SAFE_INTEGER;
		let loc: number | null = null;
		this.ltorgs.forEach(lt => {
			if (lt.val === n && diffMin > Math.min(lt.loc - pc, lt.loc)) {
				diffMin = Math.min(lt.loc - pc, lt.loc);
				loc = lt.loc;
			}
		});
		return loc;
	}

	public createOrg(loc: number): Array<{ loc: number, val: number }> {
		let l = loc;
		const m: Array<{ loc: number, val: number }> = [];
		const lt = this.pending.forEach(v => {
			m.push({ loc: l, val: v });
			l += 3;
		});
		this.ltorgs = this.ltorgs.concat(m);
		this.pending = new Set<number>();
		return m;
	}

	public add(n: number): void {
		if (this.getLitLoc(n) === null) {
			this.pending.add(n);
		}
	}

	public hasPending(n?: number): boolean {
		if (n === undefined) {
			return this.pending.size > 0;
		}
		return this.pending.has(n);
	}
}

export class SicUseTab {
	public useTab: { [key: string]: number };
	public currentUse: string;
	private startloc: number;
	private RLOC: number;
	private ALOC: number;

	constructor(startloc: number) {
		this.ALOC = this.RLOC = this.startloc = startloc;
		this.useTab = {};
		this.currentUse = "";
	}

	public get aloc(): number {
		return this.ALOC;
	}

	public get rloc(): number {
		return this.RLOC;
	}

	public inc(n: number): void {
		this.RLOC += n;
		this.ALOC += n;
	}

	public use(label: string) {
		this.useTab[this.currentUse] = this.RLOC;
		this.currentUse = label;
		let x = this.useTab[label];
		if (x === undefined) {
			x = this.startloc;
		}
		this.RLOC = x;
	}
}

export class SicCompiler {
	private lst: SicLstEntry[];
	private startData: {name: string, loc: number} | undefined;

	private litTab: SicLitTab;
	private tagTab: { [key: string]: number };
	private equTab: { [key: string]: string };
	private useTab: SicUseTab;

	constructor(lines: string[]) {
		let baserel: SicBase | undefined;

		this.lst = [];
		this.tagTab = {};
		this.equTab = {};
		this.useTab = new SicUseTab(0);
		this.litTab = new SicLitTab();

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
				for (let ptr = 0, s = match[1]; s !== ""; ptr += 8, s = s.slice(0, -1)) {
					x += s.charCodeAt(s.length - 1) << ptr;
				}
				return x;
			}
			throw new Error(val + " was not of a valid numeric format.");
		};

		const directiveOps: { [key: string]: (source: string, split: SicSplit) => void } = {
			RESW: (source: string, split: SicSplit): void => {
				this.lst.push(new SicLstEntry(source, { aloc: this.useTab.aloc, rloc: this.useTab.rloc, inst: undefined }));
				this.useTab.inc(3 * parseNum(split.args));
			},

			RESB: (source: string, split: SicSplit): void => {
				this.lst.push(new SicLstEntry(source, { aloc: this.useTab.aloc, rloc: this.useTab.rloc, inst: undefined }));
				this.useTab.inc(parseNum(split.args));
			},

			START: (source: string, split: SicSplit): void => {
				if (this.useTab.aloc !== 0) {
					throw new Error("START can only be used as the first line of a program.");
				}
				this.useTab = new SicUseTab(parseInt(split.args, 16));
				this.lst.push(new SicLstEntry(source, { aloc: this.useTab.aloc, rloc: this.useTab.rloc, inst: undefined }));
				this.startData = {name: split.tag, loc: this.useTab.aloc};
			},

			END: (source: string, split: SicSplit): void => {
				if ((this.startData === undefined && split.args !== "") ||
				(this.startData !== undefined && split.args !== this.startData.name)) {
					throw new Error("END label must be the same as the start label.");
				}
				this.lst.push(new SicLstEntry(source, { aloc: this.useTab.aloc, rloc: this.useTab.rloc, inst: undefined }));
			},

			BASE: (source: string, split: SicSplit): void => {
				try {
					baserel = new SicBase(parseNum(split.args));
				}
				catch (e) {
					baserel = new SicBase(new SicPending(split.args));
				}
				this.lst.push(new SicLstEntry(source));
			},

			NOBASE: (source: string, split: SicSplit): void => {
				baserel = undefined;
				this.lst.push(new SicLstEntry(source));
			},

			LTORG: (source: string, split: SicSplit): void => {
				this.lst.push(new SicLstEntry(source));
				const l = this.litTab.createOrg(this.useTab.aloc);
				l.forEach(v => {
					this.lst.push(new SicLstEntry("LTORG-WORD X'" + asHex(v.val) + "'",
						{ aloc: this.useTab.aloc, rloc: this.useTab.rloc, inst: new SicLiteral(v.val) }));
					this.useTab.inc(3);
				});
			},

			EQU: (source: string, split: SicSplit): void => {
				if (split.tag === "") {
					throw new Error("EQU needs a non-empty label.");
				}
				if (this.equTab[split.args] !== undefined) {
					throw new Error("EQU " + split.args + " was already defined.");
				}
				this.equTab[split.tag] = split.args;
				// this.equTab["foo"] -> bar.
				// this.equTab["bar"] -> ...
				this.lst.push(new SicLstEntry(source));
			},

			USE: (source: string, split: SicSplit): void => {
				this.useTab.use(split.args);
				this.lst.push(new SicLstEntry(source));
			},
		};

		const isDirective = (val: string) => directiveOps[val] !== undefined;

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
				split.args.replace(/(#|@|=)\*$/, "$1" + this.useTab.aloc.toString(10));
				// replace strings in equTab
				for (const key of Object.keys(this.equTab)) {
					if (split.args.match(key) === null) {
						continue;
					}
					for (let s: string | undefined = this.equTab[key]; s !== undefined; s = this.equTab[s]) {
						split.args = split.args.replace(key, this.equTab[key]);
					}
					break;
				}

				if (split.tag !== undefined) {
					this.tagTab[split.tag] = this.useTab.aloc;
				}

				if (isDirective(split.op)) {
					directiveOps[split.op](val, split);
					return;
				}

				if (SicFormat1.isFormat1(split.op)) {
					instr = new SicFormat1(split);
				}
				else if (SicFormat2.isFormat2(split.op)) {
					instr = new SicFormat2(split);
				}
				else if (SicFormat3.isFormat3(split.op)) {
					instr = new SicFormat3(split, this.litTab, baserel);
				}
				else if (SicFormat4.isFormat4(split.op)) {
					instr = new SicFormat4(split, this.litTab);
				}
				else if (SicFormatLegacy.isFormatLegacy(split.op)) {
					instr = new SicFormatLegacy(split, this.litTab);
				}
				else if (SicSpace.isSpace(split.op)) {
					instr = new SicSpace(split);
				}
				else {
					throw new Error(split.op + " is not a valid mnemonic.");
				}

				this.lst.push(new SicLstEntry(val, { aloc: this.useTab.aloc, rloc: this.useTab.rloc, inst: instr }));
				this.useTab.inc(instr.length());
			}
			catch (e) {
				this.lst.push(new SicLstEntry(val, (e as Error).message));
			}
		});

		// add final ltorg if literals are not in one
		if (this.litTab.hasPending()) {
			directiveOps["LTORG"]("AUTO-LTORG", new SicSplit("\tAUTO-LTORG"));
		}

		// pass 2
		this.lst.forEach(l => {
			if (l.bcData !== undefined && l.bcData.inst !== undefined && !l.bcData.inst.ready()) {
				l.bcData.inst.makeReady(l.bcData.aloc, this.tagTab, this.litTab);
			}
		});
	}

	public makeLst(): string[] {
		const s = ["n"];
		s[0] = "n    \taloc \trloc \tbytecode\tsource";
		s[1] = "-----\t-----\t-----\t--------\t------";
		let i = 1;

		return s.concat(this.lst.map(ls => {
			const astr = ls.bcData === undefined ? "" : asHex(ls.bcData.aloc);
			const rstr = ls.bcData === undefined ? "" : asHex(ls.bcData.rloc);
			const inststr = ls.hasInstruction() ? ls.byteString() : "";
			const istr = asHex(i);
			++i;

			return istr.padEnd(5, " ") + "\t" +
				astr.padEnd(5, " ") + "\t" +
				rstr.padEnd(5, " ") + "\t" +
				inststr.padEnd(8, " ") + "\t" +
				ls.source;
		}));
	}

	public makeObj(): string[] {
		const s: string[] = [];

		// H record
		let tmp = "H";
		const loc = this.startData !== undefined ? this.startData.loc : 0;
		if (this.startData !== undefined) {
			tmp += this.startData.name;
		}
		tmp += " ";
		tmp += asWord(loc);
		tmp += asWord(this.useTab.aloc - loc);
		s.push(tmp);

		// T records - one per instruction
		this.lst.forEach(ls => {
			let t = "T";

			if (ls.bcData === undefined || ls.bcData.inst === undefined) {
				return;
			}

			t += asWord(ls.bcData.aloc);
			t += asByte(ls.bcData.inst.toBytes().length);
			t += bytesToString(ls.bcData.inst.toBytes());
			s.push(t);
		});

		// E record
		s.push("E" + asWord(loc));

		return s;
	}

	public toBytes(): number[][] {
		return this.lst.filter(l => l.hasInstruction()).map(l => l.byteCode());
	}
}

export const sicRegToDec = (reg: string): number => {
	switch (reg) {
		case "A":
			return 0;
		case "X":
			return 1;
		case "L":
			return 2;
		case "B":
			return 3;
		case "S":
			return 4;
		case "T":
			return 5;
		case "F":
			return 6;
		case "PC":
			return 8;
		case "SW":
			return 9;
		default:
			throw new Error("reg type " + reg + " is not valid");
	}
};

export const sicDecToReg = (reg: number): string => {
	switch (reg) {
		case 0:
			return "A";
		case 1:
			return "X";
		case 2:
			return "L";
		case 3:
			return "B";
		case 4:
			return "S";
		case 5:
			return "T";
		case 6:
			return "F";
		case 8:
			return "PC";
		case 9:
			return "SW";
		default:
			throw new Error("reg no " + reg + " is not valid");
	}
};
