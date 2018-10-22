/*
 * Copyright (c) 2018 Jonathan Lemos
 * 
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

export const __sic_check_unsigned = (val: number, n_bits: number): void => {
	let mask = 0x0;
	for (let i = 0; i < n_bits; ++i) {
		mask |= (1 << i);
	}
	if (val < 0x0 || val > mask){
		throw "val does not fit in an " + n_bits + "-bit range";
	}
}

export const __sic_make_unsigned = (val: number, n_bits: number): number => {
	let mask = 0x0;
	for (let i = 0; i < n_bits; ++i) {
		mask |= (1 << i);
	}
	if (val < 0x0) {
		val += (mask | n_bits);
	}
	if (val < 0x0 || val > mask) {
		throw "val does not fit in an " + n_bits + "-bit range";
	}
	return val;
}

export const __sic_parse_val = (val: string): number => {

}

export class sic_split {
	tag: string;
	op: string;
	args: string;
	constructor(line: string) {
		let line_arr = line.split(/\s+/);
		if (line_arr.length <= 1) {
			throw "line_arr does not have the required 2 entries";
		}
		this.tag = line_arr[0];
		this.op = line_arr[1];
		this.args = line_arr.slice(2).reduce((acc, val) => acc + val);
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
		if ((this.opcode & 0x3) !== 0){
			throw "This is a bug. The last 2 bits of the opcode must be clear.";
		}
	}

	length(): number{
		return this.format;
	}

	static isBytecode(mnemonic: string): boolean {
		let re = new RegExp("^\+?(ADD|ADDF|ADDR|AND|CLEAR|COMP|COMPF|DIV|DIVF|DIVR|FIX|FLOAT|HIO|J|JEQ|JGT|JLT|JSUB|LDA|LDB|LDCH|LDF|LDL|LDS|LDT|LDX|LPS|MUL|MULF|MULR|NORM|OR|RD|RMO|RSUB|SHIFTL|SHIFTR|SIO|SSK|STA|STB|STCH|STF|STI|STL|STS|STSW|STT|STX|SUB|SUBF|SUBR|SVC|TD|TIO|TIX|TIXR|WD)$");
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

	constructor(arg: string, basetag?: string) {
		// TODO: implement char
		let re_register = new RegExp("^(A|X|L|PC|SW|B|S|T|F)$"); // CLEAR A
		let re_decimal = new RegExp("^(#|@)?(\\d+)(,X)?$");
		let re_hex = new RegExp("^(#|@)?X'([0-9A-F]+)'(,X)?$");
		let re_char = new RegExp("^(#|@)?C'(.)'(,X)?$")
		let re_tag = new RegExp("^(#|@)?([A-Z0-9]+)(,X)?$");

		let get_type = (char: string): sic_op_type => {
			switch (char) {
				case "#":
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
			this.val = parseInt(match[2])
			this.type = get_type(match[1])
			this.indexed = match[3] != null;
			this.pcrel = false;
			this.baserel = false;
		}
		else if ((match = arg.match(re_hex)) !== null) {
			this.val = parseInt(match[2], 16)
			this.type = get_type(match[1])
			this.indexed = match[3] != null;
			this.pcrel = false;
			this.baserel = false;
		}
		else if ((match = arg.match(re_char)) !== null){
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
			if (basetag != null && this.val === basetag){
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
	}

	isTag(): boolean {
		return typeof this.val === "string";
	}

	convertTagToNumber(tag_callback: (tag: string) => number): void {
		if (typeof this.val === "number") {
			return;
		}
		this.val = tag_callback(this.val);
	}

	nixbpe(format4: boolean): number[] {
		let n: boolean;
		let i: boolean;
		let x = this.indexed;
		let b = this.baserel;
		let p = this.pcrel;
		let e = format4;
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

interface sic_instruction{
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
		bytes[1] |= (this.op1 & 0x0F);
		bytes[1] |= (this.op1 & 0x0F) << 4;
		return bytes;
	}
}

export class sic_format3 {
	bc: sic_bytecode;
	op: sic_operand_f3;

	constructor(line: sic_split) {
		if (!sic_format3.isFormat3(line.op)) {
			throw line.op + " is not format 3";
		}

		this.bc = new sic_bytecode(line.op);
		this.op = new sic_operand_f3(line.args);
	}

	static isFormat3(mnemonic: string): boolean {
		let re = new RegExp("^(ADD|ADDF|AND|COMP|COMPF|DIV|DIVF|J|JEQ|JGT|JLT|JSUB|LDA|LDB|LDCH|LDF|LDL|LDS|LDT|LDX|LPS|MUL|MULF|OR|RD|RSUB|SSK|STA|STB|STCH|STF|STI|STL|STS|STSW|STT|STX|SUB|SUBF|TD|TIX|WD)$");
		return re.test(mnemonic);
	}

	convertTag(tag_callback: (tag: string) => number): void {
		this.op.convertTagToNumber(tag_callback);
	}

	ready(): boolean {
		return !this.op.isTag();
	}

	length(): number {
		return 3;
	}

	toBytes(): number[] {
		if (!this.ready()) {
			throw "MY BODY IS NOT READY";
		}
		let bytes = this.op.nixbpe(false);
		bytes[0] |= (this.bc.opcode & 0xFC);
		bytes[1] |= (<number>this.op.val & 0x0F00 >>> 8);
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
		this.op = new sic_operand_f3(line.args);
	}

	static isFormat4(mnemonic: string): boolean {
		let re = new RegExp("^\+(ADD|ADDF|AND|COMP|COMPF|DIV|DIVF|J|JEQ|JGT|JLT|JSUB|LDA|LDB|LDCH|LDF|LDL|LDS|LDT|LDX|LPS|MUL|MULF|OR|RD|RSUB|SSK|STA|STB|STCH|STF|STI|STL|STS|STSW|STT|STX|SUB|SUBF|TD|TIX|WD)$");
		return re.test(mnemonic);
	}

	convertTag(tag_callback: (tag: string) => number): void {
		this.op.convertTagToNumber(tag_callback);
	}

	ready(): boolean {
		return !this.op.isTag();
	}

	length(): number {
		return 4;
	}

	toBytes(): number[] {
		if (!this.ready()) {
			throw "MY BODY IS NOT READY";
		}
		let bytes = this.op.nixbpe(true);
		bytes[0] |= (this.bc.opcode & 0xFC);
		bytes[1] |= (<number>this.op.val & 0x0F0000 >>> 16);
		bytes[2] = (<number>this.op.val & 0xFF00 >>> 8);
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
		let re_hex = new RegExp("^X'([0-9A-Fa-f])'$");
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

export class sic_tags {
	tag_dict: IDictionary;

	constructor(lines: sic_split[]) {
		this.tag_dict = {};
		for (let i = 0; i < lines.length; ++i) {
			if (lines[i].tag !== "") {
				this.tag_dict[lines[i].tag] = i;
			}
		}
	}

	getTag(tag: string): number {
		return this.tag_dict[tag];
	}
}

export class sic_compiler {
	tags: sic_tags;
	lines: {instr: sic_instruction,
		loc: number}[];
	startName: string | undefined;
	startLoc: number | undefined;
	baseTag: string | undefined;

	static __removecomments(line: string): string {
		let re = new RegExp("\\.+$");
		return line.replace(re, "");
	}

	static isDirective(mnemonic: string){
		let re = new RegExp("^(START|END|BASE|NOBASE|LTORG)$");
		return re.test(mnemonic);
	}

	applyDirective(mnemonic: string, arr: sic_split[], index: number) {
		let parseNum = (str: string) => {
			let re_dec = new RegExp("^(\\d)+$");
			let re_hex = new RegExp("^X'([0-9A-Fa-f])'$");
			let match: RegExpMatchArray | null;

			if ((match = str.match(re_dec)) !== null){
				return parseInt(match[1]);
			}
			else if ((match = str.match(re_hex)) !== null){
				return parseInt(match[1], 16);
			}
			else{
				throw str + " is not of any valid type"
			}
		}

		if (!sic_compiler.isDirective(mnemonic)) {
			throw mnemonic + " is not a directive.";
		}
		switch (mnemonic) {
			case "START":
				if (index !== 0) {
					throw "START may only be the first line in a program";
				}
				this.startName = arr[0].tag;
				this.startLoc = parseNum(arr[0].args);
				break;
			case "END":
				if (index !== arr.length - 1){
					throw "END may only be the last line in a program";
				}
				if (arr[index - 1].args !== this.startName){
					throw "END's label must be the same as the start label";
				}
				// END does not actually do anything
				break;
			case "BASE":
				this.baseTag = arr[index].args;
				break;
			case "NOBASE":
				this.baseTag = undefined;
				break;
			case "LTORG":
				// TODO
				break;
			default:
				throw "not a valid mnemonic. this is an ultra mega bug";
		}
	}

	constructor(lines: string[]) {
		lines = lines.filter(str => sic_compiler.__removecomments(str).trim() !== "");
		let arr = lines.map(val => new sic_split(val));
		this.tags = new sic_tags(arr);

		this.lines = [];
		let pc = 0;
		for (let i = 0; i < arr.length; ++i) {
			if (sic_compiler.isDirective(arr[i].op)) {
				this.applyDirective(arr[i].op, arr, i);
			}
			else if (sic_format1.isFormat1(arr[i].op)){
				this.lines.push(new sic_format1(arr[i]));
			}
			else if (sic_format2.isFormat2(arr[i].op)){
				this.lines.push(new sic_format2(arr[i]));
			}
			else if (sic_format3.isFormat3(arr[i].op)){
				this.lines.push(new sic_format3(arr[i]));
			}
			else if (sic_format4.isFormat4(arr[i].op)){
				this.lines.push(new sic_format4(arr[i]));
			}
		}
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

/*
//TODO
let sic_compile_unf_format = (lines: string[]): number[] => {
	let pass1 = new sic_pass1(lines);
}
*/

