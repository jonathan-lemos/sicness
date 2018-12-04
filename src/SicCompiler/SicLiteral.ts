/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { ISicInstruction } from "./ISicInstruction";
import { SicLitTab } from "./SicLitTab";
import { SicSpace } from "./SicSpace";

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
	public makeReady(
		loc: number,
		tagTab: { [key: string]: number },
		litTab: SicLitTab,
		extRefTab: Set<string>,
		): string | null {
		return null;
	}

	/**
	 * Converts the word to a byte array.
	 */
	public toBytes(): number[] {
		return SicSpace.splitWord(this.val);
	}
}
