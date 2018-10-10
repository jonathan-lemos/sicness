let sic_bytecode = (opcode) => {
	if (typeof opcode !== "string"){
		throw "opcode must be a string";
	}
	let format4flag = opcode.endsWith('+');
	if (format4flag){
		opcode = opcode.slice(0, -1);
	}

	switch (opcode){
	case "ADD":
		this.bytecode = 0x18;
		this.format = 3;
	case "ADDF":
		this.bytecode = 0x58;
		this.format = 3;
	case "ADDR":
		this.bytecode = 0x90;
		this.format = 2;
	case "AND":
		this.bytecode = 0x40;
		this.format = 3;
	case "CLEAR":
		this.bytecode = 0xB4;
		this.format = 2;
	case "COMP":
		this.bytecode = 0x28;
		this.format = 3;
	case "COMPF":
		this.bytecode = 0x88;
		this.format = 3;
	case "COMPR":
		this.bytecode = 0xA0;
		this.format = 2;
	case "DIV":
		this.bytecode = 0x24;
		this.format = 3;
	case "DIVF":
		this.bytecode = 0x64;
		this.format = 3;
	case "DIVR":
		this.bytecode = 0x9C;
		this.format = 2;
	case "FIX":
		this.bytecode = 0xC4;
		this.format = 1;
	case "FLOAT":
		this.bytecode = 0xC0;
		this.format = 1;
	case "HIO":
		this.bytecode = 0xF4;
		this.format = 1;
	case "J":
		this.bytecode = 0x3C;
		this.format = 3;
	case "JEQ":
		this.bytecode = 0x30;
		this.format = 3;
	case "JLT":
		this.bytecode = 0x38;
		this.format = 3;
	case "JSUB":
		this.bytecode = 0x48;
		this.format = 3;
	case "LDA":
		this.bytecode = 0x00;
		this.format = 3;
	case "LDB":
		this.bytecode = 0x68;
		this.format = 3;
	case "LDCH":
		this.bytecode = 0x50;
		this.format = 3;
	case "LDF":
		this.bytecode = 0x70;
		this.format = 3;
	case "LDL":
		this.bytecode = 0x08;
		this.format = 3;
	case "LDS":
		this.bytecode = 0x6C;
		this.format = 3;
	case "LDT":
		this.bytecode = 0x74;
		this.format = 3;
	case "LDX":
		this.bytecode = 0x04;
		this.format = 3;
	case "LPS":
		this.bytecode = 0xD0;
		this.format = 3;
	case "MUL":
		this.bytecode = 0x20;
		this.format = 3;
	case "MULF":
		this.bytecode = 0x60;
		this.format = 3;
	case "MULR":
		this.bytecode = 0x98;
		this.format = 2;
	case "NORM":
		this.bytecode = 0xC8;
		this.format = 1;
	case "OR":
		this.bytecode = 0x44;
		this.format = 3;
	case "RD":
		this.bytecode = 0xD8;
		this.format = 3;
	case "RMO":
		this.bytecode = 0xAC;
		this.format = 2;
	case "RSUB":
		this.bytecode = 0x4C;
		this.format = 3;
	case "SHIFTL":
		this.bytecode = 0xA4;
		this.format = 2;
	case "SHIFTR":
		this.bytecode = 0xA8;
		this.format = 2;
	case "SIO":
		this.bytecode = 0xF0;
		this.format = 1;
	case "SSK":
		this.bytecode = 0xEC;
		this.format = 3;
	case "STA":
		this.bytecode = 0x0C;
		this.format = 3;
	case "STB":
		this.bytecode = 0x78;
		this.format = 3;
	case "STCH":
		this.bytecode = 0x54;
		this.format = 3;
	case "STF":
		this.bytecode = 0x80;
		this.format = 3;
	case "STI":
		this.bytecode = 0xD4;
		this.format = 3;
	case "STS":
		this.bytecode = 0x7C;
		this.format = 3;
	case "STSW":
		this.bytecode = 0xE8;
		this.format = 3;
	case "STT":
		this.bytecode = 0x84;
		this.format = 3;
	case "STX":
		this.bytecode = 0x10;
		this.format = 3;
	case "SUB":
		this.bytecode = 0x1C;
		this.format = 3;
	case "SUBF":
		this.bytecode = 0x5C;
		this.format = 3;
	case "SUBR":
		this.bytecode = 0x94;
		this.format = 2;
	case "SVC":
		this.bytecode = 0xB0;
		this.format = 2;
	case "TD":
		this.bytecode = 0xE0;
		this.format = 3;
	case "TIO":
		this.bytecode = 0xF8;
		this.format = 1;
	case "TIX":
		this.bytecode = 0x2C;
		this.format = 3;
	case "TIXR":
		this.bytecode = 0xB8;
		this.format = 2;
	case "WD":
		this.bytecode = 0xDC;
		this.format = 3;
	default:
		throw "unknown opcode";
	}

	if (format4flag){
		if (this.format !== 3){
			throw "format 4 cannot be used with opcode " + opcode;
		}
		this.format = 4;
	}
}

