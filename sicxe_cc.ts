/*
* Copyright (c) 2018 Jonathan Lemos
 * 
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

export const __sic_make_mask = (n_bits: number): number => {
	let m = 0x0;
	for (let i = 0; i < n_bits; ++i){
		m |= (1 << i);
	}
	return m;
}

export const __sic_check_unsigned = (val: number, n_bits: number): void => {
	if (val < 0x0 || val > __sic_make_mask(n_bits)){
		throw "val does not fit in an " + n_bits + "-bit range";
	}
}

export const __sic_make_unsigned = (val: number, n_bits: number): number => {
	if (val < -__sic_make_mask(n_bits - 1) - 1 || val > __sic_make_mask(n_bits)) {
		throw val + " does not fit in an " + n_bits + "-bit range";
	}

	val >>>= 0;
	val &= __sic_make_mask(n_bits);
	return val;
}

export class sic_split {
	tag: string;
	op: string;
	args: string;
	str: string;

	constructor(line: string) {
		let line_arr = line.split(/\s+/);
		if (line_arr.length <= 1) {
			throw "line_arr does not have the required 2 entries";
		}
		this.tag = line_arr[0];
		this.op = line_arr[1];
		if (line_arr.length >= 3) {
			this.args = line_arr.slice(2).reduce((acc, val) => acc + val);
		}
		else {
			this.args = "";
		}
		this.str = line;
	}
}

interface IDictionary {
	[index: string]: number;
}

export class sic_bytecode {
	opcode: number;
	format: number;
	mnemonic: string;

	constructor(mnemonic: string) {
		let format4flag = mnemonic.startsWith('+');
		if (format4flag) {
			mnemonic = mnemonic.slice(1);
		}
		this.mnemonic = mnemonic;

		switch (mnemonic) {
			case "ADD":
				this.opcode = 0x18;
				this.format = 3;
				break;
			case "ADDF":
				this.opcode = 0x58;
				this.format = 3;
				break;
			case "ADDR":
				this.opcode = 0x90;
				this.format = 2;
				break;
			case "AND":
				this.opcode = 0x40;
				this.format = 3;
				break;
			case "CLEAR":
				this.opcode = 0xB4;
				this.format = 2;
				break;
			case "COMP":
				this.opcode = 0x28;
				this.format = 3;
				break;
			case "COMPF":
				this.opcode = 0x88;
				this.format = 3;
				break;
			case "COMPR":
				this.opcode = 0xA0;
				this.format = 2;
				break;
			case "DIV":
				this.opcode = 0x24;
				this.format = 3;
				break;
			case "DIVF":
				this.opcode = 0x64;
				this.format = 3;
				break;
			case "DIVR":
				this.opcode = 0x9C;
				this.format = 2;
				break;
			case "FIX":
				this.opcode = 0xC4;
				this.format = 1;
				break;
			case "FLOAT":
				this.opcode = 0xC0;
				this.format = 1;
				break;
			case "HIO":
				this.opcode = 0xF4;
				this.format = 1;
				break;
			case "J":
				this.opcode = 0x3C;
				this.format = 3;
				break;
			case "JEQ":
				this.opcode = 0x30;
				this.format = 3;
				break;
			case "JLT":
				this.opcode = 0x38;
				this.format = 3;
				break;
			case "JSUB":
				this.opcode = 0x48;
				this.format = 3;
				break;
			case "LDA":
				this.opcode = 0x00;
				this.format = 3;
				break;
			case "LDB":
				this.opcode = 0x68;
				this.format = 3;
				break;
			case "LDCH":
				this.opcode = 0x50;
				this.format = 3;
				break;
			case "LDF":
				this.opcode = 0x70;
				this.format = 3;
				break;
			case "LDL":
				this.opcode = 0x08;
				this.format = 3;
				break;
			case "LDS":
				this.opcode = 0x6C;
				this.format = 3;
				break;
			case "LDT":
				this.opcode = 0x74;
				this.format = 3;
				break;
			case "LDX":
				this.opcode = 0x04;
				this.format = 3;
				break;
			case "LPS":
				this.opcode = 0xD0;
				this.format = 3;
				break;
			case "MUL":
				this.opcode = 0x20;
				this.format = 3;
				break;
			case "MULF":
				this.opcode = 0x60;
				this.format = 3;
				break;
			case "MULR":
				this.opcode = 0x98;
				this.format = 2;
				break;
			case "NORM":
				this.opcode = 0xC8;
				this.format = 1;
				break;
			case "OR":
				this.opcode = 0x44;
				this.format = 3;
				break;
			case "RD":
				this.opcode = 0xD8;
				this.format = 3;
				break;
			case "RMO":
				this.opcode = 0xAC;
				this.format = 2;
				break;
			case "RSUB":
				this.opcode = 0x4C;
				this.format = 3;
				break;
			case "SHIFTL":
				this.opcode = 0xA4;
				this.format = 2;
				break;
			case "SHIFTR":
				this.opcode = 0xA8;
				this.format = 2;
				break;
			case "SIO":
				this.opcode = 0xF0;
				this.format = 1;
				break;
			case "SSK":
				this.opcode = 0xEC;
				this.format = 3;
				break;
			case "STA":
				this.opcode = 0x0C;
				this.format = 3;
				break;
			case "STB":
				this.opcode = 0x78;
				this.format = 3;
				break;
			case "STCH":
				this.opcode = 0x54;
				this.format = 3;
				break;
			case "STF":
				this.opcode = 0x80;
				this.format = 3;
				break;
			case "STI":
				this.opcode = 0xD4;
				this.format = 3;
				break;
			case "STS":
				this.opcode = 0x7C;
				this.format = 3;
				break;
			case "STSW":
				this.opcode = 0xE8;
				this.format = 3;
				break;
			case "STT":
				this.opcode = 0x84;
				this.format = 3;
				break;
			case "STX":
				this.opcode = 0x10;
				this.format = 3;
				break;
			case "SUB":
				this.opcode = 0x1C;
				this.format = 3;
				break;
			case "SUBF":
				this.opcode = 0x5C;
				this.format = 3;
				break;
			case "SUBR":
				this.opcode = 0x94;
				this.format = 2;
				break;
			case "SVC":
				this.opcode = 0xB0;
				this.format = 2;
				break;
			case "TD":
				this.opcode = 0xE0;
				this.format = 3;
				break;
			case "TIO":
				this.opcode = 0xF8;
				this.format = 1;
				break;
			case "TIX":
				this.opcode = 0x2C;
				this.format = 3;
				break;
			case "TIXR":
				this.opcode = 0xB8;
				this.format = 2;
				break;
			case "WD":
				this.opcode = 0xDC;
				this.format = 3;
				break;
			default:
				throw "unknown mnemonic";
		}

		if (format4flag) {
			if (this.format !== 3) {
				throw "format 4 cannot be used with opcode " + mnemonic;
			}
			this.format = 4;
		}

		// sanity check
		__sic_check_unsigned(this.opcode, 8);
		if ((this.opcode & 0x3) !== 0) {
			throw "This is a bug. The last 2 bits of the opcode must be clear.";
		}
	}

	length(): number {
		return this.format;
	}

	static isBytecode(mnemonic: string): boolean {
		let re = new RegExp("^\\+?(ADD|ADDF|ADDR|AND|CLEAR|COMP|COMPF|DIV|DIVF|DIVR|FIX|FLOAT|HIO|J|JEQ|JGT|JLT|JSUB|LDA|LDB|LDCH|LDF|LDL|LDS|LDT|LDX|LPS|MUL|MULF|MULR|NORM|OR|RD|RMO|RSUB|SHIFTL|SHIFTR|SIO|SSK|STA|STB|STCH|STF|STI|STL|STS|STSW|STT|STX|SUB|SUBF|SUBR|SVC|TD|TIO|TIX|TIXR|WD)$");
		return re.test(mnemonic);
	}
}

export enum sic_op_type {
	register,
	immediate,
	direct,
	indirect,
}

export class sic_operand_f3 {
	val: number | string;
	type: sic_op_type;
	indexed: boolean;
	pcrel: boolean;
	baserel: boolean;
	format4: boolean;

	constructor(arg: string, format4: boolean, basetag?: string) {
		let re_register = new RegExp("^(A|X|L|PC|SW|B|S|T|F)$");
		let re_decimal = new RegExp("^(=|#|@)?(\\d+)(,X)?$");
		let re_hex = new RegExp("^(=|#|@)?X'([0-9A-F]+)'(,X)?$");
		let re_char = new RegExp("^(=|#|@)?C'(.)'(,X)?$")
		let re_tag = new RegExp("^(#|@)?([A-Z0-9]+)(,X)?$");
		let operand_len = format4 ? 20 : 12;

		this.format4 = format4;

		let get_type = (char: string): sic_op_type => {
			switch (char) {
				case "#":
				case "=":
					return sic_op_type.immediate;
				case "@":
					return sic_op_type.indirect;
				default:
					return sic_op_type.direct;
			}
		}

		let match: RegExpMatchArray | null;
		if ((match = arg.match(re_register)) !== null) {
			this.val = __sic_reg_to_dec(match[1]);
			this.type = sic_op_type.register;
			this.indexed = false;
			this.pcrel = false;
			this.baserel = false;
		}
		else if ((match = arg.match(re_decimal)) !== null) {
			this.val = __sic_make_unsigned(parseInt(match[2]), operand_len);
			this.type = get_type(match[1])
			this.indexed = match[3] != null;
			this.pcrel = false;
			this.baserel = false;
		}
		else if ((match = arg.match(re_hex)) !== null) {
			this.val = __sic_make_unsigned(parseInt(match[2], 16), operand_len)
			this.type = get_type(match[1])
			this.indexed = match[3] != null;
			this.pcrel = false;
			this.baserel = false;
		}
		else if ((match = arg.match(re_char)) !== null) {
			this.val = match[2].charCodeAt(0);
			this.type = get_type(match[1]);
			this.indexed = match[3] != null;
			this.pcrel = false;
			this.baserel = false;
		}
		else if ((match = arg.match(re_tag)) != null) {
			this.val = match[2];
			this.type = get_type(match[1])
			this.indexed = match[3] != null;
			if (basetag != null && this.val === basetag) {
				this.baserel = true;
				this.pcrel = false;
			}
			else {
				this.baserel = false;
				this.pcrel = true;
			}
		}
		else {
			throw "Operand " + arg + " is not of any valid format.";
		}

		if (this.format4){
			this.baserel = false;
			this.pcrel = false;
		}
	}

	ready(): boolean {
		return typeof this.val === "number";
	}

	convertTag(loc: number, tag_callback: (tag: string) => number): void {
		if (typeof this.val === "number") {
			return;
		}
		let len = this.format4 ? 20 : 12;
		if (this.baserel){
			this.val = 0; //TODO
		}
		else if (this.pcrel) {
			try {
				this.val = __sic_make_unsigned(tag_callback(this.val) - loc, len);
			}
			// too big for pcrel, try direct
			catch (e){
				this.pcrel = false;
				this.val = __sic_make_unsigned(tag_callback(this.val), len);
			}
		}
		else {
			this.val = __sic_make_unsigned(tag_callback(this.val), len);
		}
	}

	nixbpe(): number[] {
		let n: boolean;
		let i: boolean;
		let x = this.indexed;
		let b = this.baserel;
		let p = this.pcrel;
		let e = this.format4;

		switch (this.type) {
			case sic_op_type.direct:
				n = true;
				i = true;
				break;
			case sic_op_type.indirect:
				n = true;
				i = false;
				break;
			case sic_op_type.immediate:
				n = false;
				i = true;
				break;
			default:
				throw "Registers do not have an nixbpe value";
		}


		let bytes = [0x0, 0x0];
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

interface sic_instruction {
	ready(): boolean;
	length(): number;
	toBytes(): number[];
}

export class sic_format1 {
	bc: sic_bytecode;

	constructor(line: sic_split) {
		if (!sic_format1.isFormat1(line.op)) {
			throw line.op + " is not a format 1 operation";
		}
		if (line.args !== "") {
			throw "Format 1 arguments cannot have arguments";
		}
		this.bc = new sic_bytecode(line.op);
	}

	static isFormat1(mnemonic: string): boolean {
		let re = new RegExp("^(FIX|FLOAT|HIO|NORM|SIO|TIO)$");
		return re.test(mnemonic);
	}

	ready(): boolean {
		return true;
	}

	length(): number {
		return 1;
	}

	toBytes(): number[] {
		return [this.bc.opcode];
	}
}

export class sic_format2 {
	bc: sic_bytecode;
	op1: number;
	op2: number;

	constructor(line: sic_split) {
		if (!sic_format2.isFormat2(line.op)) {
			throw line.op + " is not a format 2 opcode";
		}
		this.bc = new sic_bytecode(line.op);

		let s = line.args.trim().split(/\s*,\s*/);
		if (s.length !== 2) {
			throw "Args needs to have 2 and only 2 values.";
		}

		let matcher = (str: string): number => {
			let re_indexed = new RegExp("^(.+),X$");
			let re_register = new RegExp("^(A|X|L|PC|SW|B|S|T|F)$");
			let re_hex = new RegExp("^X'([0-9A-Fa-f]+)'$");
			let re_dec = new RegExp("^([0-9]+)$");
			let match: RegExpMatchArray | null;

			if ((match = str.match(re_register)) !== null) {
				return __sic_reg_to_dec(match[1]);
			}
			if ((match = str.match(re_hex)) !== null) {
				return parseInt(match[1], 16);
			}
			if ((match = str.match(re_dec)) !== null) {
				return parseInt(match[1]);
			}
			throw str + " is not a valid format 2 operand.";
		}

		this.op1 = matcher(s[0]);
		__sic_check_unsigned(this.op1, 4);
		this.op2 = matcher(s[1]);
		__sic_check_unsigned(this.op2, 4);
	}

	static isFormat2(mnemonic: string) {
		let re = new RegExp("^(ADDR|CLEAR|DIVR|MULR|RMO|SHIFTL|SHIFTR|SUBR|SVC|TIXR)$");
		return re.test(mnemonic);
	}

	ready(): boolean {
		return true;
	}

	length(): number {
		return 2;
	}

	toBytes(): number[] {
		let bytes = [0x00, 0x00];
		bytes[0] = this.bc.opcode;
		bytes[1] |= (this.op1 & 0x0F) << 4;
		bytes[1] |= (this.op2 & 0x0F);
		return bytes;
	}
}

