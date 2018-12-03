/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

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
