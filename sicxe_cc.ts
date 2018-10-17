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

export class sic_split {
	tag: string;
	op: string;
	args: string[];
	constructor(line: string) {
		let line_arr = line.split(/\s+|\s*,\s*/);
		if (line_arr.length <= 1) {
			throw "line_arr does not have the required 2 entries";
		}
		this.tag = line_arr[0];
		this.op = line_arr[1];
		this.args = line_arr.slice(2);
	}
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

	static isBytecode(mnemonic: string): boolean {
		let re = new RegExp("^\+?(ADD|ADDF|ADDR|AND|CLEAR|COMP|COMPF|DIV|DIVF|DIVR|FIX|FLOAT|HIO|J|JEQ|JGT|JLT|JSUB|LDA|LDB|LDCH|LDF|LDL|LDS|LDT|LDX|LPS|MUL|MULF|MULR|NORM|OR|RD|RMO|RSUB|SHIFTL|SHIFTR|SIO|SSK|STA|STB|STCH|STF|STI|STL|STS|STSW|STT|STX|SUB|SUBF|SUBR|SVC|TD|TIO|TIX|TIXR|WD)$");
		return re.test(mnemonic);
	}
}

export class sic_directive {
	mnemonic: string;

	constructor(mnemonic: string) {
		if (!sic_directive.isDirective(mnemonic)) {
			throw mnemonic + " is not a compiler directive";
		}
		this.mnemonic = mnemonic;
	}

	static isDirective(mnemonic: string): boolean {
		return this.isCodeDirective(mnemonic) || this.isOtherDirective(mnemonic);
	}

	static isCodeDirective(mnemonic: string): boolean {
		let re = new RegExp("^(RESW|RESB|WORD|BYTE)$");
		return re.test(mnemonic);
	}

	static isOtherDirective(mnemonic: string): boolean {
		let re = new RegExp("^(START|END)$");
		return re.test(mnemonic);
	}

	__fillarray(len: number): number[]{
		let a = [];
		for (let i = 0; i < len; ++i){
			a.push(0xFF);
		}
		return a;
	}

	toBytes(arg: sic_operand){
		switch (this.mnemonic){
			case "RESW":
				return this.__fillarray(arg.val * 3);
			case "RESB":
				return this.__fillarray(arg.val);
			case "BYTE":
		}
	}
}

export enum sic_op_type {
	register,
	immediate,
	direct,
	indirect
}
export class sic_operand {
	val: number;
	type: sic_op_type;
	indexed: boolean;
	pcrel: boolean;

	constructor(arg: string, tag_callback: (tag: string) => number) {
		let re_register = new RegExp("^(A|X|L|PC|SW|B|S|T|F)$"); // CLEAR A
		let re_decimal = new RegExp("^(#|@)?(\\d+)$");
		let re_hex = new RegExp("^(#|@)?X'([0-9A-F]+)'$");
		let re_tag = new RegExp("^(#|@)?([A-Z]+)$");

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
		if ((match = arg.match(re_register)) != null) {
			this.val = __sic_reg_to_dec(match[1]);
			this.type = sic_op_type.register;
			this.indexed = false;
			this.pcrel = false;
		}
		else if ((match = arg.match(re_decimal)) != null) {
			this.val = parseInt(match[2])
			this.type = get_type(match[1])
			this.indexed = false;
			this.pcrel = false;
		}
		else if ((match = arg.match(re_hex)) != null) {
			this.val = parseInt(match[2], 16)
			this.type = get_type(match[1])
			this.indexed = false;
			this.pcrel = false;
		}
		else if ((match = arg.match(re_tag)) != null) {
			let s = tag_callback(match[2]);
			if (s === undefined) {
				throw "The specified tag " + match[2] + " was not found anywhere in the file.";
			}
			this.val = s
			this.type = get_type(match[1])
			this.indexed = false;
			this.pcrel = true;
		}
		else {
			throw "Operand " + arg + " is not of any valid format.";
		}
	}
}

export class sic_args {
	ops: sic_operand[];
	format: number;

	constructor(args: string[], tag_callback: (tag: string) => number, format: number) {
		this.ops = args.map((val) => new sic_operand(val, tag_callback));
		this.format = format;
		switch (this.format) {
			case 1:
				if (this.ops.length !== 0) {
					throw "A format 1 instruction cannot have any arguments.";
				}
				break;
			case 2:
				if (this.ops.length !== 2) {
					throw "A format 2 instruction must take 2 arguments";
				}
				break;
			case 3:
			case 4:
				if (this.ops.length !== 1) {
					if (this.ops.length === 2 &&
						this.ops[1].type === sic_op_type.register &&
						__sic_dec_to_reg(this.ops[1].val) === "X") {
						this.ops.pop();
						this.ops[0].indexed = true;
					}
					else
						throw "A format 3/4 instruction must take 1 argument";
				}
				break;
			default:
				throw "There is no such format " + this.format;
		}
		switch (this.format) {
			case 2:
				__sic_check_unsigned(this.ops[0].val, 4);
				__sic_check_unsigned(this.ops[1].val, 4);
				break;
			case 3:
				if (this.ops[0].pcrel || this.ops[0].type !== sic_op_type.direct){
					this.ops[0].val = __sic_make_unsigned(this.ops[0].val, 12);
				}
				else{
					__sic_check_unsigned(this.ops[0].val, 15);
				}
				break;
			case 4:
				__sic_check_unsigned(this.ops[0].val, 20);
		}
	}
}