export class sic_format3 {
	bc: sic_bytecode;
	op: sic_operand_f3;

	constructor(line: sic_split, basetag?: string | undefined) {
		if (!sic_format3.isFormat3(line.op)) {
			throw line.op + " is not format 3";
		}

		this.bc = new sic_bytecode(line.op);
		this.op = new sic_operand_f3(line.args, false, basetag);
	}

	static isFormat3(mnemonic: string): boolean {
		let re = new RegExp("^(ADD|ADDF|AND|COMP|COMPF|DIV|DIVF|J|JEQ|JGT|JLT|JSUB|LDA|LDB|LDCH|LDF|LDL|LDS|LDT|LDX|LPS|MUL|MULF|OR|RD|RSUB|SSK|STA|STB|STCH|STF|STI|STL|STS|STSW|STT|STX|SUB|SUBF|TD|TIX|WD)$");
		return re.test(mnemonic);
	}

	convertTag(loc: number, tag_callback: (tag: string) => number): void {
		this.op.convertTag(loc, tag_callback);
	}

	ready(): boolean {
		return this.op.ready();
	}

	length(): number {
		return 3;
	}

	toBytes(): number[] {
		if (!this.ready()) {
			throw "MY BODY IS NOT READY";
		}
		let bytes = this.op.nixbpe();
		bytes[0] |= (this.bc.opcode & 0xFC);
		bytes[1] |= (<number>this.op.val & 0x0F00) >>> 8;
		bytes[2] = (<number>this.op.val & 0xFF);
		return bytes;
	}
}

