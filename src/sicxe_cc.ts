/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

// TODO: expression parser

// comments are for suckers
// if it was hard to write it should be hard to read

/**
 * Converts a number to its hexadecimal string equivalent.
 */
export const asHex = (n: number): string => n.toString(16).toUpperCase();

/**
 * Converts a number to its hexadecimal word (3-byte) equivalent.
 */
export const asWord = (n: number): string => asHex(n).padStart(6, "0");

/**
 * Converts a number to its hexadecimal byte equivalent.
 */
export const asByte = (n: number): string => asHex(n).padStart(2, "0");

/**
 * Converts an array of bytes into a single hexadecimal string.
 */
export const bytesToString = (n: number[]): string => n.reduce((acc: string, val: number) => acc + asByte(val), "");

/**
 * Creates a bitmask of n bits.
 * @param nBits The number of bits (starting from the right) that should be toggled on.
 * For example, sicMakeMask(11) === 0x7FF
 */
export const sicMakeMask = (nBits: number): number => {
	let m = 0x0;
	for (let i = 0; i < nBits; ++i) {
		m |= (1 << i);
	}
	return m;
};

/**
 * Checks that a number fits into an unsigned n-bit range, throwing an exception if it doesn't.
 * @param val The number to check.
 * @param nBits The number of bits it should fit into.
 */
export const sicCheckUnsigned = (val: number, nBits: number): void => {
	if (val < 0x0 || val > sicMakeMask(nBits)) {
		throw new Error(asHex(val) + " does not fit in an unsigned " + nBits + "-bit range");
	}
};

/**
 * Optionally converts a signed value into its n-bit unsigned equivalent,
 * and checks if the result fits into a signed n-bit range.
 * @param val The number to create an unsigned value for.
 * @param nBits The number of signed bits the value should fit in.
 * @returns The new unsigned value.
 */
export const sicMakeUnsigned = (val: number, nBits: number): number => {
	const m = sicMakeMask(nBits - 1);
	if (val < -m - 1 || val > m) {
		throw new Error(asHex(val) + " does not fit in a signed " + nBits + "-bit range");
	}

	val >>>= 0;
	val &= sicMakeMask(nBits);
	return val;
};

/**
 * Class that splits a raw line of code into its label, operand, and optional arguments.
 */
export class SicSplit {
	/** The label of this split. This is "" if there is none. */
	public tag: string;
	/** The operand of this split. This cannot be "". */
	public op: string;
	/** The arguments of this split. If there is more than one, they are concatenated into one string. */
	public args: string;

	/**
	 * Constructs a SicSplit
	 * @constructor
	 * @param line The raw line of code to split.
	 */
	constructor(line: string) {
		// Remove all comments from the line and convert it to uppercase.
		// Comments start with a '.', and this regex removes all characters from a literal dot to the end of line.
		line = line.replace(/\..*$/, "").toUpperCase();

		// Split the line by any amount of whitespace.
		// If the line starts with whitespace, the first entry of the array will be "".
		const lineArr = line.split(/\s+/);
		if (lineArr.length <= 1) {
			throw new Error(
				"This line does not have the correct number of entries. Did you forget to put whitespace before the operand?");
		}
		this.tag = lineArr[0];
		this.op = lineArr[1];
		// If there is more than one argument.
		// TODO: parse these individually.
		if (lineArr.length >= 3) {
			// Concatenate all of them into one string.
			this.args = lineArr.slice(2).reduce((acc, val) => acc + val);
		}
		else {
			this.args = "";
		}
	}
}

/**
 * Represents an entry in the bytecode table.
 */
export class SicBytecode {
	/** The mnemonic (LDX) of this opcode. */
	public mnemonic: string;
	/** The hex code (0x04) that corresponds to this mnemonic. */
	public opcode: number;
	/** The format (3) of this opcode. A format of 3 means this supports 3, legacy, and 4. */
	public format: number;

	/**
	 * Constructs a SicBytecode.
	 * @constructor
	 */
	constructor(mnemonic: string, opcode: number, format: number) {
		this.mnemonic = mnemonic;
		this.opcode = opcode;
		this.format = format;
	}
}

/**
 * The list of opcodes a SIC/XE CPU supports as a hashtable.
 * Accessing a specific opcode can be done like 'bytecodeTable["LDX"]'
 *
 * Keep in mind the assembler itself supports directives not listed here such as RESW.
 */
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

/**
 * Represents a base-relative value.
 * This can either be a number (BASE 4) or a pending value (BASE LBL).
 */
