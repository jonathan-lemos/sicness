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
 * This class is read-only.
 */
export class SicBytecode {
	/** The mnemonic (LDX) of this opcode. */
	private mnemonicPvt: string;
	/** The hex code (0x04) that corresponds to this mnemonic. */
	private opcodePvt: number;
	/** The format (3) of this opcode. A format of 3 means this supports 3, legacy, and 4. */
	private formatPvt: number;

	/**
	 * Constructs a SicBytecode.
	 * @constructor
	 */
	constructor(mnemonic: string, opcode: number, format: number) {
		this.mnemonicPvt = mnemonic;
		this.opcodePvt = opcode;
		this.formatPvt = format;
	}

	/**
	 * Mnemonic getter with no corresponding setter.
	 * This causes mnemonic to be effectively read-only.
	 */
	public get mnemonic(): string {
		return this.mnemonicPvt;
	}

	/**
	 * Opcode getter with no corresponding setter.
	 * This causes opcode to be effectively read-only.
	 */
	public get opcode(): number {
		return this.opcodePvt;
	}

	/**
	 * Format getter with no corresponding setter.
	 * This causes format to be effectively read-only.
	 */
	public get format(): number {
		return this.formatPvt;
	}
}

/**
 * The list of opcodes a SIC/XE CPU supports as a hashtable.
 * Accessing a specific opcode can be done like 'bytecodeTable["LDX"]'
 *
 * Keep in mind the assembler itself supports directives not listed here such as RESW.
 */
export const bytecodeTable: {[key: string]: SicBytecode} = {};

/**
 * Adds a constant property to the bytecode table.
 * Adding properties the regular way causes them to be writable, which can lead to all sorts of nasty bugs.
 */
const addBytecode = (bc: SicBytecode) => {
	Object.defineProperty(bytecodeTable, bc.mnemonic, {
		configurable: true,
		enumerable: true,
		value: bc,
		writable: false,
	});
};