export class sic_format4 {
	bc: sic_bytecode;
	op: sic_operand_f3;

	constructor(line: sic_split) {
		if (!sic_format4.isFormat4(line.op)) {
			throw line.op + " is not format 4";
		}

		this.bc = new sic_bytecode(line.op);
		this.op = new sic_operand_f3(line.args, true);
	}

	static isFormat4(mnemonic: string): boolean {
		let re = new RegExp("^\\+(ADD|ADDF|AND|COMP|COMPF|DIV|DIVF|J|JEQ|JGT|JLT|JSUB|LDA|LDB|LDCH|LDF|LDL|LDS|LDT|LDX|LPS|MUL|MULF|OR|RD|RSUB|SSK|STA|STB|STCH|STF|STI|STL|STS|STSW|STT|STX|SUB|SUBF|TD|TIX|WD)$");
		return re.test(mnemonic);
	}

	convertTag(loc: number, tag_callback: (tag: string) => number): void {
		this.op.convertTag(loc, tag_callback);
	}

	ready(): boolean {
		return this.op.ready();
	}

	length(): number {
		return 4;
	}

	toBytes(): number[] {
		if (!this.ready()) {
			throw "MY BODY IS NOT READY";
		}
		let bytes = this.op.nixbpe();
		bytes[0] |= (this.bc.opcode & 0xFC);
		bytes[1] |= (<number>this.op.val & 0x0F0000) >>> 16;
		bytes[2] = (<number>this.op.val & 0xFF00) >>> 8;
		bytes[3] = (<number>this.op.val & 0xFF);
		return bytes;
	}
}