export class SicBase {
	/**
	 * The value of this base.
	 * If this is a number, it is ready to be used.
	 * If this is a SicPending, it needs to be converted before it can be used.
	 * @see makeReady
	 */
	public val: number | SicPending;

	/**
	 * Constructs a SicBase
	 * @constructor
	 * @param val Either a number or a pending value to use as the base value.
	 */
	constructor(val: number | SicPending) {
		this.val = val;
		// If this SicPending is a literal.
		if (this.val instanceof SicPending && typeof (this.val as SicPending).val === "number") {
			// We can just load the value of the literal directly.
			this.val = (this.val as SicPending).val as number;
		}
	}

	/**
	 * Returns true if this SicBase is ready to be used, false if not.
	 * @see makeReady
	 */
	public ready(): boolean {
		return typeof this.val === "number";
	}

	/**
	 * If this SicBase is not ready(), this function makes it ready.
	 * @param p Either a hashtable mapping labels to memory locations, or a raw number to be used.
	 */
	public makeReady(p: {[key: string]: number} | number): void {
		// If this.val is a number, this is already ready.
		if (typeof this.val === "number") {
			return;
		}
		// If p is a number, just set the val to the number.
		if (typeof p === "number") {
			this.val = p;
			return;
		}
		// Convert this SicPending (label) using the passed hashtable.
		const tagTab = p as {[key: string]: number};
		const pending = this.val as SicPending;

		this.val = pending.convert(tagTab, null);
	}
}

/**
 * Represents a "pending" value.
 * This can either be a label or a literal, both of which have to be resolved in pass 2.
 */
export class SicPending {
	/**
	 * The value.
	 * If this is a string, it's a label.
	 * If this is a number, it's a literal.
	 */
	public val: string | number;

	/**
	 * Constructs a SicPending using the passed label or literal.
	 */
	constructor(val: string | number) {
		this.val = val;
	}

	/**
	 * Returns true if this SicPending is a literal.
	 */
	public isLiteral(): boolean {
		return typeof this.val === "number";
	}

	/**
	 * Returns true if this SicPending is a label.
	 */
	public isTag(): boolean {
		return typeof this.val === "string";
	}

