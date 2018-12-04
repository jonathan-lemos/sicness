/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { ISicInstruction } from "./ISicInstruction";
import { bytecodeTable, SicBytecode } from "./SicBytecode";
import { SicCsect } from "./SicCsect";
import { SicLitTab } from "./SicLitTab";
import { SicOperandAddr, SicOpType } from "./SicOperandAddr";
import { SicSplit } from "./SicSplit";

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
	constructor(line: SicSplit, csect: SicCsect) {
		if (!SicFormatLegacy.isFormatLegacy(line.op)) {
			throw new Error(line.op + " is not SIC legacy format");
		}

		this.bc = bytecodeTable[line.op.slice(1)];
		this.op = new SicOperandAddr(line.args, SicOpType.legacy, csect);
	}

	/**
	 * Makes the operand ready if it is not already.
	 */
	public makeReady(
		loc: number,
		tagTab: { [key: string]: number },
		litTab: SicLitTab,
		extRefTab: Set<string>,
		): string | null {
		// loc + this.length() === pc
		return this.op.makeReady(loc + this.length(), tagTab, litTab, extRefTab);
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
