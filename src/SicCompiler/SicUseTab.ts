/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

/**
 * A class corresponding to a USE table.
 * This keeps track of the current relative and absolute lines of code.
 */
export class SicUseTab {
	/**
	 * A hashtable containing previous USEs and their last lines of code.
	 */
	public useTab: { [key: string]: number };
	/**
	 * The current USE as a string.
	 */
	public currentUse: string;
	/**
	 * The starting locctr of the program.
	 * This should be kept constant.
	 */
	private startloc: number;
	/**
	 * A private variable containing the current relative locctr.
	 * This should only be accessed through the .rloc getter.
	 */
	private RLOC: number;
	/**
	 * A private variable containing the current absolute locctr.
	 * This should only be accessed through the .aloc getter.
	 */
	private ALOC: number;

	/**
	 * Constructs a new SicUseTab at the given starting locctr.
	 */
	constructor(startloc: number) {
		this.ALOC = this.RLOC = this.startloc = startloc;
		this.useTab = {};
		// "" is the default USE block.
		this.currentUse = "";
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
		return this.RLOC;
	}

	/**
	 * Increments the locctr by the given value.
	 */
	public inc(n: number): void {
		this.RLOC += n;
		this.ALOC += n;
	}

	/**
	 * Switches the USE block to one of the given label.
	 */
	public use(label: string) {
		this.useTab[this.currentUse] = this.RLOC;
		this.currentUse = label;
		let x = this.useTab[label];
		if (x === undefined) {
			x = this.startloc;
		}
		this.RLOC = x;
	}
}