addBytecode(new SicBytecode("ADD", 0x18, 3));
addBytecode(new SicBytecode("ADDF", 0x58, 3));
addBytecode(new SicBytecode("ADDR", 0x90, 2));
addBytecode(new SicBytecode("AND", 0x40, 3));
addBytecode(new SicBytecode("CLEAR", 0xB4, 2));
addBytecode(new SicBytecode("COMP", 0x28, 3));
addBytecode(new SicBytecode("COMPF", 0x88, 3));
addBytecode(new SicBytecode("COMPR", 0xA0, 2));
addBytecode(new SicBytecode("DIV", 0x24, 3));
addBytecode(new SicBytecode("DIVF", 0x64, 3));
addBytecode(new SicBytecode("DIVR", 0x9C, 2));
addBytecode(new SicBytecode("FIX", 0xC4, 1));
addBytecode(new SicBytecode("FLOAT", 0xC0, 1));
addBytecode(new SicBytecode("HIO", 0xF4, 1));
addBytecode(new SicBytecode("J", 0x3C, 3));
addBytecode(new SicBytecode("JEQ", 0x30, 3));
addBytecode(new SicBytecode("JGT", 0x34, 3));
addBytecode(new SicBytecode("JLT", 0x38, 3));
addBytecode(new SicBytecode("JSUB", 0x48, 3));
addBytecode(new SicBytecode("LDA", 0x00, 3));
addBytecode(new SicBytecode("LDB", 0x68, 3));
addBytecode(new SicBytecode("LDCH", 0x50, 3));
addBytecode(new SicBytecode("LDF", 0x70, 3));
addBytecode(new SicBytecode("LDL", 0x08, 3));
addBytecode(new SicBytecode("LDS", 0x6C, 3));
addBytecode(new SicBytecode("LDT", 0x74, 3));
addBytecode(new SicBytecode("LDX", 0x04, 3));
addBytecode(new SicBytecode("LPS", 0xD0, 3));
addBytecode(new SicBytecode("MUL", 0x20, 3));
addBytecode(new SicBytecode("MULF", 0x60, 3));
addBytecode(new SicBytecode("MULR", 0x98, 2));
addBytecode(new SicBytecode("NORM", 0xC8, 1));
addBytecode(new SicBytecode("OR", 0x44, 3));
addBytecode(new SicBytecode("RD", 0xD8, 3));
addBytecode(new SicBytecode("RMO", 0xAC, 2));
addBytecode(new SicBytecode("RSUB", 0x4C, 3));
addBytecode(new SicBytecode("SHIFTL", 0xA4, 2));
addBytecode(new SicBytecode("SHIFTR", 0xA8, 2));
addBytecode(new SicBytecode("SIO", 0xF0, 1));
addBytecode(new SicBytecode("SSK", 0xEC, 3));
addBytecode(new SicBytecode("STA", 0x0C, 3));
addBytecode(new SicBytecode("STB", 0x78, 3));
addBytecode(new SicBytecode("STCH", 0x54, 3));
addBytecode(new SicBytecode("STF", 0x80, 3));
addBytecode(new SicBytecode("STI", 0xD4, 3));
addBytecode(new SicBytecode("STL", 0x14, 3));
addBytecode(new SicBytecode("STS", 0x7C, 3));
addBytecode(new SicBytecode("STSW", 0xE8, 3));
addBytecode(new SicBytecode("STT", 0x84, 3));
addBytecode(new SicBytecode("STX", 0x10, 3));
addBytecode(new SicBytecode("SUB", 0x1C, 3));
addBytecode(new SicBytecode("SUBF", 0x5C, 3));
addBytecode(new SicBytecode("SUBR", 0x94, 2));
addBytecode(new SicBytecode("SVC", 0xB0, 2));
addBytecode(new SicBytecode("TD", 0xE0, 3));
addBytecode(new SicBytecode("TIO", 0xF8, 1));
addBytecode(new SicBytecode("TIX", 0x2C, 3));
addBytecode(new SicBytecode("TIXR", 0xB8, 2));
addBytecode(new SicBytecode("WD", 0xDC, 3));

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
		// Matches up to 3 characters in an argument (@'EOF')
		const reChar = new RegExp("^(=|#|@)?C'(.{1,3})'(,X)?$");
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
			// convert string into byte array
			let bytes = [];
			for (let i = 0; i < match[2].length; ++i) {
				bytes.push(match[2].charCodeAt(i));
			}
			while (bytes.length < 3) {
				bytes = [0].concat(bytes);
			}

			// now convert byte array into a word
			const x = (bytes[0] << 16) + (bytes[1] << 8) + (bytes[2]);

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
	 * This is equal to the current locctr + the length of this instruction.
	 * @param tagTab A hashtable mapping labels to their corresponding lines of code.
	 * @param litTab A SicLitTab mapping literals to their corresponding lines of code.
	 */
	public makeReady(pc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		// Return if this is already ready.
		if (this.rdy) {
			return;
		}

		// If there is a base, make it ready.
		if (this.base !== undefined && !this.base.ready()) {
			this.base.makeReady(tagTab);
		}

		// If this val is a SicPending
		if (typeof this.val !== "number") {
			// Convert it to a numeric value.
			this.val = (this.val as SicPending).convert(tagTab, litTab);
		}

		// get the correct operand length for the corresponding opcode
		let opLen: number;
		switch (this.type) {
			case SicOpType.f3:
				opLen = 12;
				break;
			case SicOpType.legacy:
				opLen = 15;
				break;
			case SicOpType.f4:
				opLen = 20;
				break;
			default:
				throw new Error("type is not valid");
		}

		// first try pcrel if it is available
		if (this.pcrel) {
			try {
				this.val = sicMakeUnsigned(this.val - pc, opLen);
				this.rdy = true;
				return;
			}
			// if the value cannot fit in a 12-bit signed range
			catch (e) {
				// disable pcrel
				this.pcrel = false;
			}
		}
		// then try baserel if it is available
		if (this.base) {
			try {
				this.val = sicMakeUnsigned(this.val - (this.base.val as number), opLen);
				this.rdy = true;
				return;
			}
			// if the baserel displacement is too high
			catch (e) {
				// disable baserel
				this.base = undefined;
			}
		}

		// finally try direct addressing
		sicCheckUnsigned(this.val, opLen);
		this.rdy = true;
	}

	/**
	 * Returns two bytes corresponding to the nixbpe of this value.
	 * They will have the following format:
	 * [000000ni, xbpe0000]
	 */
	public nixbpe(): number[] {
		if (!this.ready()) {
			throw new Error("nixbpe() can only be called when the value is ready.");
		}

		let n: boolean;
		let i: boolean;
		const x = this.indexed;
		const b = !this.pcrel && this.base !== undefined;
		const p = this.pcrel;
		const e = this.type !== SicOpType.f3;

		switch (this.addr) {
			case SicOpAddrType.direct:
				// n false and i false correspond to a SIC legacy instruction
				if (this.type === SicOpType.legacy) {
					n = false;
					i = false;
				}
				else {
					n = true;
					i = true;
				}
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

/**
 * Interface detailing the methods any bytecode-representable instruction needs to have.
 */
interface ISicInstruction {
	/**
	 * Returns true if this instruction is ready to be used, false if not.
	 */
	ready(): boolean;
	/**
	 * Returns the length in bytes of this instruction.
	 */
	length(): number;
	/**
	 * Converts this instruction into an array of bytes.
	 */
	toBytes(): number[];
	/**
	 * If this instruction is not ready, this method makes it ready.
	 * @param loc The current locctr. Note that this is not the current program counter.
	 * @param tagTab A hashtable mapping labels to their lines of code.
	 * @param litTab A SicLitTab mapping literals to their lines of code.
	 */
	makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void;
}

/**
 * Class corresponding to a Format 1 instruction.
 */
export class SicFormat1 implements ISicInstruction {
	/**
	 * Returns true if the give mnemonic corresponds to a Format 1 instruction.
	 */
	public static isFormat1(mnemonic: string): boolean {
		const bc = bytecodeTable[mnemonic];
		return bc !== undefined && bc.format === 1;
	}

	/**
	 * The opcode of this instruction.
	 */
	public bc: SicBytecode;

	/**
	 * Constructs a SicFormat1 from the given line of code.
	 */
	constructor(line: SicSplit) {
		if (!SicFormat1.isFormat1(line.op)) {
			throw new Error(line.op + " is not a format 1 operation");
		}
		if (line.args !== "") {
			throw new Error("Format 1 arguments cannot have arguments");
		}
		this.bc = bytecodeTable[line.op];
	}

	/**
	 * Required for the ISicInstruction implementation.
	 * This returns true because there are no arguments for a format 1 instruction.
	 */
	public ready(): boolean {
		return true;
	}

	/**
	 * Required for the ISicInstruction implementation.
	 * This is a no-op because there are no arguments for a format 1 instruction.
	 */
	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		return;
	}

	/**
	 * The length of a format 1 instruction is always 1 byte.
	 */
	public length(): number {
		return 1;
	}

	/**
	 * Converts this instruction into its corresponding bytecode.
	 */
	public toBytes(): number[] {
		return [this.bc.opcode];
	}
}

/**
 * A class representing a format 2 instruction.
 */
export class SicFormat2 implements ISicInstruction {
	/**
	 * Returns true if a given mnemonic is a format 2 instruction.
	 */
	public static isFormat2(mnemonic: string) {
		const bc = bytecodeTable[mnemonic];
		return bc !== undefined && bc.format === 2;
	}

	/** The opcode. */
	public bc: SicBytecode;
	/** The first operand. Format 2 instructions cannot use labels or literals. */
	public op1: number;
	/** The second operand. */
	public op2: number;

	/**
	 * Constructs a SicFormat2 from the given line of code.
	 */
	constructor(line: SicSplit) {
		if (!SicFormat2.isFormat2(line.op)) {
			throw new Error(line.op + " is not a format 2 opcode");
		}
		this.bc = bytecodeTable[line.op];

		// The two operands to a format 2 instruction are seperated by a comma.
		const s = line.args.trim().split(/\s*,\s*/);
		// If there is only one operand (CLEAR A).
		if (s.length === 1) {
			// Add a dummy 0 argument.
			s.push("0");
		}
		// If we don't have 2 arguments at this point.
		if (s.length !== 2) {
			throw new Error("This format 2 instruction has an invalid number of operands.");
		}

		const matcher = (str: string): number => {
			// Matches a register argument.
			const reRegister = new RegExp("^(A|X|L|PC|SW|B|S|T|F)$");
			// Matches a hexadecimal argument.
			const reHex = new RegExp("^X'([0-9A-Fa-f]+)'$");
			// Matches a decimal argument.
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

		// Make sure that each operand fits in an unsigned 4-bit range.
		this.op1 = matcher(s[0]);
		sicCheckUnsigned(this.op1, 4);
		this.op2 = matcher(s[1]);
		sicCheckUnsigned(this.op2, 4);
	}

	/**
	 * Required for the ISicInstruction implementation.
	 * Format 2 instructions cannot use labels or literals, so this is always true.
	 */
	public ready(): boolean {
		return true;
	}

	/**
	 * Required for the ISicInstruction implemtnation.
	 * Format 2 instructions cannot use labels or literals, so this is a no-op.
	 */
	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		return;
	}

	/**
	 * Format 2 instructions are always 2 bytes in length.
	 */
	public length(): number {
		return 2;
	}

	/**
	 * Converts this SicFormat2 into ts corresponding bytecode representation.
	 */
	public toBytes(): number[] {
		const bytes = [0x00, 0x00];
		// first byte is just the opcode.
		bytes[0] = this.bc.opcode;
		// first 4 bits of second byte are the first operand
		bytes[1] |= (this.op1 & 0x0F) << 4;
		// last 4 bits of second byte are the second operand
		bytes[1] |= (this.op2 & 0x0F);
		return bytes;
	}
}

/**
 * Class that represents a format 3 instruction.
 */
export class SicFormat3 implements ISicInstruction {
	/**
	 * Returns true if the given mnemonic corresponds to a format 3 instruction.
	 */
	public static isFormat3(mnemonic: string): boolean {
		const bc = bytecodeTable[mnemonic];
		return bc !== undefined && bc.format === 3;
	}

	/** The opcode */
	public bc: SicBytecode;
	/** The operand */
	public op: SicOperandAddr;

	/**
	 * Constructs a SicFormat3 out of a given line of code.
	 * @constructor
	 */
	constructor(line: SicSplit, litSet: SicLitTab, baserel?: SicBase) {
		if (!SicFormat3.isFormat3(line.op)) {
			throw new Error(line.op + " is not format 3");
		}

		this.bc = bytecodeTable[line.op];
		this.op = new SicOperandAddr(line.args, SicOpType.f3, litSet, baserel);
	}

	/**
	 * If the operand is not ready, this function makes it ready.
	 * @see SicOperandAddr.makeReady
	 */
	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		// loc + 3 === pc
		this.op.makeReady(loc + 3, tagTab, litTab);
	}

	/**
	 * Returns true if the operand is ready.
	 */
	public ready(): boolean {
		return this.op.ready();
	}

	/**
	 * A format 3 instruction is always 3 bytes in length.
	 */
	public length(): number {
		return 3;
	}

	/**
	 * Converts this SicFormat3 to its corresponding bytecode.
	 */
	public toBytes(): number[] {
		if (!this.ready()) {
			throw new Error("Internal error: This SicFormat3 instruction is not ready.");
		}
		// get this operand's nixbpe
		const bytes = this.op.nixbpe();
		// place the opcode in the first 6 bits of the first byte
		bytes[0] |= (this.bc.opcode & 0xFC);
		// place the first 4 bits of the address in the last 4 bits of the second byte
		bytes[1] |= ((this.op.val as number) & 0x0F00) >>> 8;
		// set the last byte equal to the last 8 bits of the address
		bytes[2] = ((this.op.val as number) & 0xFF);
		return bytes;
	}
}

