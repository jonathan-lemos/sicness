/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { ISicInstruction } from "./ISicInstruction";
import { bytesToString } from "./SicFmt";
import { SicLocPair } from "./SicUseTab";

/**
 * Class that represents a processed line of code.
 */
export class SicLstEntry {
	/** The label of this line, or "" if there isn't one. */
	public tag: string;
	/** The verbatim source code that made this instruction. */
	public source: string;
	/**
	 * The bytecode data of this instruction.
	 * This can be undefined if this source line does not have a locctr.
	 * @property aloc The absolute line of code of this lst.
	 * @property rloc The relative (USE tab) line of code of this lst.
	 * @property inst The generated instruction. This can be undefined if this lst does not have an instruction.
	 */
	public bcData: { loc: SicLocPair, inst: ISicInstruction | undefined } | undefined;
	/** The error message if there is one, or undefined if not. */
	public errmsg: string | undefined;

	/**
	 * Constructs a SicLstEntry
	 * @constructor
	 * @param source The verbatim source code that made this instruction.
	 * @param bcData If this is a string, then it corresponds to an error message.
	 * Otherwise it corresponds to bytecode data.
	 * This can be omitted if the instruction does not have bytecode data.
	 * @see bcData
	 */
	constructor(tag: string, source: string, bcData?: { loc: SicLocPair, inst: ISicInstruction | undefined } | string) {
		this.tag = tag;
		this.source = source;
		if (typeof bcData === "string") {
			this.bcData = undefined;
			this.errmsg = bcData;
		}
		else {
			this.bcData = bcData;
			this.errmsg = undefined;
		}
	}

	/**
	 * Returns true if this lst has an instruction.
	 */
	public hasInstruction(): boolean {
		return this.bcData !== undefined && this.bcData.inst !== undefined;
	}

	/**
	 * Returns the bytecode of this lst if it exists (this.hasInstruction()).
	 */
	public byteCode(): number[] {
		if (!(this.bcData !== undefined && this.bcData.inst !== undefined)) {
			throw new Error("This SicLstEntry does not have an instruction in it");
		}
		return this.bcData.inst.toBytes();
	}

	/**
	 * Returns a string representation of the bytecode of this lst if it exists.
	 */
	public byteString(): string {
		return bytesToString(this.byteCode());
	}
}
