/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { ISicInstruction } from "./ISicInstruction";
import { bytecodeTable, SicBytecode } from "./SicBytecode";
import { SicLitTab } from "./SicLitTab";
import { sicRegToDec } from "./SicRegConvert";
import { SicSplit } from "./SicSplit";
import { sicCheckUnsigned } from "./SicUnsigned";

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
