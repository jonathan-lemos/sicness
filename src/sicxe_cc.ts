/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

export const sicMakeMask = (nBits: number): number => {
	let m = 0x0;
	for (let i = 0; i < nBits; ++i) {
		m |= (1 << i);
	}
	return m;
};

export const sicCheckUnsigned = (val: number, nBits: number): void => {
	if (val < 0x0 || val > sicMakeMask(nBits)) {
		throw new Error(val.toString(16) + " does not fit in an unsigned " + nBits + "-bit range");
	}
};

export const sicMakeUnsigned = (val: number, nBits: number): number => {
	if (val < -sicMakeMask(nBits - 1) - 1 || val > sicMakeMask(nBits)) {
		throw new Error(val + " does not fit in an " + nBits + "-bit range");
	}

	val >>>= 0;
	val &= sicMakeMask(nBits);
	return val;
};

export class SicSplit {
	public tag: string;
	public op: string;
	public args: string;
	public str: string;

	constructor(line: string) {
		const lineArr = line.split(/\s+/);
		if (lineArr.length <= 1) {
			throw new Error("lineArr does not have the required 2 entries");
		}
		this.tag = lineArr[0];
		this.op = lineArr[1];
		if (lineArr.length >= 3) {
			this.args = lineArr.slice(2).reduce((acc, val) => acc + val);
		}
		else {
			this.args = "";
		}
		this.str = line;
	}
}

export class BytecodeTableEntry{
	public mnemonic: string;
	public opcode: number;
	public format: number;

	constructor(mnemonic: string, opcode: number, format: number){
		this.mnemonic = mnemonic;
		this.opcode = opcode;
		this.format = format;
	}
}

export const bytecodeTable: {[key: string]: BytecodeTableEntry} = {
	ADD: new BytecodeTableEntry("ADD", 0x18, 3),
	ADDF: new BytecodeTableEntry("ADDF", 0x58, 3),
	ADDR: new BytecodeTableEntry("ADDR", 0x90, 2),
	AND: new BytecodeTableEntry("AND", 0x40, 3),
	CLEAR: new BytecodeTableEntry("CLEAR", 0xB4, 2),
	COMP: new BytecodeTableEntry("COMP", 0x28, 3),
	COMPF: new BytecodeTableEntry("COMPF", 0x88, 3),
	COMPR: new BytecodeTableEntry("COMPR", 0xA0, 2),
	DIV: new BytecodeTableEntry("DIV", 0x24, 3),
	DIVF: new BytecodeTableEntry("DIVF", 0x64, 3),
	DIVR: new BytecodeTableEntry("DIVR", 0x9C, 2),
	FIX: new BytecodeTableEntry("FIX", 0xC4, 1),
	FLOAT: new BytecodeTableEntry("FLOAT", 0xC0, 1),
	HIO: new BytecodeTableEntry("HIO", 0xF4, 1),
	J: new BytecodeTableEntry("J", 0x3C, 3),
	JEQ: new BytecodeTableEntry("JEQ", 0x30, 3),
	JLT: new BytecodeTableEntry("JLT", 0x38, 3),
	JSUB: new BytecodeTableEntry("JSUB", 0x48, 3),
	LDA: new BytecodeTableEntry("LDA", 0x00, 3),
	LDB: new BytecodeTableEntry("LDB", 0x68, 3),
	LDCH: new BytecodeTableEntry("LDCH", 0x50, 3),
	LDF: new BytecodeTableEntry("LDF", 0x70, 3),
	LDL: new BytecodeTableEntry("LDL", 0x08, 3),
	LDS: new BytecodeTableEntry("LDS", 0x6C, 3),
	LDT: new BytecodeTableEntry("LDT", 0x74, 3),
	LDX: new BytecodeTableEntry("LDX", 0x04, 3),
	LPS: new BytecodeTableEntry("LPS", 0xD0, 3),
	MUL: new BytecodeTableEntry("MUL", 0x20, 3),
	MULF: new BytecodeTableEntry("MULF", 0x60, 3),
	MULR: new BytecodeTableEntry("MULR", 0x98, 2),
	NORM: new BytecodeTableEntry("NORM", 0xC8, 1),
	OR: new BytecodeTableEntry("OR", 0x44, 3),
	RD: new BytecodeTableEntry("RD", 0xD8, 3),
	RMO: new BytecodeTableEntry("RMO", 0xAC, 2),
	RSUB: new BytecodeTableEntry("RSUB", 0x4C, 3),
	SHIFTL: new BytecodeTableEntry("SHIFTL", 0xA4, 2),
	SHIFTR: new BytecodeTableEntry("SHIFTR", 0xA8, 2),
	SIO: new BytecodeTableEntry("SIO", 0xF0, 1),
	SSK: new BytecodeTableEntry("SSK", 0xEC, 3),
	STA: new BytecodeTableEntry("STA", 0x0C, 3),
	STB: new BytecodeTableEntry("STB", 0x78, 3),
	STCH: new BytecodeTableEntry("STCH", 0x54, 3),
	STF: new BytecodeTableEntry("STF", 0x80, 3),
	STI: new BytecodeTableEntry("STI", 0xD4, 3),
	STS: new BytecodeTableEntry("STS", 0x7C, 3),
	STSW: new BytecodeTableEntry("STSW", 0xE8, 3),
	STT: new BytecodeTableEntry("STT", 0x84, 3),
	STX: new BytecodeTableEntry("STX", 0x10, 3),
	SUB: new BytecodeTableEntry("SUB", 0x1C, 3),
	SUBF: new BytecodeTableEntry("SUBF", 0x5C, 3),
	SUBR: new BytecodeTableEntry("SUBR", 0x94, 2),
	SVC: new BytecodeTableEntry("SVC", 0xB0, 2),
	TD: new BytecodeTableEntry("TD", 0xE0, 3),
	TIO: new BytecodeTableEntry("TIO", 0xF8, 1),
	TIX: new BytecodeTableEntry("TIX", 0x2C, 3),
	TIXR: new BytecodeTableEntry("TIXR", 0xB8, 2),
	WD: new BytecodeTableEntry("WD", 0xDC, 3),
};