export class sic_space {
	mnemonic: string;
	arg: number;

	constructor(line: sic_split) {
		if (!sic_space.isSpace(line.op)) {
			throw "This mnemonic is not a space."
		}
		this.mnemonic = line.op;
		let re_dec = new RegExp("^(\\d+)$");
		let re_hex = new RegExp("^X'([0-9A-Fa-f]+)'$");
		let match: RegExpMatchArray | null;

		if ((match = line.args.match(re_dec)) != null) {
			this.arg = parseInt(match[1]);
		}
		else if ((match = line.args.match(re_hex)) != null) {
			this.arg = parseInt(match[1], 16);
		}
		else {
			throw line.args + " is not a valid operand format.";
		}
	}

	static isSpace(mnemonic: string): boolean {
		let re = new RegExp("^(RESW|RESB|WORD|BYTE)$");
		return re.test(mnemonic);
	}

	ready(): boolean {
		return true;
	}

	length(): number {
		switch (this.mnemonic) {
			case "RESW":
				return 3 * <number>this.arg;
			case "RESB":
				return <number>this.arg;
			case "WORD":
				return 3;
			case "BYTE":
				return 1;
			default:
				throw this.mnemonic + " is invalid. this is a ultra mega bug";
		}
	}

	toBytes(): number[] {
		let a = [];
		switch (this.mnemonic) {
			case "RESW":
				for (let i = 0; i < 3 * this.arg; ++i) {
					a.push(0xFF);
				}
				return a;
			case "RESB":
				for (let i = 0; i < this.arg; ++i) {
					a.push(0xFF);
				}
				return a;
			case "WORD":
				return [(this.arg & 0xFF0000) >>> 16, (this.arg & 0xFF00) >>> 8, this.arg & 0xFF];
			case "BYTE":
				return [this.arg & 0xFF];
			default:
				throw "Mnemonic is invalid.";
		}
	}
}

