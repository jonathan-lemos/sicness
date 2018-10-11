class sic_bytecode {
	opcode: number;
	format: number;

	constructor(mnemonic: string) {
		let format4flag = mnemonic.endsWith('+');
		if (format4flag) {
			mnemonic = mnemonic.slice(0, -1);
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
}
class sic_split{
	tag: string;
	opcode: string;
	args: string[];

	constructor(line: string) {
		let x = line.split(/\s+|\s*,\s*/);
		this.tag = x[0];
		this.opcode = x[1];
		this.args = x.slice(2);
	}
}

let __sic_nixbpe = (n: number, i: number, x: number, b: number, p: number, e: number): number[] => {
	let bytes = [0x0, 0x0];
	if (n != 0) {
		bytes[0] |= 0x2;
	}
	if (i != 0) {
		bytes[0] |= 0x1;
	}
	if (x != 0) {
		bytes[1] |= 0x80;
	}
	if (b != 0) {
		bytes[1] |= 0x40;
	}
	if (p != 0) {
		bytes[1] |= 0x20;
	}
	if (e != 0) {
		bytes[1] |= 0x10;
	}
	return bytes;
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

let __sic_format_2 = (mnemonic: string, reg1: string, reg2: string, n: number, i: number, x: number, b: number, p: number, e: number): number[] => {
	let bytes = __sic_nixbpe(n, i, x, b, p, e);
	let op = new sic_bytecode(mnemonic);
	if (op.format !== 2){
		throw "this opcode cannot be used with format 2";
	}
	bytes[0] = op.opcode;
	bytes[1] |= (__sic_reg_to_dec(reg2) & 0x0F);
	bytes[1] |= (__sic_reg_to_dec(reg1) & 0x0F) << 4;
	return bytes;
}

let __sic_format_3_15bit = (mnemonic: string, address: number, n: number, i: number, x: number): number[] => {
	if (address < 0x0 || address > 0x7FFF) {
		throw "address is not within a 15-bit unsigned range";
	}
	let op = new sic_bytecode(mnemonic);
	if (op.format !== 3){
		throw "this opcode cannot be used with format 3";
	}
	let bytes = __sic_nixbpe(n, i, x, 0, 0, 0);
	bytes[1] |= (address & 0x7F00 >>> 8);
	bytes[2] = (address & 0xFF);
	return bytes;
}

let __sic_format_3 = (mnemonic: string, offset: number, n: number, i: number, x: number, b: number, p: number, e: number): number[] => {
	if (offset < -0x800 || offset > 0x7FF) {
		throw "offset is too big to fit in a signed 12-bit range";
	}

	let op = new sic_bytecode(mnemonic);
	if (op.format !== 3) {
		throw "the specified opcode cannot be used with format 3";
	}

	let bytes = __sic_nixbpe(n, i, x, b, p, e);
	bytes[0] |= (op.opcode & 0xFC);
	bytes[1] |= (offset & 0xF00 >>> 8);
	bytes[2] = (offset & 0xFF);
	return bytes;
}

let __sic_format_4 = (mnemonic: string, address: number, n: number, i: number, x: number, b: number, p: number, e: number): number[] => {
	if (address < 0x0 || address > 0xFFFFF) {
		throw "offset is too big to fit in an unsigned 20-bit range";
	}

	let bytes = __sic_nixbpe(n, i, x, b, p, e);
	let op = new sic_bytecode(mnemonic);
	bytes[0] |= (op.opcode & 0xFC);
	bytes[1] |= (address & 0xF0000);
	bytes[2] = (address & 0xFF00);
	bytes[3] = (address & 0xFF);
	return bytes;
}

let __sic_compile_pass1_bytec = (line: string) => {
	let s = new sic_split(line);
	let bytec = new sic_bytecode(s.opcode);

	switch (bytec.format) {
		case 1:
			if (s.args.length != 0) {
				throw "opcode " + s.opcode + " cannot take any arguments";
			}
			break;
		case 2:
			if (s.args.length != 2) {
				throw "opcode " + s.opcode + " must take 2 arguments";
			}
			break;
		case 3:
		case 4:
			if (s.args.length != 1) {
				throw "opcode " + s.opcode + " must take a single argument";
			}
			break;
		default:
			throw "internal error: invalid format";
	}
	return bytec;
}

let __sic_compile_pass1 = (lines) => {
	if (!Array.isArray(lines)) {
		throw "lines must be an array of lines";
	}

	for (let i = 0; i < lines.length; ++i) {
		try {
			let x = __sic_compile_pass1_bytec(lines[i]);
		}
		catch (e) {
			throw "Line " + (i + 1) + ": " + e.message;
		}

	}
}