/**
 * Class representing a SIC legacy instruction (*LDA)
 */
export class SicFormatLegacy implements ISicInstruction {
	/**
	 * Returns true if the given mnenomic corresponds to a SIC legacy instruction.
	 */
	public static isFormatLegacy(mnemonic: string): boolean {
		// Mnemonic must start with a *.
		if (mnemonic.charAt(0) !== "*") {
			return false;
		}
		// Check if the rest of the string corresponds to a format 3 instruction.
		const bc = bytecodeTable[mnemonic.slice(1)];
		return bc !== undefined && bc.format === 3;
	}

	/** The opcode */
	public bc: SicBytecode;
	/** The operand */
	public op: SicOperandAddr;

	/**
	 * Constructs a SicFormatLegacy out of a given line of code.
	 */
	constructor(line: SicSplit, litList: SicLitTab) {
		if (!SicFormatLegacy.isFormatLegacy(line.op)) {
			throw new Error(line.op + " is not SIC legacy format");
		}

		this.bc = bytecodeTable[line.op.slice(1)];
		this.op = new SicOperandAddr(line.args, SicOpType.legacy, litList);
	}

	/**
	 * Makes the operand ready if it is not already.
	 */
	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		// loc + this.length() === pc
		this.op.makeReady(loc + this.length(), tagTab, litTab);
	}

	/**
	 * Returns true if the operand is ready.
	 */
	public ready(): boolean {
		return this.op.ready();
	}

	/**
	 * SIC legacy instructions are always 3-bytes in length.
	 */
	public length(): number {
		return 3;
	}

	/**
	 * Converts this SicFormatLegacy into its corresponding bytecode.
	 */
	public toBytes(): number[] {
		if (!this.ready()) {
			throw new Error("Internal error: This SicFormatLegacy instruction is not ready.");
		}
		// Get the nixbpe for this operand.
		const bytes = this.op.nixbpe();
		// Place the opcode in the first 6 bits of the first byte.
		bytes[0] |= (this.bc.opcode & 0xFC);
		// Place the first 7 bits of the address into the last 7 bits of the second byte.
		bytes[1] |= ((this.op.val as number) & 0x7F00) >>> 8;
		// Place the last 8 bits of the address into the third byte.
		bytes[2] = ((this.op.val as number) & 0xFF);
		return bytes;
	}
}

