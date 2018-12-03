/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { SicPending } from "./SicPending";

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
