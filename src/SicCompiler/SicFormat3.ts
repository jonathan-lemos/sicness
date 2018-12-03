/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { ISicInstruction } from "./ISicInstruction";
import { bytecodeTable, SicBytecode } from "./SicBytecode";
import { SicSplit } from "./SicSplit";

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
	constructor(line: SicSplit, csect: SicCsect) {
		if (!SicFormat3.isFormat3(line.op)) {
			throw new Error(line.op + " is not format 3");
		}

		this.bc = bytecodeTable[line.op];
		this.op = new SicOperandAddr(line.args, SicOpType.f3, csect);
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