export const __sic_compile_line = (line: sic_split, tag_callback: (tag: string) => number): number[] => {
	let op = line.op;
	if (sic_bytecode.isBytecode(op)) {
		let bc = new sic_bytecode(op);
		let args = new sic_args(line.args, tag_callback, bc.format);
		switch (bc.format) {
			case 1:
				return __sic_format_1(bc);
			case 2:
				return __sic_format_2(bc, args.ops[0], args.ops[1]);
			case 3:
				return __sic_format_3(bc, args.ops[0])
			case 4:
				return __sic_format_4(bc, args.ops[0]);
			default:
				throw "Invalid bc.format";
		}
	}
	else if (sic_directive.isCodeDirective(op)) {
		let d = new sic_directive(op);
	}
}

export const sic_compile = (lines: string[]): number[] => {
	let pass1 = new sic_pass1(lines);
	let ret: number[] = [];
	let tag_callback = (tag: string): number => {
		return pass1.tags[tag];
	}
	let pc = 0;

	for (let s of pass1.lines) {
		let bytes;
		if (s.isInstruction) {
			bytes = (<sic_instruction>s).toBytecode(pc, tag_callback);
		}
		else {
			bytes = (<sic_directive>s).toBytecode();
		}
		pc += bytes.length;
		ret.concat(bytes);
	}
	return ret;
}