/**
 * Class representing a Format 4 instruction.
 */
export class SicFormat4 implements ISicInstruction {
	/**
	 * Returns true if the given mnemonic corresponds to a format 4 instruction.
	 */
	public static isFormat4(mnemonic: string): boolean {
		// first character has to be a "+".
		if (mnemonic.charAt(0) !== "+") {
			return false;
		}
		// check if the rest of the string corresponds to a format 3 instruction.
		const bc = bytecodeTable[mnemonic.slice(1)];
		return bc !== undefined && bc.format === 3;
	}

	/** The opcode */
	public bc: SicBytecode;
	/** The operand */
	public op: SicOperandAddr;

	/**
	 * Constructs a SicFormat4 out of the given line of code.
	 * @constructor
	 * @param line The line of code to convert.
	 * @param litList The current literal tab in use.
	 */
	constructor(line: SicSplit, litList: SicLitTab) {
		if (!SicFormat4.isFormat4(line.op)) {
			throw new Error(line.op + " is not format 4");
		}

		this.bc = bytecodeTable[line.op.slice(1)];
		this.op = new SicOperandAddr(line.args, SicOpType.f4, litList);
	}

	/**
	 * Makes the operand ready if it is not already.
	 */
	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		// loc + this.length() === pc
		this.op.makeReady(loc + this.length(), tagTab, litTab);
	}

	/**
	 * Returns true if the operand is ready.
	 */
	public ready(): boolean {
		return this.op.ready();
	}

	/**
	 * Format 4 instructions are always 4 bytes in length.
	 */
	public length(): number {
		return 4;
	}

	/**
	 * Converts this SicFormat4 into its bytecode representation.
	 */
	public toBytes(): number[] {
		if (!this.ready()) {
			throw new Error("Internal error: This SicFormat4 instruction is not ready.");
		}
		// get the nixbpe
		const bytes = this.op.nixbpe();
		// place the opcode into the first 6 bits of the first byte
		bytes[0] |= (this.bc.opcode & 0xFC);
		// place the first 4 bits of the address into the last 4 bits of the second byte
		bytes[1] |= ((this.op.val as number) & 0x0F0000) >>> 16;
		// place the middle and last 8 bits into the 3rd and 4th bytes respectively
		bytes[2] = ((this.op.val as number) & 0xFF00) >>> 8;
		bytes[3] = ((this.op.val as number) & 0xFF);
		return bytes;
	}
}

