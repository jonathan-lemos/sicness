/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { ISicInstruction } from "./ISicInstruction";
import { bytecodeTable, SicBytecode } from "./SicBytecode";
import { SicLitTab } from "./SicLitTab";
import { SicSplit } from "./SicSplit";

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
	public makeReady(
		loc: number,
		tagTab: { [key: string]: number },
		litTab: SicLitTab,
		extRefTab: Set<string>,
		): string | null {
		return null;
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
