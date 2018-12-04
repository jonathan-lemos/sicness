/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

/**
 * Class that splits a raw line of code into its label, operand, and optional arguments.
 */
export class SicSplit {
	/** The label of this split. This is "" if there is none. */
	public tag: string;
	/** The operand of this split. This cannot be "". */
	public op: string;
	/** The arguments of this split. If there is more than one, they are concatenated into one string. */
	public args: string;

	/**
	 * Constructs a SicSplit
	 * @constructor
	 * @param line The raw line of code to split.
	 */
	constructor(line: string) {
		// Remove all comments from the line and convert it to uppercase.
		// Comments start with a '.', and this regex removes all characters from a literal dot to the end of line.
		line = line.replace(/\..*$/, "").toUpperCase();

		// Split the line by any amount of whitespace.
		// If the line starts with whitespace, the first entry of the array will be "".
		const lineArr = line.split(/\s+/);
		if (lineArr.length <= 1) {
			throw new Error(
				"This line does not have the correct number of entries. Did you forget to put whitespace before the operand?");
		}
		this.tag = lineArr[0];
		this.op = lineArr[1];
		// If there is more than one argument.
		// TODO: parse these individually.
		if (lineArr.length >= 3) {
			// Concatenate all of them into one string.
			this.args = lineArr.slice(2).reduce((acc, val) => acc + val, "");
		}
		else {
			this.args = "";
		}

		if (this.tag !== "" && this.tag.match(/^[A-Z][A-Z0-9]*$/) === null) {
			throw new Error(`Labels must start with A-Z (found "${this.tag}")`);
		}
	}
}