export class SicBytecode {
	public static isBytecode(mnemonic: string): boolean {
		return bytecodeTable[mnemonic] !== undefined;
	}

	public opcode: number;
	public format: number;
	public mnemonic: string;

	constructor(mnemonic: string) {
		const format4flag = mnemonic.charAt(0) === "+";
		if (format4flag) {
			mnemonic = mnemonic.slice(1);
		}
		this.mnemonic = mnemonic;

		const bc = bytecodeTable[mnemonic];
		if (bc === undefined) {
			throw new Error(mnemonic + " is not a bytecode");
		}

		// sanity check
		sicCheckUnsigned(bc.opcode, 8);
		if ((bc.opcode & 0x3) !== 0) {
			throw new Error("This is a bug. The last 2 bits of the opcode must be clear.");
		}

		if (format4flag) {
			if (bc.format !== 3) {
				throw new Error("format 4 cannot be used with opcode " + mnemonic);
			}
			this.format = 4;
		}
		else{
			this.format = bc.format;
		}
		this.opcode = bc.opcode;
	}

	public length(): number {
		return this.format;
	}
}

export enum SicPendingType{
	tag,
	literal,
}

export class SicPending{
	public type: SicPendingType;
	public val: string;

	constructor(type: SicPendingType, val: string){
		this.type = type;
		this.val = val;
	}

	public convert(tagTab: {[key: string]: number}, litTab: {[key: string]: number}): number | undefined{
		if (this.type === SicPendingType.literal){
			return litTab[this.val];
		}
		return tagTab[this.val];
	}
}

export enum SicOpType {
	immediate,
	direct,
	indirect,
}
export class SicOperandF3 {
	public val: number | SicPending;
	public type: SicOpType;
	public indexed: boolean;
	public pcrel: boolean;
	public baserel: boolean;