export class sic_instr_line {
	instr: sic_instruction;
	loc: number;
	tag: string;
	str: string;
	constructor(instr: sic_instruction, loc: number, tag: string, str: string) {
		this.instr = instr;
		this.loc = loc;
		this.tag = tag;
		this.str = str;
	}
}

export class sic_tags {
	tag_dict: IDictionary;

	constructor(lines: sic_instr_line[]) {
		this.tag_dict = {};
		for (let i = 0; i < lines.length; ++i) {
			if (lines[i].tag !== "") {
				this.tag_dict[lines[i].tag] = i;
			}
		}
	}

	getTagLoc(lines: sic_instr_line[], tag: string): number {
		return lines[this.tag_dict[tag]].loc;
	}
}

export class sic_lst {
	loc: string;
	bytecode: string;
	instr: string;

	constructor(loc: string, bytecode: string, instr: string) {
		this.loc = loc;
		if (bytecode.length <= 8) {
			this.bytecode = bytecode;
		}
		// RESW 1000
		else {
			this.bytecode = "";
		}
		this.instr = instr;
	}
}

export class sic_pass1 {
	tags: sic_tags;
	lines: sic_instr_line[];
	lst: sic_lst[];

	static isDirective(mnemonic: string) {
		let re = new RegExp("^(START|END|BASE|NOBASE|LTORG)$");
		return re.test(mnemonic);
	}