/**
 * Class that represents a WORD/BYTE.
 */
export class SicSpace implements ISicInstruction {
	/**
	 * Returns true if the given mnemonic corresponds to a space.
	 */
	public static isSpace(mnemonic: string): boolean {
		const re = new RegExp("^(WORD|BYTE)$");
		return re.test(mnemonic);
	}

	/**
	 * Splits a number into bytes.
	 * @param n The number to split. It must fit in a 24-bit unsigned range.
	 * @returns The given number as a byte array.
	 */
	public static splitWord(n: number): number[] {
		sicCheckUnsigned(n, 24);
		return [(n & 0xFF0000) >>> 16, (n & 0xFF00) >>> 8, (n & 0xFF)];
	}

	/** WORD | BYTE */
	public mnemonic: string;
	/** The bytes of this SicSpace */
	public arg: number[];

	/**
	 * Constructs a SicSpace out of the given line of code.
	 * @constructor
	 * @param line The line of code to parse.
	 */
	constructor(line: SicSplit) {
		if (!SicSpace.isSpace(line.op)) {
			throw new Error("This mnemonic is not a space.");
		}
		this.mnemonic = line.op;

		// matches a decimal argument
		const reDec = new RegExp("^(\\d+)$");
		// matches a hexadecimal argument
		const reHex = new RegExp("^X'([0-9A-Fa-f]+)'$");
		// matches a string
		const reChar = new RegExp("^C'(.+)'$");

		let match: RegExpMatchArray | null;
		if ((match = line.args.match(reDec)) !== null) {
			// convert the decimal to a byte array using splitWord
			this.arg = SicSpace.splitWord(parseInt(match[1], 10));
		}
		else if ((match = line.args.match(reHex)) !== null) {
			// convert the hex to a byte array using splitWord
			this.arg = SicSpace.splitWord(parseInt(match[1], 16));
		}
		else if ((match = line.args.match(reChar)) !== null) {
			this.arg = [];
			// for each character in the string
			for (let i = 0; i < match[1].length; ++i) {
				// push its ascii value
				this.arg.push(match[1].charCodeAt(i));
			}
		}
		else {
			throw new Error(line.args + " is not a valid operand format.");
		}
	}

