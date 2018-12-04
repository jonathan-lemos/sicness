/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { SicBase } from "./SicBase";
import { SicCsect } from "./SicCsect";
import { SicLitTab } from "./SicLitTab";
import { SicPending } from "./SicPending";
import { sicCheckUnsigned, sicMakeUnsigned } from "./SicUnsigned";

/**
 * Represents an addressing type for format 3/4 operands.
 */
export enum SicOpAddrType {
	immediate,
	direct,
	indirect,
}

/**
 * Represents an opcode type.
 */
export enum SicOpType {
	f3,
	f4,
	legacy,
}

/**
 * Represents a format 3/legacy/4 operand.
 */
export class SicOperandAddr {
	/**
	 * The value of this operand.
	 * If this value is a SicPending, it needs to be converted to number before being used.
	 */
	public val: number | SicPending;
	/**
	 * The opcode type that this operand is mapped to (format 3/legacy/4).
	 */
	public type: SicOpType;
	/**
	 * The addressing type of this operand (immediate/direct/indirect).
	 */
	public addr: SicOpAddrType;
	/**
	 * True if this operand uses the index register (X).
	 */
	public indexed: boolean;
	/**
	 * A corresponding SicBase if this operand can use base-relative, undefined if not.
	 */
	public base: SicBase | undefined;
	/**
	 * True if this operand can use pc-relative.
	 */
	public pcrel: boolean;
	/**
	 * True if this operand is ready to convert into bytecode.
	 */
	private rdy: boolean;

	/**
	 * Constructs a SicOperandAddr.
	 * @param arg The argument as a string.
	 * @param type The type of opcode it should be mapped to (format 3/legacy/4).
	 * @param litList The current LITTAB in use. If this argument is a literal it will be added to the pending list.
	 * @param baserel An optional SicBase denoting that this operand can use base-relative addressing.
	 */
	constructor(arg: string, type: SicOpType, csect: SicCsect) {
		// Matches a decimal argument (@1234).
		const reDecimal = new RegExp("^(=|#|@)?(-?\\d+)(,X)?$");
		// Matches a hexadecimal argument (@X'1ABC')
		const reHex = new RegExp("^(=|#|@)?X'([0-9A-F]+)'(,X)?$");
		// Matches up to 3 characters in an argument (@'EOF')
		const reChar = new RegExp("^(=|#|@)?C'(.{1,3})'(,X)?$");
		// Matches a label argument (@VAL)
		const reTag = new RegExp("^(#|@)?([A-Z]+)(,X)?$");

		// For all of the above regexes:
		// match[0] === The raw input string
		// match[1] === "=", "#", "@", or undefined.
		// match[2] === The actual contents of the match.
		// match[3] === ",X", or undefined.

		// Converts match[1] to the correct addressing type.
		const getType = (char: string): SicOpAddrType => {
			switch (char) {
				case "#":
					return SicOpAddrType.immediate;
				case "@":
					return SicOpAddrType.indirect;
				case "=":
				default:
					return SicOpAddrType.direct;
			}
		};

		// Returns true if match[1] points to a literal.
		const isLiteral = (c: string): boolean => c !== undefined && c.charAt(0) === "=";

		this.type = type;
		// Only format 3 can use base-relative addressing.
		this.base = this.type === SicOpType.f3 ? csect.base : undefined;
		// Only format 3 can use pc-relative addressing.
		this.pcrel = this.type === SicOpType.f3;

		let match: RegExpMatchArray | null;
		if ((match = arg.match(reDecimal)) !== null) {
			// Parse the second part of this operand as a decimal.
			const x = parseInt(match[2], 10);
			// If the argument is a literal.
			if (isLiteral(match[1])) {
				// Add this literal to the pending list if it is not already there.
				csect.litTab.add(x);
				// Set this value to a new SicPending corresponding to the literal.
				this.val = new SicPending(x);
			}
			else {
				// Set this value to the raw number.
				this.val = x;
				// Raw numeric arguments do not use pc-relative addressing.
				this.pcrel = false;
				this.base = undefined;
			}
		}
		else if ((match = arg.match(reHex)) !== null) {
			// Parse the second part of this operand as hexadecimal.
			const x = parseInt(match[2], 16);
			// If the argument is a literal.
			if (isLiteral(match[1])) {
				// Add this literal to the pending list if it is not already there.
				csect.litTab.add(x);
				// Set this value to a new SicPending corresponding to the literal.
				this.val = new SicPending(x);
			}
			else {
				// Set this value to the raw number.
				this.val = x;
				// Raw numeric arguments do not use pc-relative addressing.
				this.pcrel = false;
				this.base = undefined;
			}
		}
		else if ((match = arg.match(reChar)) !== null) {
			// convert string into byte array
			let bytes = [];
			for (let i = 0; i < match[2].length; ++i) {
				bytes.push(match[2].charCodeAt(i));
			}
			while (bytes.length < 3) {
				bytes = [0].concat(bytes);
			}

			// now convert byte array into a word
			const x = (bytes[0] << 16) + (bytes[1] << 8) + (bytes[2]);

			// If the argument is a literal.
			if (isLiteral(match[1])) {
				// Add this literal to the pending list if it is not already there.
				csect.litTab.add(x);
				// Set this value to a new SicPending corresponding to the literal.
				this.val = new SicPending(x);
			}
			else {
				// Set this value to the raw number.
				this.val = x;
				// Raw numeric arguments do not use pc-relative addressing.
				this.pcrel = false;
				this.base = undefined;
			}
		}
		else if ((match = arg.match(reTag)) != null) {
			if (csect.extRefTab.has(match[2])) {
				if (this.type !== SicOpType.f4) {
					throw new Error("EXTREF symbols can only be used with format 4");
				}
				csect.modRecs.push({loc: csect.useTab.aloc, len: 5, symbol: match[2]});
				this.val = 0;
				this.pcrel = false;
			}
			else {
				// Set this value to a new SicPending corresponding to the label.
				this.val = new SicPending(match[2]);
			}
		}
		else {
			throw new Error("Operand " + arg + " is not of any valid format.");
		}
		// Set this addressing mode based on @/=.
		this.addr = getType(match[1]);
		// Indexing is true if ",X" was matched at the end of the string.
		this.indexed = match[3] != null;

		// If @ or # is used with a SIC legacy opcode.
		if (this.addr !== SicOpAddrType.direct && this.type === SicOpType.legacy) {
			throw new Error("SIC Legacy instructions can only use direct addressing");
		}

		// If this is not pcrel, not baserel, and not pending, it is ready.
		this.rdy = !this.pcrel &&
			this.base === undefined &&
			typeof this.val === "number";
	}

