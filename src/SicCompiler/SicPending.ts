/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { SicLitTab } from "./SicLitTab";

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
	 * @param returns Number if this was converted successfully. String if this is an extref.
	 */
	public convert(
		tagTab: {[key: string]: number} | null,
		litTab: SicLitTab | null,
		extRefTab: Set<string> | null,
		): number | string {
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
			return s;
		}
		// Otherwise this is a label.

		// If this is an extref.
		if (extRefTab !== null && extRefTab.has(this.val)) {
			return this.val;
		}

		// Otherwise search the tag table.
		if (tagTab === null) {
			throw new Error("tagTab is undefined but this SicPending is a tag");
		}
		s = tagTab[this.val];
		if (s === null) {
			throw new Error(this.val + "was not found in the tag table");
		}
		return s;
	}
}
