/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { ISicInstruction } from "./ISicInstruction";
import { SicLitTab } from "./SicLitTab";
import { SicSplit } from "./SicSplit";
import { sicCheckUnsigned, sicMakeUnsigned } from "./SicUnsigned";

/**
 * Class that represents a WORD/BYTE.
 */
export class SicSpace implements ISicInstruction {
	/**
	 * Returns true if the given mnemonic corresponds to a space.
	 */
	public static isSpace(mnemonic: string): boolean {
		const re = new RegExp("^(WORD|BYTE)$");
		return re.test(mnemonic);
	}

	/**
	 * Splits a word into bytes.
	 * @param n The number to split. It must fit in a 24-bit range.
	 * @returns The given number as a byte array.
	 */
	public static splitWord(n: number): number[] {
		if (n >= 0) {
			sicCheckUnsigned(n, 24);
		}
		else {
			n = sicMakeUnsigned(n, 24);
		}
		return [(n & 0xFF0000) >>> 16, (n & 0xFF00) >>> 8, (n & 0xFF)];
	}

	/**
	 * Converts a byte into word form.
	 * @param n The number to split. It must fit in an 8-bit range.
	 * @returns The given number as a byte array.
	 */
	public static splitByte(n: number): number[] {
		if (n >= 0) {
			sicCheckUnsigned(n, 8);
		}
		else {
			n = sicMakeUnsigned(n, 8);
		}
		return [0, 0, n];
	}

	/** WORD | BYTE */
	public mnemonic: string;
	/** The bytes of this SicSpace */
	public arg: number[];

	/**
	 * Constructs a SicSpace out of the given line of code.
	 * @constructor
	 * @param line The line of code to parse.
	 */
	constructor(line: SicSplit) {
		if (!SicSpace.isSpace(line.op)) {
			throw new Error("This mnemonic is not a space.");
		}
		this.mnemonic = line.op;
		const func = this.mnemonic === "BYTE" ? SicSpace.splitByte : SicSpace.splitWord;

		// matches a decimal argument
		const reDec = new RegExp("^(-?\\d+)$");
		// matches a hexadecimal argument
		const reHex = new RegExp("^X'([0-9A-Fa-f]+)'$");
		// matches a string
		const reChar = new RegExp("^C'(.+)'$");

		let match: RegExpMatchArray | null;
		if ((match = line.args.match(reDec)) !== null) {
			// convert the decimal to a byte array using splitWord
			this.arg = func(parseInt(match[1], 10));
		}
		else if ((match = line.args.match(reHex)) !== null) {
			// convert the hex to a byte array using splitWord
			this.arg = func(parseInt(match[1], 16));
		}
		else if ((match = line.args.match(reChar)) !== null) {
			this.arg = [];
			// for each character in the string
			for (let i = 0; i < match[1].length; ++i) {
				// push its ascii value
				this.arg.push(match[1].charCodeAt(i));
			}
		}
		else {
			throw new Error(line.args + " is not a valid operand format.");
		}
	}

	/**
	 * Required for the ISicInstruction implementation.
	 * SicSpace instructions cannot use pending values so they are always ready.
	 */
	public ready(): boolean {
		return true;
	}

	/**
	 * Required for the ISicInstruction implementation
	 * SicSpace instructions cannot use pending values so this function is a no-op.
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
	 * Returns the length of this SicSpace in bytes.
	 */
	public length(): number {
		switch (this.mnemonic) {
			case "WORD":
				// The first word must be padded to 3 bytes in length,
				// so the length in bytes is the next highest divisible by 3.
				return this.arg.length + (this.arg.length % 3 !== 0 ? 1 : 0);
			case "BYTE":
				return this.arg.length;
			default:
				throw new Error(this.mnemonic + " is invalid. this is a ultra mega bug");
		}
	}

	/**
	 * Converts this SicSpace into a byte array.
	 */
	public toBytes(): number[] {
		const a: number[] = [];
		switch (this.mnemonic) {
			case "WORD":
				// the first word must be padded to 3 bytes in length
				for (let i = 0; i < this.arg.length % 3; ++i) {
					a.push(0x00);
				}
				// push the rest of the bytes as usual
				this.arg.forEach(val => a.push(val));
				return a;
			case "BYTE":
				return this.arg;
			default:
				throw new Error("Mnemonic is invalid.");
		}
	}
}