	/**
	 * Returns true if this SicOperandAddr is ready to be used.
	 * @see makeReady
	 */
	public ready(): boolean {
		return this.rdy;
	}

	/**
	 * If this SicOperandAddr is not ready, this method makes it ready.
	 * @param pc The current program counter when the corresponding instruction is executed.
	 * This is equal to the current locctr + the length of this instruction.
	 * @param tagTab A hashtable mapping labels to their corresponding lines of code.
	 * @param litTab A SicLitTab mapping literals to their corresponding lines of code.
	 */
	public makeReady(pc: number, tagTab: { [key: string]: number }, litTab: SicLitTab): void {
		// Return if this is already ready.
		if (this.rdy) {
			return;
		}

		// If there is a base, make it ready.
		if (this.base !== undefined && !this.base.ready()) {
			this.base.makeReady(tagTab);
		}

		// If this val is a SicPending
		if (typeof this.val !== "number") {
			// Convert it to a numeric value.
			this.val = (this.val as SicPending).convert(tagTab, litTab);
		}

		// get the correct operand length for the corresponding opcode
		let opLen: number;
		switch (this.type) {
			case SicOpType.f3:
				opLen = 12;
				break;
			case SicOpType.legacy:
				opLen = 15;
				break;
			case SicOpType.f4:
				opLen = 20;
				break;
			default:
				throw new Error("type is not valid");
		}

		// first try pcrel if it is available
		if (this.pcrel) {
			try {
				this.val = sicMakeUnsigned(this.val - pc, opLen);
				this.rdy = true;
				return;
			}
			// if the value cannot fit in a 12-bit signed range
			catch (e) {
				// disable pcrel
				this.pcrel = false;
			}
		}
		// then try baserel if it is available
		if (this.base) {
			try {
				this.val = sicMakeUnsigned(this.val - (this.base.val as number), opLen);
				this.rdy = true;
				return;
			}
			// if the baserel displacement is too high
			catch (e) {
				// disable baserel
				this.base = undefined;
			}
		}

		// finally try direct addressing
		sicCheckUnsigned(this.val, opLen);
		this.rdy = true;
	}

	/**
	 * Returns two bytes corresponding to the nixbpe of this value.
	 * They will have the following format:
	 * [000000ni, xbpe0000]
	 */
	public nixbpe(): number[] {
		if (!this.ready()) {
			throw new Error("nixbpe() can only be called when the value is ready.");
		}

		let n: boolean;
		let i: boolean;
		const x = this.indexed;
		const b = !this.pcrel && this.base !== undefined;
		const p = this.pcrel;
		const e = this.type === SicOpType.f4;

		switch (this.addr) {
			case SicOpAddrType.direct:
				// n false and i false correspond to a SIC legacy instruction
				if (this.type === SicOpType.legacy) {
					n = false;
					i = false;
				}
				else {
					n = true;
					i = true;
				}
				break;
			case SicOpAddrType.indirect:
				n = true;
				i = false;
				break;
			case SicOpAddrType.immediate:
				n = false;
				i = true;
				break;
			default:
				throw new Error("Registers do not have an nixbpe value");
		}

		const bytes = [0x0, 0x0];
		if (n) {
			bytes[0] |= 0x2;
		}
		if (i) {
			bytes[0] |= 0x1;
		}
		if (x) {
			bytes[1] |= 0x80;
		}
		if (b) {
			bytes[1] |= 0x40;
		}
		if (p) {
			bytes[1] |= 0x20;
		}
		if (e) {
			bytes[1] |= 0x10;
		}
		return bytes;
	}
}
