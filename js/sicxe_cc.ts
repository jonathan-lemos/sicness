class sic_bytecode {
	opcode: number;
	format: number;
	mnemonic: string;

	constructor(mnemonic: string) {
		this.mnemonic = mnemonic;
		let format4flag = mnemonic.startsWith('+');
		if (format4flag) {
			mnemonic = mnemonic.slice(1);
		}

		switch (mnemonic) {
			case "ADD":
				this.opcode = 0x18;
				this.format = 3;
			case "ADDF":
				this.opcode = 0x58;
				this.format = 3;
			case "ADDR":
				this.opcode = 0x90;
				this.format = 2;
			case "AND":
				this.opcode = 0x40;
				this.format = 3;
			case "CLEAR":
				this.opcode = 0xB4;
				this.format = 2;
			case "COMP":
				this.opcode = 0x28;
				this.format = 3;
			case "COMPF":
				this.opcode = 0x88;
				this.format = 3;
			case "COMPR":
				this.opcode = 0xA0;
				this.format = 2;
			case "DIV":
				this.opcode = 0x24;
				this.format = 3;
			case "DIVF":
				this.opcode = 0x64;
				this.format = 3;
			case "DIVR":
				this.opcode = 0x9C;
				this.format = 2;
			case "FIX":
				this.opcode = 0xC4;
				this.format = 1;
			case "FLOAT":
				this.opcode = 0xC0;
				this.format = 1;
			case "HIO":
				this.opcode = 0xF4;
				this.format = 1;
			case "J":
				this.opcode = 0x3C;
				this.format = 3;
			case "JEQ":
				this.opcode = 0x30;
				this.format = 3;
			case "JLT":
				this.opcode = 0x38;
				this.format = 3;
			case "JSUB":
				this.opcode = 0x48;
				this.format = 3;
			case "LDA":
				this.opcode = 0x00;
				this.format = 3;
			case "LDB":
				this.opcode = 0x68;
				this.format = 3;
			case "LDCH":
				this.opcode = 0x50;
				this.format = 3;
			case "LDF":
				this.opcode = 0x70;
				this.format = 3;
			case "LDL":
				this.opcode = 0x08;
				this.format = 3;
			case "LDS":
				this.opcode = 0x6C;
				this.format = 3;
			case "LDT":
				this.opcode = 0x74;
				this.format = 3;
			case "LDX":
				this.opcode = 0x04;
				this.format = 3;
			case "LPS":
				this.opcode = 0xD0;
				this.format = 3;
			case "MUL":
				this.opcode = 0x20;
				this.format = 3;
			case "MULF":
				this.opcode = 0x60;
				this.format = 3;
			case "MULR":
				this.opcode = 0x98;
				this.format = 2;
			case "NORM":
				this.opcode = 0xC8;
				this.format = 1;
			case "OR":
				this.opcode = 0x44;
				this.format = 3;
			case "RD":
				this.opcode = 0xD8;
				this.format = 3;
			case "RMO":
				this.opcode = 0xAC;
				this.format = 2;
			case "RSUB":
				this.opcode = 0x4C;
				this.format = 3;
			case "SHIFTL":
				this.opcode = 0xA4;
				this.format = 2;
			case "SHIFTR":
				this.opcode = 0xA8;
				this.format = 2;
			case "SIO":
				this.opcode = 0xF0;
				this.format = 1;
			case "SSK":
				this.opcode = 0xEC;
				this.format = 3;
			case "STA":
				this.opcode = 0x0C;
				this.format = 3;
			case "STB":
				this.opcode = 0x78;
				this.format = 3;
			case "STCH":
				this.opcode = 0x54;
				this.format = 3;
			case "STF":
				this.opcode = 0x80;
				this.format = 3;
			case "STI":
				this.opcode = 0xD4;
				this.format = 3;
			case "STS":
				this.opcode = 0x7C;
				this.format = 3;
			case "STSW":
				this.opcode = 0xE8;
				this.format = 3;
			case "STT":
				this.opcode = 0x84;
				this.format = 3;
			case "STX":
				this.opcode = 0x10;
				this.format = 3;
			case "SUB":
				this.opcode = 0x1C;
				this.format = 3;
			case "SUBF":
				this.opcode = 0x5C;
				this.format = 3;
			case "SUBR":
				this.opcode = 0x94;
				this.format = 2;
			case "SVC":
				this.opcode = 0xB0;
				this.format = 2;
			case "TD":
				this.opcode = 0xE0;
				this.format = 3;
			case "TIO":
				this.opcode = 0xF8;
				this.format = 1;
			case "TIX":
				this.opcode = 0x2C;
				this.format = 3;
			case "TIXR":
				this.opcode = 0xB8;
				this.format = 2;
			case "WD":
				this.opcode = 0xDC;
				this.format = 3;
			default:
				throw "unknown mnemonic";
		}

		if (format4flag) {
			if (this.format !== 3) {
				throw "format 4 cannot be used with opcode " + mnemonic;
			}
			this.format = 4;
		}
	}

	static isBytecode(mnemonic: string): boolean {
		let re = new RegExp("^\+?(ADD|ADDF|ADDR|AND|CLEAR|COMP|COMPF|DIV|DIVF|DIVR|FIX|FLOAT|HIO|J|JEQ|JGT|JLT|JSUB|LDA|LDB|LDCH|LDF|LDL|LDS|LDT|LDX|LPS|MUL|MULF|MULR|NORM|OR|RD|RMO|RSUB|SHIFTL|SHIFTR|SIO|SSK|STA|STB|STCH|STF|STI|STL|STS|STSW|STT|STX|SUB|SUBF|SUBR|SVC|TD|TIO|TIX|TIXR|WD)$");
		return re.test(mnemonic);
	}
}