interface IDictionary {
	[index: string]: number;
}

export class sic_pass1 {
	lines: sic_split[];
	tags: IDictionary;

	static __removecomments(line: string): string {
		let re = new RegExp("'+$");
		return line.replace(re, "");
	}

	constructor(lines: string[]) {
		this.lines = [];
		this.tags = {};
		for (let i = 0; i < lines.length; ++i) {
			let line = sic_pass1.__removecomments(lines[i]);
			if (line.trim() === "") {
				continue;
			}
			let split = new sic_split(line);
			this.lines.push(split);
			if (split.tag !== "") {
				this.tags[split.tag] = i;
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

export const __sic_format_1 = (bc: sic_bytecode) => {
	return [bc.opcode];
}

export const __sic_format_2 = (bc: sic_bytecode, arg1: sic_operand, arg2: sic_operand): number[] => {
	let bytes = [0x00, 0x00];
	bytes[0] = bc.opcode;
	bytes[1] |= (arg1.val & 0x0F);
	bytes[1] |= (arg2.val & 0x0F) << 4;
	return bytes;
}

export const __sic_format_3_15bit = (opcode: number, address: number, indexed: boolean): number[] => {
	let bytes = [0x00, 0x00, 0x00];
	bytes[0] = opcode;
	bytes[1] = (address & 0x7F00 >>> 8);
	if (indexed) {
		bytes[1] |= 0x80;
	}
	bytes[2] = (address & 0xFF);
	return bytes;
}

export const __sic_format_3 = (bc: sic_bytecode, arg: sic_operand): number[] => {
	if (arg.type === sic_op_type.direct && !arg.pcrel) {
		return __sic_format_3_15bit(bc.opcode, arg.val, arg.indexed);
	}

	let n: number, i: number, x = arg.indexed ? 1 : 0, b = 0, p = arg.pcrel ? 1 : 0, e = 0;
	switch (arg.type) {
		case sic_op_type.direct:
			n = 1;
			i = 1;
			break;
		case sic_op_type.immediate:
			n = 0;
			i = 1;
			break;
		case sic_op_type.indirect:
			n = 1;
			i = 0;
		default:
			throw "Registers cannot be used as format 3 operands."
	}

	let bytes = new sic_nixbpe(n, i, x, b, p, e).toBytes();
	bytes[0] |= (bc.opcode & 0xFC);
	bytes[1] |= (arg.val & 0x0F00 >>> 8);
	bytes[2] = (arg.val & 0xFF);
	return bytes;
}

export const __sic_format_4 = (bc: sic_bytecode, arg: sic_operand): number[] => {
	let n: number, i: number, x = arg.indexed ? 1 : 0, b = 0, p = arg.pcrel ? 1 : 0, e = 0;
	switch (arg.type) {
		case sic_op_type.direct:
			n = 1;
			i = 1;
			break;
		case sic_op_type.immediate:
			n = 0;
			i = 1;
			break;
		case sic_op_type.indirect:
			n = 1;
			i = 0;
		default:
			throw "Registers cannot be used as format 4 operands."
	}

	let bytes = new sic_nixbpe(n, i, x, b, p, e).toBytes();
	bytes[0] |= (bc.opcode & 0xFC);
	bytes[1] |= (arg.val & 0x0F0000 >>> 16);
	bytes[2] = (arg.val & 0xFF00 >>> 8);
	bytes[3] = (arg.val & 0xFF);
	return bytes;
}

export class sic_nixbpe {
	n: number;
	i: number;
	x: number;
	b: number;
	p: number;
	e: number;

	constructor(n: number, i: number, x: number, b: number, p: number, e: number) {
		this.n = n;
		this.i = i;
		this.x = x;
		this.b = b;
		this.p = p;
		this.e = e;
	}

	toBytes(): number[] {
		let bytes = [0x0, 0x0];
		if (this.n !== 0) {
			bytes[0] |= 0x2;
		}
		if (this.i !== 0) {
			bytes[0] |= 0x1;
		}
		if (this.x !== 0) {
			bytes[1] |= 0x80;
		}
		if (this.b !== 0) {
			bytes[1] |= 0x40;
		}
		if (this.p !== 0) {
			bytes[1] |= 0x20;
		}
		if (this.e !== 0) {
			bytes[1] |= 0x10;
		}
		return bytes;
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
	else if (sic_directive.isCodeDirective(op)){
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