	constructor(arg: string, baserel: boolean = false) {
		const reDecimal = new RegExp("^(=|#|@)?(\\d+)(,X)?$");
		const reHex = new RegExp("^(=|#|@)?X'([0-9A-F]+)'(,X)?$");
		const reChar = new RegExp("^(=|#|@)?C'(.)'(,X)?$");
		const reTag = new RegExp("^(#|@)?([A-Z0-9]+)(,X)?$");
		const operandLen = 12;

		const getType = (char: string): SicOpType => {
			switch (char) {
				case "#":
					return SicOpType.immediate;
				case "@":
					return SicOpType.indirect;
				case "=":
				default:
					return SicOpType.direct;
			}
		};

		const isLiteral = (st: string): boolean => {
			return st.charAt(0) === "=";
		};

		this.baserel = baserel;

		let match: RegExpMatchArray | null;
		if ((match = arg.match(reDecimal)) !== null) {
			this.val = sicMakeUnsigned(parseInt(match[2], 10), operandLen);
			this.type = getType(match[1]);
			this.indexed = match[3] != null;
			this.pcrel = false;
		}
		else if ((match = arg.match(reHex)) !== null) {
			this.val = sicMakeUnsigned(parseInt(match[2], 16), operandLen);
			this.type = getType(match[1]);
			this.indexed = match[3] != null;
			this.pcrel = false;
		}
		else if ((match = arg.match(reChar)) !== null) {
			this.val = match[2].charCodeAt(0);
			this.type = getType(match[1]);
			this.indexed = match[3] != null;
			this.pcrel = false;
		}
		else if ((match = arg.match(reTag)) != null) {
			this.val = new SicPending(SicPendingType.tag, match[2]);
			this.type = getType(match[1]);
			this.indexed = match[3] != null;
			this.pcrel = !this.baserel;
		}
		else {
			throw new Error("Operand " + arg + " is not of any valid format.");
		}
	}

	public ready(): boolean {
		return typeof this.val === "number";
	}

	public convertTag(loc: number, tagCallback: (tag: string) => number): void {
		if (typeof this.val === "number") {
			return;
		}
		const len = 12;
		if (this.pcrel) {
			try {
				this.val = sicMakeUnsigned(tagCallback(this.val) - loc, len);
			}
			// too big for pcrel, try direct
			catch (e) {
				this.pcrel = false;
				this.val = sicMakeUnsigned(tagCallback(this.val), len);
			}
		}
		else {
			this.val = sicMakeUnsigned(tagCallback(this.val), len);
		}
	}