let sic_split = (line) => {
	let x = line.split(/\s+|\s*,\s*/);
	this.tag    = x[0];
	this.opcode = x[1];
	this.args   = x.slice(2);
}

let __sic_nixbpe = (n, i, x, b, p, e) => {
	if (typeof n !== number){
		throw "n must be 0 or 1";
	}
	if (typeof i !== number){
		throw "i must be 0 or 1";
	}
	if (typeof x !== number){
		throw "x must be 0 or 1";
	}
	if (typeof b !== number){
		throw "b must be 0 or 1";
	}
	if (typeof b !== number){
		throw "b must be 0 or 1";
	}
	if (typeof e !== number){
		throw "e must be 0 or 1";
	}

	let bytes = [0x0, 0x0];
	if (n != 0){
		bytes[0] |= 0x2;
	}
	if (i != 0){
		bytes[0] |= 0x1;
	}
	if (x != 0){
		bytes[1] |= 0x80;
	}
	if (b != 0){
		bytes[1] |= 0x40;
	}
	if (p != 0){
		bytes[1] |= 0x20;
	}
	if (e != 0){
		bytes[1] |= 0x10;
	}
	return bytes;
}

let __sic_reg_to_dec = (reg) => {
	if (typeof reg !== "string"){
		throw "reg must be a string";
	}

	switch (reg){
	case "A":
		return 0;
	case "X":
		return 1;
	case "L"
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

let __sic_format_2 = (opcode, reg1, reg2, n, i, x, b, p, e) => {
	if (typeof opcode !== "string"){
		throw "opcode must be a string";
	}
	if (typeof reg1 !== "string"){
		throw "reg1 must be a string";
	}
	if (typeof reg2 !== "string"){
		throw "reg2 must be a string";
	}

	let bytes = __sic_nixbpe(n, i, x, b, p, e);
	bytes[0] = opcode;
	bytes[1] |= (__sic_reg_to_dec(reg2) & 0x0F);
	bytes[1] |= (__sic_reg_to_dec(reg1) & 0x0F) << 4;
	return bytes;
}

let __sic_format_3_15bit = (opcode, address, n, i, x) => {
	if (typeof opcode !== "string"){
		throw "opcode must be a string";
	}
	if (typeof address !== "number"){
		throw "offset must be a number";
	}
	if (address < 0x0 || address > 0x7FFF){
		throw "address is not within a 15-bit unsigned range";
	}
	let bytes = __sic_nixbpe(n, i, x, 0, 0, 0);
	bytes[1] |= (address & 0x7F00 >>> 8);
	bytes[2] =  (address & 0xFF);
}

let __sic_format_3 = (opcode, offset, n, i, x, b, p, e) => {
	if (typeof opcode !== "string"){
		throw "opcode must be a string";
	}
	if (typeof offset !== "number"){
		throw "offset must be a number";
	}
	if (offset < -0x800 || offset > 0x7FF){
		throw "offset is too big to fit in a signed 12-bit range";
	}

	let op = __sic_opcode_to_hex(opcode);
	if (!op[1].includes(3)){
		throw "the specified opcode cannot be used with format 3";
	}

	let bytes = __sic_nixbpe(n, i, x, b, p, e);
	bytes[0] |= (opcode[0] & 0xFC);
	bytes[1] |= (offset & 0xF00 >>> 8);
	bytes[2] =  (offset & 0xFF);
	return bytes;
}

let __sic_format_4 = (opcode, address, n, i, x, b, p, e) => {
	if (typeof opcode !== "string"){
		throw "opcode must be a string";
	}
	if (typeof offset !== "number"){
		throw "offset must be a number";
	}
	if (offset < 0x0 || offset > 0xFFFFF){
		throw "offset is too big to fit in an unsigned 20-bit range";
	}

	let bytes = __sic_nixbpe(n, i, x, b, p, e);
	bytes[0] |= (opcode[0] & 0xFC);
	bytes[1] |= (offset & 0xF0000);
	bytes[2] =  (offset & 0xFF00);
	bytes[3] =  (offset & 0xFF);
}

let __sic_compile_pass1_bytec = (line) => {
	let s     = new sic_split(line);
	let bytec = new sic_bytecode(s.opcode);

	switch (bytec.format){
	case 1:
		if (s.args.length != 0){
			throw "opcode " + s.opcode + " cannot take any arguments";
		}
		break;
	case 2:
		if (s.args.length != 2){
			throw "opcode " + s.opcode + " must take 2 arguments";
		}
		break;
	case 3:
	case 4:
		if (s.args.length != 1){
			throw "opcode " + s.opcode + " must take a single argument";
		}
		break;
	default:
		throw "internal error: invalid format";
	}
	return bytec;
}

let __sic_compile_pass1 = (lines) => {
	if (!Array.isArray(lines)){
		throw "lines must be an array of lines";
	}

	for (let i = 0; i < lines.length; ++i){
		try{
			let x = __sic_compile_pass1_bytec(lines[i]);
		}
		catch(e){
			throw "Line " + (i + 1) + ": " + e.message;
		}

	}
}