	/**
	 * Required for the ISicInstruction implementation.
	 * SicSpace instructions cannot use pending values so they are always ready.
	 */
	public ready(): boolean {
		return true;
	}

	/**
	 * Required for the ISicInstruction implementation
	 * SicSpace instructions cannot use pending values so this function is a no-op.
	 */
	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		return;
	}

	/**
	 * Returns the length of this SicSpace in bytes.
	 */
	public length(): number {
		switch (this.mnemonic) {
			case "WORD":
				// The first word must be padded to 3 bytes in length,
				// so the length in bytes is the next highest divisible by 3.
				return this.arg.length + (this.arg.length % 3 !== 0 ? 1 : 0);
			case "BYTE":
				return this.arg.length;
			default:
				throw new Error(this.mnemonic + " is invalid. this is a ultra mega bug");
		}
	}

	/**
	 * Converts this SicSpace into a byte array.
	 */
	public toBytes(): number[] {
		const a: number[] = [];
		switch (this.mnemonic) {
			case "WORD":
				// the first word must be padded to 3 bytes in length
				for (let i = 0; i < this.arg.length % 3; ++i) {
					a.push(0x00);
				}
				// push the rest of the bytes as usual
				this.arg.forEach(val => a.push(val));
				return a;
			case "BYTE":
				return this.arg;
			default:
				throw new Error("Mnemonic is invalid.");
		}
	}
}

/**
 * The most basic ISicInstruction. It just stores a word.
 * This is needed for LTORG.
 */
export class SicLiteral implements ISicInstruction {
	/** The word */
	private val: number;

	/**
	 * Constructs a SicLiteral
	 * @constructor
	 */
	constructor(val: number) {
		this.val = val;
	}

	/**
	 * Required for the ISicInstruction implementation.
	 * Words are always 3 bytes in length.
	 */
	public length(): number {
		return 3;
	}

	/**
	 * Required for the ISicInstruction implementation.
	 * Words are always ready.
	 */
	public ready(): boolean {
		return true;
	}

	/**
	 * Required for the ISicInstruction implementation.
	 * This is a no-op.
	 */
	public makeReady(loc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		return;
	}

	/**
	 * Converts the word to a byte array.
	 */
	public toBytes(): number[] {
		return SicSpace.splitWord(this.val);
	}
}

/**
 * Class that represents a processed line of code.
 */
export class SicLstEntry {
	/** The verbatim source code that made this instruction. */
	public source: string;
	/**
	 * The bytecode data of this instruction.
	 * This can be undefined if this source line does not have a locctr.
	 * @property aloc The absolute line of code of this lst.
	 * @property rloc The relative (USE tab) line of code of this lst.
	 * @property inst The generated instruction. This can be undefined if this lst does not have an instruction.
	 */
	public bcData: { aloc: number, rloc: number, inst: ISicInstruction | undefined } | undefined;
	/** The error message if there is one, or undefined if not. */
	public errmsg: string | undefined;

	/**
	 * Constructs a SicLstEntry
	 * @constructor
	 * @param source The verbatim source code that made this instruction.
	 * @param bcData If this is a string, then it corresponds to an error message.
	 * Otherwise it corresponds to bytecode data.
	 * This can be omitted if the instruction does not have bytecode data.
	 * @see bcData
	 */
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

	/**
	 * Returns true if this lst has an instruction.
	 */
	public hasInstruction(): boolean {
		return this.bcData !== undefined && this.bcData.inst !== undefined;
	}