class sic_split{
	tag: string;
	op: string;
	args: string[];
	constructor(line: string){
		let line_arr = line.split(/\s+|\s*,\s*/);
		if (line_arr.length <= 1){
			throw "line_arr does not have the required 2 entries";
		}
		this.tag = line_arr[0];
		this.op = line_arr[1];
		this.args = line_arr.slice(2);
	}
}

class sic_directive{
	mnemonic: string;
	arg: string;
	isInstruction: boolean;

	constructor(split: sic_split){
		this.isInstruction = false;
		if (!sic_directive.isDirective(split.op)){
			throw split.op + " is not a compiler directive";
		}
		this.mnemonic = split.op;
		this.arg = split.args[0];
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

	length(): number {
		switch (this.mnemonic){
			case "RESW":
				return 3 * parseInt(this.arg);
			case "RESB":
				return parseInt(this.arg);
			case "WORD":
				return 3;
			case "BYTE":
				return 1;
			default:
				throw "This opcode is not a code directive, so it doesn't have a length."
		}
	}

	toBytecode(): number[] {
		let a = [];
		for (let i = 0; i < this.length(); ++i) {
			a.push(0xFF);
		}
		return a;
	}
}

enum sic_op_type {
	register,
	immediate,
	direct,
	indirect
}
class sic_operand {
	val: number | string;
	type: sic_op_type;
	indexed: boolean;

	constructor(val: number | string, type: sic_op_type, indexed: boolean) {
		this.val = val;
		this.type = type;
		this.indexed = indexed;
	}

	static parse(arg: string): sic_operand {
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

		let match: RegExpMatchArray;
		if ((match = arg.match(re_register)) != null) {
			return new sic_operand(match[1], sic_op_type.register, false);
		}
		else if ((match = arg.match(re_decimal)) != null) {
			return new sic_operand(parseInt(match[2]), get_type(match[1]), false)
		}
		else if ((match = arg.match(re_hex)) != null) {
			return new sic_operand(parseInt(match[2]), get_type(match[1]), false);
		}
		else if ((match = arg.match(re_tag)) != null) {
			return new sic_operand(match[2], get_type(match[1]), false);
		}
		else {
			throw "Operand " + arg + " is not of any valid format.";
		}
	}

