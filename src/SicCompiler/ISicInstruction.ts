/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { SicLitTab } from "./SicLitTab";

/**
 * Interface detailing the methods any bytecode-representable instruction needs to have.
 */
export interface ISicInstruction {
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