	/**
	 * Converts this SicPending into an actual value.
	 * @param tagTab A hashtable mapping labels to lines of code.
	 * This can be null if this SicPending does not represent a label.
	 * @param litTab A SicLitTab mapping literals to lines of code.
	 * This can be null if this SicPending does not represent a literal.
	 */
	public convert(tagTab: {[key: string]: number} | null, litTab: SicLitTab | null): number {
		let s: number | null;
		// If this is a literal.
		if (typeof this.val === "number") {
			if (litTab === null) {
				throw new Error("litTab is undefined but this SicPending is a literal");
			}
			s = litTab.getLitLoc(this.val);
			if (s === null) {
				throw new Error(this.val + "was not found in the literal table");
			}
		}
		// Otherwise this is a label.
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

/**
 * Represents an addressing type for format 3/4 operands.
 */
export enum SicOpAddrType {
	immediate,
	direct,
	indirect,
}

/**
 * Represents an opcode type.
 */
export enum SicOpType {
	f3,
	f4,
	legacy,
}

/**
 * Represents a format 3/legacy/4 operand.
 */
export class SicOperandAddr {
	/**
	 * The value of this operand.
	 * If this value is a SicPending, it needs to be converted to number before being used.
	 */
	public val: number | SicPending;
	/**
	 * The opcode type that this operand is mapped to (format 3/legacy/4).
	 */
	public type: SicOpType;
	/**
	 * The addressing type of this operand (immediate/direct/indirect).
	 */
	public addr: SicOpAddrType;
	/**
	 * True if this operand uses the index register (X).
	 */
	public indexed: boolean;
	/**
	 * A corresponding SicBase if this operand can use base-relative, undefined if not.
	 */
	public base: SicBase | undefined;
	/**
	 * True if this operand can use pc-relative.
	 */
	public pcrel: boolean;
	/**
	 * True if this operand is ready to convert into bytecode.
	 */
	private rdy: boolean;

	/**
	 * Constructs a SicOperandAddr.
	 * @param arg The argument as a string.
	 * @param type The type of opcode it should be mapped to (format 3/legacy/4).
	 * @param litList The current LITTAB in use. If this argument is a literal it will be added to the pending list.
	 * @param baserel An optional SicBase denoting that this operand can use base-relative addressing.
	 */
	constructor(arg: string, type: SicOpType, litList: SicLitTab, baserel?: SicBase) {
		// Matches a decimal argument (@1234).
		const reDecimal = new RegExp("^(=|#|@)?(\\d+)(,X)?$");
		// Matches a hexadecimal argument (@X'1ABC')
		const reHex = new RegExp("^(=|#|@)?X'([0-9A-F]+)'(,X)?$");
		// Matches a single character argument (@'Q')
		const reChar = new RegExp("^(=|#|@)?C'(.)'(,X)?$");
		// Matches a label argument (@VAL)
		const reTag = new RegExp("^(#|@)?([A-Z0-9]+)(,X)?$");

		// For all of the above regexes:
		// match[0] === The raw input string
		// match[1] === "=", "#", "@", or undefined.
		// match[2] === The actual contents of the match.
		// match[3] === ",X", or undefined.

		// Converts match[1] to the correct addressing type.
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

		// Returns true if match[1] points to a literal.
		const isLiteral = (c: string): boolean => c !== undefined && c.charAt(0) === "=";

		this.type = type;
		// Only format 3 can use base-relative addressing.
		this.base = this.type === SicOpType.f3 ? baserel : undefined;
		// Only format 3 can use pc-relative addressing.
		this.pcrel = this.type === SicOpType.f3;

		let match: RegExpMatchArray | null;
		if ((match = arg.match(reDecimal)) !== null) {
			// Parse the second part of this operand as a decimal.
			const x = parseInt(match[2], 10);
			// If the argument is a literal.
			if (isLiteral(match[1])) {
				// Add this literal to the pending list if it is not already there.
				litList.add(x);
				// Set this value to a new SicPending corresponding to the literal.
				this.val = new SicPending(x);
			}
			else {
				// Set this value to the raw number.
				this.val = x;
				// Raw numeric arguments do not use pc-relative addressing.
				this.pcrel = false;
			}
		}
		else if ((match = arg.match(reHex)) !== null) {
			// Parse the second part of this operand as hexadecimal.
			const x = parseInt(match[2], 16);
			// If the argument is a literal.
			if (isLiteral(match[1])) {
				// Add this literal to the pending list if it is not already there.
				litList.add(x);
				// Set this value to a new SicPending corresponding to the literal.
				this.val = new SicPending(x);
			}
			else {
				// Set this value to the raw number.
				this.val = x;
				// Raw numeric arguments do not use pc-relative addressing.
				this.pcrel = false;
			}
		}
		else if ((match = arg.match(reChar)) !== null) {
			const x = match[2].charCodeAt(0);
			// If the argument is a literal.
			if (isLiteral(match[1])) {
				// Add this literal to the pending list if it is not already there.
				litList.add(x);
				// Set this value to a new SicPending corresponding to the literal.
				this.val = new SicPending(x);
			}
			else {
				// Set this value to the raw number.
				this.val = x;
				// Raw numeric arguments do not use pc-relative addressing.
				this.pcrel = false;
			}
		}
		else if ((match = arg.match(reTag)) != null) {
			// Set this value to a new SicPending corresponding to the label.
			this.val = new SicPending(match[2]);
		}
		else {
			throw new Error("Operand " + arg + " is not of any valid format.");
		}
		// Set this addressing mode based on @/=.
		this.addr = getType(match[1]);
		// Indexing is true if ",X" was matched at the end of the string.
		this.indexed = match[3] != null;

		// If @ or # is used with a SIC legacy opcode.
		if (this.addr !== SicOpAddrType.direct && this.type === SicOpType.legacy) {
			throw new Error("SIC Legacy instructions can only use direct addressing");
		}

		// If this is not pcrel, not baserel, and not pending, it is ready.
		this.rdy = !this.pcrel &&
			this.base === undefined &&
			typeof this.val === "number";
	}

	/**
	 * Returns true if this SicOperandAddr is ready to be used.
	 * @see makeReady
	 */
	public ready(): boolean {
		return this.rdy;
	}

	/**
	 * If this SicOperandAddr is not ready, this method makes it ready.
	 * @param pc The current program counter when the corresponding instruction is executed.
	 * This is equal to the current line of code + the length of this instruction.
	 * @param tagTab A hashtable mapping labels to their corresponding lines of code.
	 * @param litTab A SicLitTab mapping literals to their corresponding lines of code.
	 */
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
	private startData: { name: string, loc: number } | undefined;

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
				this.startData = { name: split.tag, loc: this.useTab.aloc };
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