	getAddr(tag_callback: (tag: string) => number): number{
		if (typeof this.val === "number"){
			return this.val;
		}
		return tag_callback(this.val);
	}

	isTag(): boolean{
		return typeof this.val === "string";
	}
}
class sic_instruction {
	tag: string;
	bytecode: sic_bytecode;
	op1: sic_operand;
	op2: sic_operand;
	isInstruction: boolean

	constructor(split: sic_split) {
		this.isInstruction = true;
		this.tag = split.tag;
		this.bytecode = new sic_bytecode(split.op);

		this.op1 = null;
		this.op2 = null;
		switch (split.args.length) {
			case 0:
				break;
			case 2:
				this.op2 = sic_operand.parse(split.args[1]);
			// fall through
			case 1:
				this.op1 = sic_operand.parse(split.args[0]);
				break;
			default:
				throw "This line has too many arguments.";
		}

		switch (this.bytecode.format) {
			case 1:
				if (this.op1 !== null || this.op2 !== null) {
					throw this.bytecode.mnemonic + " is a format 1 opcode, so it cannot take any parameters.";
				}
				break;
			case 2:
				if (this.op1 === null || this.op2 === null) {
					throw this.bytecode.mnemonic + " is a format 2 opcode, so it requires 2 arguments";
				}
				break;
			case 3:
			case 4:
				if (this.op1 === null) {
					throw this.bytecode.mnemonic + " is a format 3/4 opcode, so it requires a single argument";
				}
				if (this.op2 !== null) {
					// LDA VAL,X
					if (this.op2.type === sic_op_type.register && this.op2.val === 1) {
						this.op2 = null;
						this.op1.indexed = true;
					}
					else {
						throw this.bytecode.mnemonic + " is a format 3/4 opcode, so it requires a single argument";
					}
				}
				break;
			default:
				throw "Internal error: invalid format";
		}
	}

	__bytecode2(tag_callback: (tag: string) => number): number[]{
		if (this.op1 == null || this.op2 == null){
			throw "__bytecode2() needs 2 arguments";
		}
		return __sic_format_2(this.bytecode.opcode, this.op1.getAddr(tag_callback), this.op2.getAddr(tag_callback));
	}

	__bytecode3_4(pc: number, tag_callback: (tag: string) => number, format4: boolean): number[]{
		if (this.op1 == null){
			throw "__bytecode3() needs an argument";
		}
		let n: number, i: number, x: number, b: number, p: number, e: number;
		let pcrel_ptr = pc - this.op1.getAddr(tag_callback);
		let direct_ptr = this.op1.getAddr(tag_callback);
		let use_pcrel = this.op1.isTag();

		x = this.op1.indexed ? 1 : 0;
		b = 0;
		e = 0;

		if (use_pcrel){
			n = 1;
			i = 1;
			p = 1;
			return format4 ?
			__sic_format_4(this.bytecode.opcode, pcrel_ptr, new sic_nixbpe(n, i, x, b, p, e)) :
			__sic_format_3(this.bytecode.opcode, pcrel_ptr, new sic_nixbpe(n, i, x, b, p, e));
		}
		else {
			n = 0;
			i = 0;
			p = 0;
			return format4 ?
			__sic_format_4(this.bytecode.opcode, direct_ptr, new sic_nixbpe(n, i, x, b, p, e)) :
			__sic_format_3_15bit(this.bytecode.opcode, direct_ptr, x);
		}
	}

	toBytecode(pc: number, tag_callback: (tag: string) => number): number[] {
		switch (this.bytecode.format){
			case 1:
				return [ this.bytecode.opcode ];
			case 2:
				return this.__bytecode2(tag_callback);
			case 3:
				return this.__bytecode3_4(pc, tag_callback, false);
			case 4:
				return this.__bytecode3_4(pc, tag_callback, true);
		}
	}
}

interface sic_line{
	isInstruction: boolean;
}

class sic_pass1 {
	lines: (sic_line)[];
	tags: number[];

	static __removecomments(line: string): string{
		let re = new RegExp("'+$");
		return line.replace(re, "");
	}