	/**
	 * Returns the bytecode of this lst if it exists (this.hasInstruction()).
	 */
	public byteCode(): number[] {
		if (!(this.bcData !== undefined && this.bcData.inst !== undefined)) {
			throw new Error("This SicLstEntry does not have an instruction in it");
		}
		return this.bcData.inst.toBytes();
	}

	/**
	 * Returns a string representation of the bytecode of this lst if it exists.
	 */
	public byteString(): string {
		return bytesToString(this.byteCode());
	}
}

/**
 * Class that corresponds to a literal tab for use with LTORG.
 */
export class SicLitTab {
	/**
	 * An array of already placed literals.
	 * @property loc The line of code this literal is placed on.
	 * @property val The value of the literal.
	 */
	public ltorgs: Array<{ loc: number, val: number }>;

	/**
	 * A set of literals that have not yet been placed in the code with LTORG.
	 */
	private pending: Set<number>;

	/**
	 * Constructs a new SicLitTab.
	 * @constructor
	 */
	constructor() {
		this.ltorgs = [];
		this.pending = new Set<number>();
	}

	/**
	 * Gets the closest line of code corresponding to a literal.
	 * @param n The number you are trying to match.
	 * @param pc The current program counter. If this is not specified it defaults to 0.
	 * @returns The closest literal to pc, or null if none exist.
	 */
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

	/**
	 * Creates an LTORG at the given locctr.
	 * @param loc The current locctr to place the LTORG at.
	 * @returns An array containing the contents of the new LTORG.
	 */
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

	/**
	 * Adds a new pending literal if it does not currently exist in the set.
	 */
	public add(n: number): void {
		if (this.getLitLoc(n) === null) {
			this.pending.add(n);
		}
	}

	/**
	 * Returns true if the pending list has the specified number.
	 * If no argument is given, this returns true if there are any literals pending.
	 */
	public hasPending(n?: number): boolean {
		if (n === undefined) {
			return this.pending.size > 0;
		}
		return this.pending.has(n);
	}
}

/**
 * A class corresponding to a USE table.
 * This keeps track of the current relative and absolute lines of code.
 */
export class SicUseTab {
	/**
	 * A hashtable containing previous USEs and their last lines of code.
	 */
	public useTab: { [key: string]: number };
	/**
	 * The current USE as a string.
	 */
	public currentUse: string;
	/**
	 * The starting locctr of the program.
	 * This should be kept constant.
	 */
	private startloc: number;
	/**
	 * A private variable containing the current relative locctr.
	 * This should only be accessed through the .rloc getter.
	 */
	private RLOC: number;
	/**
	 * A private variable containing the current absolute locctr.
	 * This should only be accessed through the .aloc getter.
	 */
	private ALOC: number;

	/**
	 * Constructs a new SicUseTab at the given starting locctr.
	 */
	constructor(startloc: number) {
		this.ALOC = this.RLOC = this.startloc = startloc;
		this.useTab = {};
		// "" is the default USE block.
		this.currentUse = "";
	}

	/**
	 * Returns the absolute locctr.
	 * This is the actual location the code will occupy when turned into bytecode.
	 */
	public get aloc(): number {
		return this.ALOC;
	}

	/**
	 * Returns the relative locctr.
	 * This is the cosmetic location the USE block reports.
	 */
	public get rloc(): number {
		return this.RLOC;
	}

	/**
	 * Increments the locctr by the given value.
	 */
	public inc(n: number): void {
		this.RLOC += n;
		this.ALOC += n;
	}

	/**
	 * Switches the USE block to one of the given label.
	 */
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

/**
 * Class that compiles raw source code into LST and OBJ formats.
 */
export class SicCompiler {
	/** The processed lines of code. */
	private lst: SicLstEntry[];
	/**
	 * If a START directive is given, its data will show up here.
	 * @property name The label given to start.
	 * @property loc The locctr given to start.
	 */
	private startData: { name: string, loc: number } | undefined;

	/** The literal tab in use. */
	private litTab: SicLitTab;
	/** The label tab in use. This is a hashtable mapping strings to numbers. */
	private tagTab: { [key: string]: number };
	/** The EQU tab in use. This is a hashtable mapping strings to strings. */
	private equTab: { [key: string]: string };
	/** The USE tab / locctr tracker. */
	private useTab: SicUseTab;
	/** True if an error was found during compilation. */
	private errflag: boolean;

