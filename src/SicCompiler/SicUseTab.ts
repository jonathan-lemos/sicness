/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

/**
 * A locctr pair.
 */
export class SicLocPair {
	public a: number;
	public r: number;

	constructor(aloc: number, rloc?: number) {
		this.a = aloc;
		this.r = rloc === undefined ? aloc : rloc;
	}
}

/**
 * A class corresponding to a USE table.
 * This keeps track of the current relative and absolute lines of code.
 */
export class SicUseTab {
	/**
	 * A hashtable containing previous USEs and their last lines of code.
	 */
	public useTab: Array<{label: string, rloc: number, locsent: SicLocPair[]}>;
	/**
	 * The current USE as an array index.
	 */
	public currentUse: number;
	/**
	 * The absolute line of code of the program.
	 */
	private ALOC: number;
	/**
	 * Filled in once this SicUseTab is corrected.
	 */
	private finalPair: SicLocPair | undefined;

	/**
	 * Constructs a new SicUseTab at the given starting locctr.
	 */
	constructor(startloc: number) {
		this.ALOC = startloc;
		this.useTab = [{label: "", rloc: startloc, locsent: []}];
		this.currentUse = 0;
	}

	/**
	 * Returns the absolute locctr.
	 * This is the actual location the code will occupy when turned into bytecode.
	 */
	public get aloc(): number {
		return this.ALOC;
	}

	/**
	 * Returns the relative locctr.
	 * This is the cosmetic location the USE block reports.
	 */
	public get rloc(): number {
		return this.current.rloc;
	}

	/**
	 * Returns a SicLocPair corresponding to the current locctr.
	 */
	public loc(): SicLocPair {
		if (this.finalPair !== undefined) {
			return this.finalPair;
		}
		const l = new SicLocPair(this.ALOC, this.current.rloc);
		this.current.locsent.push(l);
		return l;
	}

	/**
	 * Increments the locctr by the given value.
	 */
	public inc(n: number): void {
		this.current.rloc += n;
		this.ALOC += n;
	}

	/**
	 * Switches the USE block to one of the given label.
	 */
	public use(label: string): void {
		const index = this.find(label);
		if (index === null) {
			this.useTab.push({label, rloc: 0, locsent: []});
			this.currentUse = this.useTab.length - 1;
		}
		else {
			this.currentUse = index;
		}
	}

	public correct(): void {
		if (this.finalPair !== undefined) {
			return;
		}

		let prev = this.current.rloc;
		for (let i = 1; i < this.useTab.length; ++i) {
			this.useTab[i].locsent.forEach(l => l.r += prev);
			prev += this.useTab[i].rloc;
		}
		this.finalPair = new SicLocPair(this.aloc, prev);
	}

	private find(label: string): number | null {
		for (let i = 0; i < this.useTab.length; ++i) {
			if (this.useTab[i].label === label) {
				return i;
			}
		}
		return null;
	}

	private get current(): { label: string, rloc: number, locsent: SicLocPair[] } {
		return this.useTab[this.currentUse];
	}
}
