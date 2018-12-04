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
	constructor(line: SicSplit, csect: SicCsect) {
		if (!SicFormat4.isFormat4(line.op)) {
			throw new Error(line.op + " is not format 4");
		}

		this.bc = bytecodeTable[line.op.slice(1)];
		this.op = new SicOperandAddr(line.args, SicOpType.f4, csect);
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
