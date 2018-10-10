let __sic_opcode_to_hex = (opcode) => {
	if (typeof opcode !== "string"){
		throw "opcode must be a string";
	}

	switch (line){
	case "ADD":
		return [0x18, [3, 4]];
	case "ADDF":
		return [0x58, [3, 4]];
	case "ADDR":
		return [0x90, [2]];
	case "AND":
		return [0x40, [3, 4]];
	case "CLEAR":
		return [0xB4, [2]];
	case "COMP":
		return [0x28, [3, 4]];
	case "COMPF":
		return [0x88, [3, 4]];
	case "COMPR":
		return [0xA0, [2]];
	case "DIV":
		return [0x24, [3, 4]];
	case "DIVF":
		return [0x64, [3, 4]];
	case "DIVR":
		return [0x9C, [2]];
	case "FIX":
		return [0xC4, [1]];
	case "FLOAT":
		return [0xC0, [1]];
	case "HIO":
		return [0xF4, [1]];
	case "J":
		return [0x3C, [3, 4]];
	case "JEQ":
		return [0x30, [3, 4]];
	case "JLT":
		return [0x38, [3, 4]];
	case "JSUB":
		return [0x48, [3, 4]];
	case "LDA":
		return [0x00, [3, 4]];
	case "LDB":
		return [0x68, [3, 4]];
	case "LDCH":
		return [0x50, [3, 4]];
	case "LDF":
		return [0x70, [3, 4]];
	case "LDL":
		return [0x08, [3, 4]];
	case "LDS":
		return [0x6C, [3, 4]];
	case "LDT":
		return [0x74, [3, 4]];
	case "LDX":
		return [0x04, [3, 4]];
	case "LPS":
		return [0xD0, [3, 4]];
	case "MUL":
		return [0x20, [3, 4]];
	case "MULF":
		return [0x60, [3, 4]];
	case "MULR":
		return [0x98, [2]];
	case "NORM":
		return [0xC8, [1]];
	case "OR":
		return [0x44, [3, 4]];
	case "RD":
		return [0xD8, [3, 4]];
	case "RMO":
		return [0xAC, [2]];
	case "RSUB":
		return [0x4C, [3, 4]];
	case "SHIFTL":
		return [0xA4, [2]];
	case "SHIFTR":
		return [0xA8, [2]];
	case "SIO":
		return [0xF0, [1]];
	case "SSK":
		return [0xEC, [3, 4]];
	case "STA":
		return [0x0C, [3, 4]];
	case "STB":
		return [0x78, [3, 4]];
	case "STCH":
		return [0x54, [3, 4]];
	case "STF":
		return [0x80, [3, 4]];
	case "STI":
		return [0xD4, [3, 4]];
	case "STS":
		return [0x7C, [3, 4]];
	case "STSW":
		return [0xE8, [3, 4]];
	case "STT":
		return [0x84, [3, 4]];
	case "STX":
		return [0x10, [3, 4]];
	case "SUB":
		return [0x1C, [3, 4]];
	case "SUBF":
		return [0x5C, [3, 4]];
	case "SUBR":
		return [0x94, [2]];
	case "SVC":
		return [0xB0, [2]];
	case "TD":
		return [0xE0, [3, 4]];
	case "TIO":
		return [0xF8, [1]];
	case "TIX":
		return [0x2C, [3, 4]];
	case "TIXR":
		return [0xB8, [2]];
	case "WD":
		return [0xDC, [3, 4]];
	default:
		throw "unknown opcode";
	}
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

let __sic_format_3_legacy = (opcode, address, n, i, x){
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

let __sic_format_3 = (opcode, offset, n, i, x, b, p, e){
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

let __sic_format_4 = (opcode, address, n, i, x, b, p, e){
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

let __sic_compile_line = (line) => {
	if (typeof line !== "string"){
		throw "line must be a string";
	}

	arr = line.split("\t");
	if (arr.length !== 3){
		throw "line is of an incorrect format";
	}


}