	public nixbpe(): number[] {
		let n: boolean;
		let i: boolean;
		const x = this.indexed;
		const b = this.baserel;
		const p = this.pcrel;
		const e = true;

		switch (this.type) {
			case SicOpType.direct:
				n = true;
				i = true;
				break;
			case SicOpType.indirect:
				n = true;
				i = false;
				break;
			case SicOpType.immediate:
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

export class SicOperandF4 {
	public val: number | string;
	public type: SicOpType;
	public indexed: boolean;

	constructor(arg: string) {
		const reDecimal = new RegExp("^(=|#|@)?(\\d+)(,X)?$");
		const reHex = new RegExp("^(=|#|@)?X'([0-9A-F]+)'(,X)?$");
		const reChar = new RegExp("^(=|#|@)?C'(.)'(,X)?$");
		const reTag = new RegExp("^(#|@)?([A-Z0-9]+)(,X)?$");
		const operandLen = 20;

		const getType = (char: string): SicOpType => {
			switch (char) {
				case "#":
				case "=":
					return SicOpType.immediate;
				case "@":
					return SicOpType.indirect;
				default:
					return SicOpType.direct;
			}
		};

		let match: RegExpMatchArray | null;
		if ((match = arg.match(reDecimal)) !== null) {
			this.val = sicMakeUnsigned(parseInt(match[2], 10), operandLen);
			this.type = getType(match[1]);
			this.indexed = match[3] != null;
		}
		else if ((match = arg.match(reHex)) !== null) {
			this.val = sicMakeUnsigned(parseInt(match[2], 16), operandLen);
			this.type = getType(match[1]);
			this.indexed = match[3] != null;
		}
		else if ((match = arg.match(reChar)) !== null) {
			this.val = match[2].charCodeAt(0);
			this.type = getType(match[1]);
			this.indexed = match[3] != null;
		}
		else if ((match = arg.match(reTag)) != null) {
			this.val = match[2];
			this.type = getType(match[1]);
			this.indexed = match[3] != null;
		}
		else {
			throw new Error("Operand " + arg + " is not of any valid format.");
		}
	}

	public ready(): boolean {
		return typeof this.val === "number";
	}

	public convertTag(loc: number, tagCallback: (tag: string) => number): void {
		if (typeof this.val === "number") {
			return;
		}
		this.val = sicMakeUnsigned(tagCallback(this.val), 20);
	}

	public nixbpe(): number[] {
		let n: boolean;
		let i: boolean;
		const x = this.indexed;
		const b = false;
		const p = false;
		const e = true;

		switch (this.type) {
			case SicOpType.direct:
				n = true;
				i = true;
				break;
			case SicOpType.indirect:
				n = true;
				i = false;
				break;
			case SicOpType.immediate:
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

export class SicOperandLegacy {
	public val: number | string;
	public indexed: boolean;

	constructor(arg: string, format4: boolean, baserel: boolean = false) {
		const reRegister = new RegExp("^(A|X|L|PC|SW|B|S|T|F)$");
		const reDecimal = new RegExp("^(\\d+)(,X)?$");
		const reHex = new RegExp("^X'([0-9A-F]+)'(,X)?$");
		const reChar = new RegExp("^C'(.)'(,X)?$");
		const reTag = new RegExp("^([A-Z0-9]+)(,X)?$");
		const operandLen = 15;

		let match: RegExpMatchArray | null;
		if ((match = arg.match(reRegister)) !== null) {
			this.val = sicRegToDec(match[1]);
			this.indexed = false;
		}
		else if ((match = arg.match(reDecimal)) !== null) {
			this.val = sicMakeUnsigned(parseInt(match[2], 10), operandLen);
			this.indexed = match[3] != null;
		}
		else if ((match = arg.match(reHex)) !== null) {
			this.val = sicMakeUnsigned(parseInt(match[2], 16), operandLen);
			this.indexed = match[3] != null;
		}
		else if ((match = arg.match(reChar)) !== null) {
			this.val = match[2].charCodeAt(0);
			this.indexed = match[3] != null;
		}
		else if ((match = arg.match(reTag)) != null) {
			this.val = match[2];
			this.indexed = match[3] != null;
		}
		else {
			throw new Error("Operand " + arg + " is not of any valid format.");
		}
	}

	public ready(): boolean {
		return typeof this.val === "number";
	}

	public convertTag(tagCallback: (tag: string) => number): void {
		if (typeof this.val === "number") {
			return;
		}
		this.val = sicMakeUnsigned(tagCallback(this.val), 15);
	}
}

interface ISicInstruction {
	ready(): boolean;
	length(): number;
	toBytes(): number[];
}

export class SicFormat1 {
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
		this.bc = new SicBytecode(line.op);
	}

	public ready(): boolean {
		return true;
	}

	public length(): number {
		return 1;
	}

	public toBytes(): number[] {
		return [this.bc.opcode];
	}
}

export class SicFormat2 {
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
		this.bc = new SicBytecode(line.op);

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

export class SicFormat3 {
	public static isFormat3(mnemonic: string): boolean {
		const bc = bytecodeTable[mnemonic];
		return bc !== undefined && bc.format === 3;
	}

	public bc: SicBytecode;
	public op: SicOperandF3;

	constructor(line: SicSplit, baserel: boolean = false) {
		if (!SicFormat3.isFormat3(line.op)) {
			throw new Error(line.op + " is not format 3");
		}

		this.bc = new SicBytecode(line.op);
		this.op = new SicOperandF3(line.args, baserel);
	}

	public convertTag(loc: number, tagCallback: (tag: string) => number): void {
		this.op.convertTag(loc, tagCallback);
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

export class SicFormatLegacy {
	public static isFormatLegacy(mnemonic: string): boolean {
		if (mnemonic.charAt(0) !== "*") {
			return false;
		}
		const bc = bytecodeTable[mnemonic.slice(1)];
		return bc !== undefined && bc.format === 3;
	}

	public bc: SicBytecode;
	public op: SicOperandF3;

	constructor(line: SicSplit) {
		if (!SicFormatLegacy.isFormatLegacy(line.op)) {
			throw new Error(line.op + " is not SIC legacy format");
		}

		this.bc = new SicBytecode(line.op);
		this.op = new SicOperandF3(line.args, false);

		if (this.op.type !== SicOpType.direct) {
			throw new Error("SIC legacy operands cannot use indirect or immediate addressing.");
		}
		this.op.pcrel = false;
	}

	public convertTag(loc: number, tagCallback: (tag: string) => number): void {
		this.op.convertTag(loc, tagCallback);
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

export class SicFormat4 {
	public static isFormat4(mnemonic: string): boolean {
		if (mnemonic.charAt(0) !== "+") {
			return false;
		}
		const bc = bytecodeTable[mnemonic.slice(1)];
		return bc !== undefined && bc.format === 3;
	}

	public bc: SicBytecode;
	public op: SicOperandF3;

	constructor(line: SicSplit) {
		if (!SicFormat4.isFormat4(line.op)) {
			throw new Error(line.op + " is not format 4");
		}

		this.bc = new SicBytecode(line.op);
		this.op = new SicOperandF3(line.args, true);
	}

	public convertTag(loc: number, tagCallback: (tag: string) => number): void {
		this.op.convertTag(loc, tagCallback);
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

export class SicSpace {
	public static isSpace(mnemonic: string): boolean {
		const re = new RegExp("^(RESW|RESB|WORD|BYTE)$");
		return re.test(mnemonic);
	}

	private static splitWord(n: number): number[] {
		sicCheckUnsigned(n, 24);
		return [(n & 0xFF0000) >>> 16, (n & 0xFF00) >>> 8, (n & 0xFF)];
	}

	private static makeWord(arr: number[]): number {
		if (arr.length > 3) {
			throw new Error("Words can have a max of 3 bytes");
		}
		let ret = 0;
		for (let i = arr.length - 1, j = 0; i >= 0; --i, j += 8) {
			ret += arr[i] << j;
		}
		return ret;
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
			switch (this.mnemonic) {
				case "RESW":
				case "RESB":
					if (this.arg.length > 3) {
						throw new Error("RESW/RESB cannot be used with a string argument");
					}
			}
		}
		else {
			throw new Error(line.args + " is not a valid operand format.");
		}
	}

	public ready(): boolean {
		return true;
	}

	public length(): number {
		switch (this.mnemonic) {
			case "RESW":
				return 3 * SicSpace.makeWord(this.arg);
			case "RESB":
				return SicSpace.makeWord(this.arg);
			case "WORD":
				return this.arg.length + this.arg.length % 3 ? 1 : 0;
			case "BYTE":
				return this.arg.length;
			default:
				throw new Error(this.mnemonic + " is invalid. this is a ultra mega bug");
		}
	}

	public toBytes(): number[] {
		const a: number[] = [];
		switch (this.mnemonic) {
			case "RESW":
				for (let i = 0; i < 3 * SicSpace.makeWord(this.arg); ++i) {
					a.push(0xFF);
				}
				return a;
			case "RESB":
				for (let i = 0; i < SicSpace.makeWord(this.arg); ++i) {
					a.push(0xFF);
				}
				return a;
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

export class SicCodeLine {
	public instr: ISicInstruction;
	public loc: number;
	public tag: string;
	public str: string;
	constructor(instr: ISicInstruction, loc: number, tag: string, str: string) {
		this.instr = instr;
		this.loc = loc;
		this.tag = tag;
		this.str = str;
	}
}

export class SicLstEntry {
	public loc: string;
	public bytecode: string;
	public instr: string;

	constructor(loc: string, bytecode: string, instr: string) {
		this.loc = loc;
		if (bytecode.length <= 8) {
			this.bytecode = bytecode;
		}
		// RESW 1000
		else {
			this.bytecode = "";
		}
		this.instr = instr;
	}
}

export class SicCompiler {
	private static isDirective(mnemonic: string) {
		const re = new RegExp("^(START|END|BASE|NOBASE|LTORG)$");
		return re.test(mnemonic);
	}

	private tagTab: { [key: string]: number };
	private litTab: { [key: string]: number };
	private equTab: { [key: string]: number };
	private useTab: { [key: string]: number };

	public lines: SicCodeLine[];
	public lst: SicLstEntry[];

	constructor(lines: string[]) {
		const splits = lines
			.map(str => str.replace(/\..+$/, ""))
			.filter(str => str.trim() !== "")
			.map(val => new SicSplit(val));

		this.lines = [];
		this.lst = [];

		let startName: string | undefined;
		let baseTag: string | undefined;
		let locCurrent = 0;

		for (let i = 0; i < splits.length; ++i) {
			let instr: SicCodeLine;
			if (SicCompiler.isDirective(splits[i].op)) {
				switch (splits[i].op) {
					case "START":
						if (i !== 0) {
							throw new Error("START may only be the first line in a program");
						}
						startName = splits[i].tag;
						locCurrent = parseInt(splits[i].args, 16);
						break;
					case "END":
						if (i !== splits.length - 1) {
							throw new Error("END may only be the last line in a program");
						}
						if (splits[i].args !== startName) {
							throw new Error("END's label must be the same as the start label");
						}
						// END does not actually do anything
						break;
					case "BASE":
						baseTag = splits[i].args;
						break;
					case "NOBASE":
						baseTag = undefined;
						break;
					case "LTORG":
						// TODO
						break;
					default:
						throw new Error("not a splits[i]id mnemonic. this is an ultra mega bug");
				}
				continue;
			}
			else if (SicFormat1.isFormat1(splits[i].op)) {
				instr = new SicCodeLine(new SicFormat1(splits[i]), locCurrent, splits[i].tag, splits[i].str);
			}
			else if (SicFormat2.isFormat2(splits[i].op)) {
				instr = new SicCodeLine(new SicFormat2(splits[i]), locCurrent, splits[i].tag, splits[i].str);
			}
			else if (SicFormat3.isFormat3(splits[i].op)) {
				instr = new SicCodeLine(new SicFormat3(splits[i], baseTag !== undefined), locCurrent, splits[i].tag, splits[i].str);
			}
			else if (SicFormat4.isFormat4(splits[i].op)) {
				instr = new SicCodeLine(new SicFormat4(splits[i]), locCurrent, splits[i].tag, splits[i].str);
			}
			else if (SicSpace.isSpace(splits[i].op)) {
				instr = new SicCodeLine(new SicSpace(splits[i]), locCurrent, splits[i].tag, splits[i].str);
			}
			else {
				throw new Error(splits[i].op + " is not of any recognized format.");
			}

			locCurrent += instr.instr.length();
			this.lines.push(instr);
		}

		this.tags = new SicTags(this.lines);

		const tagCallback = (tag: string): number => {
			return this.tags.getTagLoc(this.lines, tag);
		};

		this.lines.forEach(val => {
			if (val.instr.ready()) {
				return;
			}
			else if (val.instr instanceof SicFormat3) {
				(val.instr as SicFormat3).convertTag(val.loc, tagCallback);
			}
			else if (val.instr instanceof SicFormat4) {
				(val.instr as SicFormat4).convertTag(val.loc, tagCallback);
			}
			else {
				throw new Error("all bodies were not ready. this is a bug");
			}
		});

		for (let i = 0, j = 0; i < splits.length; ++i) {
			if (SicCompiler.isDirective(splits[i].op)) {
				this.lst.push(new SicLstEntry("", "", splits[i].str.trim()));
			}
			else {
				const l = this.lines[j];
				let bc = "";
				l.instr.toBytes().forEach(val => {
					let c = val.toString(16).toUpperCase();
					while (c.length < 2) {
						c = "0" + c;
					}
					bc += c;
				});
				this.lst.push(new SicLstEntry(l.loc.toString(16).toUpperCase(), bc, l.str.trim()));
				j++;
			}
		}
	}

	public toLst(): SicLstEntry[] {
		return this.lst;
	}

	public toBytes(): number[][] {
		return this.lines.map(val => val.instr.toBytes());
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
