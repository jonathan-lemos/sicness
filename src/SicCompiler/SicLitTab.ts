/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

/**
 * Class that corresponds to a literal tab for use with LTORG.
 */
export class SicLitTab {
	/**
	 * An array of already placed literals.
	 * @property loc The line of code this literal is placed on.
	 * @property val The value of the literal.
	 */
	public ltorgs: Array<{ loc: number, val: number }>;

	/**
	 * A set of literals that have not yet been placed in the code with LTORG.
	 */
	private pending: Set<number>;

	/**
	 * Constructs a new SicLitTab.
	 * @constructor
	 */
	constructor() {
		this.ltorgs = [];
		this.pending = new Set<number>();
	}

	/**
	 * Gets the closest line of code corresponding to a literal.
	 * @param n The number you are trying to match.
	 * @param pc The current program counter. If this is not specified it defaults to 0.
	 * @returns The closest literal to pc, or null if none exist.
	 */
	public getLitLoc(n: number, pc: number = 0): number | null {
		let diffMin = Number.MAX_SAFE_INTEGER;
		let loc: number | null = null;
		this.ltorgs.forEach(lt => {
			if (lt.val === n && diffMin > Math.min(lt.loc - pc, lt.loc)) {
				diffMin = Math.min(lt.loc - pc, lt.loc);
				loc = lt.loc;
			}
		});
		return loc;
	}

	/**
	 * Creates an LTORG at the given locctr.
	 * @param loc The current locctr to place the LTORG at.
	 * @returns An array containing the contents of the new LTORG.
	 */
	public createOrg(loc: number): Array<{ loc: number, val: number }> {
		let l = loc;
		const m: Array<{ loc: number, val: number }> = [];
		const lt = this.pending.forEach(v => {
			m.push({ loc: l, val: v });
			l += 3;
		});
		this.ltorgs = this.ltorgs.concat(m);
		this.pending = new Set<number>();
		return m;
	}

	/**
	 * Adds a new pending literal if it does not currently exist in the set.
	 */
	public add(n: number): void {
		if (this.getLitLoc(n) === null) {
			this.pending.add(n);
		}
	}

	/**
	 * Returns true if the pending list has the specified number.
	 * If no argument is given, this returns true if there are any literals pending.
	 */
	public hasPending(n?: number): boolean {
		if (n === undefined) {
			return this.pending.size > 0;
		}
		return this.pending.has(n);
	}
}