	constructor(lines: string[]) {
		let splits = lines.map(str => str.replace(/\..+$/, "")).filter(str => str.trim() !== "").map(val => new sic_split(val));

		this.lines = [];
		this.lst = [];

		let startName: string | undefined;
		let baseTag: string | undefined;
		let locCurrent = 0;

		for (let i = 0; i < splits.length; ++i) {
			let instr: sic_instr_line;
			if (sic_pass1.isDirective(splits[i].op)) {
				switch (splits[i].op) {
					case "START":
						if (i !== 0) {
							throw "START may only be the first line in a program";
						}
						startName = splits[i].tag;
						locCurrent = parseInt(splits[i].args, 16);
						break;
					case "END":
						if (i !== splits.length - 1) {
							throw "END may only be the last line in a program";
						}
						if (splits[i].args !== startName) {
							throw "END's label must be the same as the start label";
						}
						// END does not actually do anything
						break;
					case "BASE":
						baseTag = splits[i].args;
						break;
					case "NOBASE":
						baseTag = undefined;
						break;
					case "LTORG":
						// TODO
						break;
					default:
						throw "not a splits[i]id mnemonic. this is an ultra mega bug";
				}
				continue;
			}
			else if (sic_format1.isFormat1(splits[i].op)) {
				instr = new sic_instr_line(new sic_format1(splits[i]), locCurrent, splits[i].tag, splits[i].str);
			}
			else if (sic_format2.isFormat2(splits[i].op)) {
				instr = new sic_instr_line(new sic_format2(splits[i]), locCurrent, splits[i].tag, splits[i].str);
			}
			else if (sic_format3.isFormat3(splits[i].op)) {
				instr = new sic_instr_line(new sic_format3(splits[i], baseTag), locCurrent, splits[i].tag, splits[i].str);
			}
			else if (sic_format4.isFormat4(splits[i].op)) {
				instr = new sic_instr_line(new sic_format4(splits[i]), locCurrent, splits[i].tag, splits[i].str);
			}
			else if (sic_space.isSpace(splits[i].op)) {
				instr = new sic_instr_line(new sic_space(splits[i]), locCurrent, splits[i].tag, splits[i].str);
			}
			else {
				throw splits[i].op + " is not of any recognized format.";
			}

			locCurrent += instr.instr.length();
			this.lines.push(instr);
		};

		this.tags = new sic_tags(this.lines);

		let tag_callback = (tag: string): number => {
			return this.tags.getTagLoc(this.lines, tag);
		}

		this.lines.forEach(val => {
			if (val.instr.ready()) {
				return;
			}
			else if (val.instr instanceof sic_format3) {
				(<sic_format3>val.instr).convertTag(val.loc, tag_callback);
			}
			else if (val.instr instanceof sic_format4) {
				(<sic_format4>val.instr).convertTag(val.loc, tag_callback);
			}
			else{
				throw "all bodies were not ready. this is a bug"
			}
		});

		for (let i = 0, j = 0; i < splits.length; ++i){
			if (sic_pass1.isDirective(splits[i].op)){
				this.lst.push(new sic_lst("", "", splits[i].str.trim()));
			}
			else{
				let l = this.lines[j];
				let bc = "";
				l.instr.toBytes().forEach(val => {
					let c = val.toString(16).toUpperCase();
					while (c.length < 2){
						c = "0" + c;
					}
					bc += c;
				});
				this.lst.push(new sic_lst(l.loc.toString(16).toUpperCase(), bc, l.str.trim()));
				j++;
			}
		}
	}

	toLst(): sic_lst[] {
		return this.lst;
	}

	toBytes(): number[][] {
		return this.lines.map(val => val.instr.toBytes());
	}
}

export const __sic_reg_to_dec = (reg: string): number => {
	switch (reg) {
		case "A":
			return 0;
		case "X":
			return 1;
		case "L":
			return 2;
		case "B":
			return 3;
		case "S":
			return 4;
		case "T":
			return 5;
		case "F":
			return 6;
		case "PC":
			return 8;
		case "SW":
			return 9;
		default:
			throw "reg type " + reg + " is not valid";
	}
}

export const __sic_dec_to_reg = (reg: number): string => {
	switch (reg) {
		case 0:
			return "A";
		case 1:
			return "X";
		case 2:
			return "L";
		case 3:
			return "B";
		case 4:
			return "S";
		case 5:
			return "T";
		case 6:
			return "F";
		case 8:
			return "PC";
		case 9:
			return "SW";
		default:
			throw "reg no " + reg + " is not valid";
	}
}