	/**
	 * Constructs a SicCompiler and compiles the code.
	 * @constructor
	 * @param lines The lines of code to compile.
	 */
	constructor(lines: string[]) {
		let baserel: SicBase | undefined;

		this.lst = [];
		this.tagTab = {};
		this.equTab = {};
		this.useTab = new SicUseTab(0);
		this.litTab = new SicLitTab();
		this.errflag = false;

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
		const directiveOps: { [key: string]: (source: string, split: SicSplit) => void } = {
			RESW: (source: string, split: SicSplit): void => {
				// Make a new lst entry containing locctrs, but no instruction.
				// This is so this RESW can be jumped to.
				this.lst.push(new SicLstEntry(source, { aloc: this.useTab.aloc, rloc: this.useTab.rloc, inst: undefined }));
				// Increment locctr by the correct amount of bytes.
				this.useTab.inc(3 * parseNum(split.args));
			},

			RESB: (source: string, split: SicSplit): void => {
				// Make a new lst entry containing locctrs, but no instruction.
				// This is so this RESB can be jumped to.
				this.lst.push(new SicLstEntry(source, { aloc: this.useTab.aloc, rloc: this.useTab.rloc, inst: undefined }));
				// Increment locctr by the correct amount of bytes.
				this.useTab.inc(parseNum(split.args));
			},

			// TODO fix bug where START can be used multiple times if starting locctr === 0
			START: (source: string, split: SicSplit): void => {
				if (this.useTab.aloc !== 0) {
					throw new Error("START can only be used as the first line of a program.");
				}
				// START arguments are always hexadecimal
				this.useTab = new SicUseTab(parseInt(split.args, 16));
				this.lst.push(new SicLstEntry(source, { aloc: this.useTab.aloc, rloc: this.useTab.rloc, inst: undefined }));
				this.startData = { name: split.tag, loc: this.useTab.aloc };
			},

			// TODO fix bug where this doesn't have to be the final line of code.
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
				// the operand is not numeric, meaning it is a label
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

		// Returns true if a mnemonic corresponds to a compiler directive.
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
					// keep replacing EQU like the prototype chain
					for (let s: string | undefined = this.equTab[key]; s !== undefined; s = this.equTab[s]) {
						split.args = split.args.replace(key, this.equTab[key]);
					}
					break;
				}

				// if this line has a label, add it to the label tab
				if (split.tag !== undefined) {
					this.tagTab[split.tag] = this.useTab.aloc;
				}

				// if this line is a directive, process the directive and continue.
				if (isDirective(split.op)) {
					directiveOps[split.op](val, split);
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

				// add the instruction to the lst
				this.lst.push(new SicLstEntry(val, { aloc: this.useTab.aloc, rloc: this.useTab.rloc, inst: instr }));
				// increment usetab accordingly
				this.useTab.inc(instr.length());
			}
			// if there was an error
			catch (e) {
				this.errflag = true;
				// report it
				this.lst.push(new SicLstEntry(val, (e as Error).message));
			}
		});

		// add final ltorg if literals are not in one
		if (this.litTab.hasPending()) {
			directiveOps["LTORG"]("AUTO-LTORG", new SicSplit("\tAUTO-LTORG"));
		}

		// pass 2
		this.lst.forEach(l => {
			// make all pending instructions ready
			if (l.bcData !== undefined && l.bcData.inst !== undefined && !l.bcData.inst.ready()) {
				l.bcData.inst.makeReady(l.bcData.aloc, this.tagTab, this.litTab);
			}
		});
	}

	/**
	 * Creates an LST out of the processed lines of code.
	 */
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

			let msg = istr.padEnd(5, " ") + "\t" +
				astr.padEnd(5, " ") + "\t" +
				rstr.padEnd(5, " ") + "\t" +
				inststr.padEnd(8, " ") + "\t" +
				ls.source;

			if (ls.errmsg !== undefined) {
				msg += "\n*error: " + ls.errmsg + "*";
			}

			return msg;
		}));
	}

	/**
	 * Creates an OBJ out of the lines of code.
	 */
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

	/**
	 * True if there was an error during compilation.
	 */
	public get err() {
		return this.errflag;
	}

	/**
	 * Converts the lines of code to raw bytes.
	 */
	public toBytes(): number[][] {
		return this.lst.filter(l => l.hasInstruction()).map(l => l.byteCode());
	}
}

/**
 * Converts a register name to a numeric value.
 */
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

/**
 * Converts a numeric value to a register name.
 */
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