	constructor(lines: string[]) {
		for (let i = 0; i < lines.length; ++i) {
			let line = sic_pass1.__removecomments(lines[i]);
			if (line.trim() === ""){
				continue;
			}
			let split = new sic_split(lines[i]);
			let s;
			if (sic_directive.isDirective(split.op)) {
				s = new sic_directive(split);
			}
			else {
				s = new sic_instruction(split);
			}
			this.lines.push(s);
			if (s.tag !== "") {
				this.tags[s.tag] = i;
			}
		}
	}
}

let __sic_reg_to_dec = (reg: string): number => {
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

let __sic_validate_unsigned = (val: number, n_bits: number): void => {
	let x = 0;
	for (let i = 0; i < n_bits; ++i) {
		x |= (1 << i);
	}
	if (val < 0x0 || val > x) {
		throw "val does not fit in an unsigned " + n_bits + "-bit range";
	}
}

let __sic_validate_signed = (val: number, n_bits: number): void => {
	let x = 0;
	for (let i = 0; i < n_bits - 1; ++i) {
		x |= (1 << i);
	}
	if (val < -x - 1 || val > x) {
		throw "val does not fit in a signed " + n_bits + "-bit range";
	}
}

let __sic_validate_opcode = (opcode: number): void => {
	__sic_validate_unsigned(opcode, 8);
	if ((opcode & 0x03) !== 0) {
		throw "the opcode's last 2 bits must be clear";
	}
}

let __sic_format_2 = (opcode: number, arg1: number, arg2: number): number[] => {
	__sic_validate_opcode(opcode);
	__sic_validate_unsigned(arg1, 4);
	__sic_validate_unsigned(arg2, 4);

	let bytes = [0x00, 0x00];
	bytes[0] = opcode;
	bytes[1] |= (arg1 & 0x0F);
	bytes[1] |= (arg2 & 0x0F) << 4;
	return bytes;
}

let __sic_format_3_15bit = (opcode: number, address: number, x: number): number[] => {
	__sic_validate_opcode(opcode);
	__sic_validate_unsigned(address, 15);

	let bytes = [0x00, 0x00, 0x00];
	bytes[0] = opcode;
	bytes[1] = (address & 0x7F00 >>> 8);
	if (x !== 0) {
		bytes[1] |= 0x80;
	}
	bytes[2] = (address & 0xFF);
	return bytes;
}

let __sic_format_3 = (opcode: number, offset: number, nixbpe: sic_nixbpe): number[] => {
	__sic_validate_opcode(opcode);
	__sic_validate_signed(offset, 12);
	if (offset < 0x0) {
		offset += 0xFFF;
	}

	let bytes = nixbpe.toBytes();
	bytes[0] |= (opcode & 0xFC);
	bytes[1] |= (offset & 0x0F00 >>> 8);
	bytes[2] = (offset & 0xFF);
	return bytes;
}

let __sic_format_4 = (opcode: number, address: number, nixbpe: sic_nixbpe): number[] => {
	__sic_validate_opcode(opcode);
	__sic_validate_unsigned(address, 20);

	let bytes = nixbpe.toBytes();
	bytes[0] |= (opcode & 0xFC);
	bytes[1] |= (address & 0x0F0000 >>> 16);
	bytes[2] = (address & 0xFF00 >>> 8);
	bytes[3] = (address & 0xFF);
	return bytes;
}

class sic_nixbpe {
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

let sic_compile = (lines: string[]): number[] => {
	let pass1 = new sic_pass1(lines);
	let ret = [];
	let tag_callback = (tag: string): number => {
		return pass1.tags[tag];
	}
	let pc = 0;

	for (let s of pass1.lines) {
		let bytes;
		if (s.isInstruction){
			bytes = (<sic_instruction>s).toBytecode(pc, tag_callback);
		}
		else{
			bytes = (<sic_directive>s).toBytecode();
		}
		pc += bytes.length;
		ret.concat(bytes);
	}
	return ret;
}
