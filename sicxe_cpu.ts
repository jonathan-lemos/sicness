/*
 * Copyright (c) 2018 Jonathan Lemos
 * 
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

export class sic_opcode{
	mnemonic: string;
	format: number;

	constructor(m_byte: number) {
		switch (m_byte) {
		case 0x18:
			this.mnemonic = "ADD";
			this.format = 3;
		case 0x58:
			this.mnemonic = "ADDF";
			this.format = 3;
		case 0x90:
			this.mnemonic = "ADDR";
			this.format = 2;
		case 0x40:
			this.mnemonic = "AND";
			this.format = 3;
		case 0xB4:
			this.mnemonic = "CLEAR";
			this.format = 2;
		case 0x28:
			this.mnemonic = "COMP";
			this.format = 3;
		case 0x88:
			this.mnemonic = "COMPF";
			this.format = 3;
		case 0xA0:
			this.mnemonic = "COMPR";
			this.format = 2;
		case 0x24:
			this.mnemonic = "DIV";
			this.format = 3;
		case 0x64:
			this.mnemonic = "DIVF";
			this.format = 3;
		case 0x9C:
			this.mnemonic = "DIVR";
			this.format = 2;
		case 0xC4:
			this.mnemonic = "FIX";
			this.format = 1;
		case 0xC0:
			this.mnemonic = "FLOAT";
			this.format = 1;
		case 0xF4:
			this.mnemonic = "HIO";
			this.format = 1;
		case 0x3C:
			this.mnemonic = "J";
			this.format = 3;
		case 0x30:
			this.mnemonic = "JEQ";
			this.format = 3;
		case 0x38:
			this.mnemonic = "JLT";
			this.format = 3;
		case 0x48:
			this.mnemonic = "JSUB";
			this.format = 3;
		case 0x00:
			this.mnemonic = "LDA";
			this.format = 3;
		case 0x68:
			this.mnemonic = "LDB";
			this.format = 3;
		case 0x50:
			this.mnemonic = "LDCH";
			this.format = 3;
		case 0x70:
			this.mnemonic = "LDF";
			this.format = 3;
		case 0x08:
			this.mnemonic = "LDL";
			this.format = 3;
		case 0x6C:
			this.mnemonic = "LDS";
			this.format = 3;
		case 0x74:
			this.mnemonic = "LDT";
			this.format = 3;
		case 0x04:
			this.mnemonic = "LDX";
			this.format = 3;
		case 0xD0:
			this.mnemonic = "LPS";
			this.format = 3;
		case 0x20:
			this.mnemonic = "MUL";
			this.format = 3;
		case 0x60:
			this.mnemonic = "MULF";
			this.format = 3;
		case 0x98:
			this.mnemonic = "MULR";
			this.format = 2;
		case 0xC8:
			this.mnemonic = "NORM";
			this.format = 1;
		case 0x44:
			this.mnemonic = "OR";
			this.format = 3;
		case 0xD8:
			this.mnemonic = "RD";
			this.format = 3;
		case 0xAC:
			this.mnemonic = "RMO";
			this.format = 2;
		case 0x4C:
			this.mnemonic = "RSUB";
			this.format = 3;
		case 0xA4:
			this.mnemonic = "SHIFTL";
			this.format = 2;
		case 0xA8:
			this.mnemonic = "SHIFTR";
			this.format = 2;
		case 0xF0:
			this.mnemonic = "SIO";
			this.format = 1;
		case 0xEC:
			this.mnemonic = "SSK";
			this.format = 3;
		case 0x0C:
			this.mnemonic = "STA";
			this.format = 3;
		case 0x78:
			this.mnemonic = "STB";
			this.format = 3;
		case 0x54:
			this.mnemonic = "STCH";
			this.format = 3;
		case 0x80:
			this.mnemonic = "STF";
			this.format = 3;
		case 0xD4:
			this.mnemonic = "STI";
			this.format = 3;
		case 0x14:
			this.mnemonic = "STL";
			this.format = 3;
		case 0x7C:
			this.mnemonic = "STS";
			this.format = 3;
		case 0xE8:
			this.mnemonic = "STSW";
			this.format = 3;
		case 0x84:
			this.mnemonic = "STT";
			this.format = 3;
		case 0x10:
			this.mnemonic = "STX";
			this.format = 3;
		case 0x1C:
			this.mnemonic = "SUB";
			this.format = 3;
		case 0x5C:
			this.mnemonic = "SUBF";
			this.format = 3;
		case 0x94:
			this.mnemonic = "SUBR";
			this.format = 2;
		case 0xB0:
			this.mnemonic = "SVC";
			this.format = 2;
		case 0xE0:
			this.mnemonic = "TD";
			this.format = 3;
		case 0xF8:
			this.mnemonic = "TIO";
			this.format = 1;
		case 0x2C:
			this.mnemonic = "TIX";
			this.format = 3;
		case 0xB8:
			this.mnemonic = "TIXR";
			this.format = 2;
		case 0xDC:
			this.mnemonic = "WD";
			this.format = 3;
		default:
			throw "unknown opcode";
		}
	}
}

export class sic_rdfile {
	contents: number[];
	reading: boolean;
	writing: boolean;
	constructor(contents: number[]) {
		this.contents = contents.map(val => {
			if (val < 0x00 || val > 0xFF) {
				throw "val must be in range [0x00-0xFF]";
			}
			return val;
		});
		this.reading = true;
		this.writing = false;
	}

	get(): number {
		return this.contents.shift();
	}

	eof(): boolean {
		return this.contents === undefined || this.contents.length == 0;
	}
}

export class sic_wrfile {
	contents: number[];
	reading: boolean;
	writing: boolean;

	constructor() {
		this.contents = [];
		this.reading = false;
		this.writing = true;
	}

	push(val: number): void {
		if (val < 0x00 || val > 0xFF) {
			throw "number must be in range [0x00-0xFF]";
		}
		this.contents.push(val);
	}
}

export interface sic_file {
	reading: boolean;
	writing: boolean;
}

export class sic_cpu {
	max_addr: number;
	xe: boolean;
	registers: number[];
	memory: number[];
	devices: sic_file[];
	opcodes: ((...args: any[]) => void)[];

	constructor(max_addr: number, xe: boolean) {
		if (max_addr <= 0x0) {
			throw "max_addr has to be at least 0x1"
		}
		if (max_addr > 0xFFFFF) {
			throw "sic/xe machines can only address up to 0xFFFFF";
		}
		this.max_addr = max_addr;
		this.xe = xe;
		this.registers["A"] = 0xFFFFFF; // accumulator
		this.registers["X"] = 0xFFFFFF; // index (relative address)
		this.registers["L"] = 0xFFFFFF; // linkage (return)
		this.registers["B"] = 0xFFFFFF; // base (xe only)
		this.registers["S"] = 0xFFFFFF; // general (xe only)
		this.registers["T"] = 0xFFFFFF; // general (xe only)
		this.registers["F"] = 0xFFFFFF; // floating point (xe only)
		this.registers["PC"] = 0x000000; // program-counter (instruction)
		this.registers["SW"] = '0'; // status-word (flag)
		for (let i = 0; i <= max_addr; ++i) {
			this.memory[i] = 0xFF;
		}
		this.devices = [];

		this.opcodes["ADD"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			this.registers["A"] += this.__sic_deref24(mem_loc);
			this.__sic_correct_flow("A");
		}

		this.opcodes["ADDR"] = (reg1, reg2) => {
			sic_cpu.__sic_dec_to_reg(reg1);
			sic_cpu.__sic_dec_to_reg(reg2);

			this.registers[reg2] += this.registers[reg1];
			this.__sic_correct_flow(reg2);
		}

		this.opcodes["AND"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			this.registers["A"] &= this.__sic_deref24(mem_loc);
		}

		this.opcodes["CLEAR"] = (reg) => {
			sic_cpu.__sic_dec_to_reg(reg);

			this.registers[reg] = 0x0;
		}

		this.opcodes["COMP"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			let x = this.registers["A"]
			let y = this.__sic_deref24(mem_loc);
			if (x > y) {
				this.registers["SW"] = '>';
			}
			else if (x < y) {
				this.registers["SW"] = '<';
			}
			else {
				this.registers["SW"] = '=';
			}
		}

		this.opcodes["COMPR"] = (reg1, reg2) => {
			sic_cpu.__sic_dec_to_reg(reg1);
			sic_cpu.__sic_dec_to_reg(reg2);

			let x = this.registers["A"]
			let y = this.registers["B"]
			if (x === undefined || y === undefined) {
				throw "One or more registers do not exist";
			}
			if (x > y) {
				this.registers["SW"] = '>';
			}
			else if (x < y) {
				this.registers["SW"] = '<';
			}
			else {
				this.registers["SW"] = '=';
			}
		}

		this.opcodes["DIV"] = (mem_loc) => {
			this.registers["A"] = Math.floor(this.registers["A"] / this.__sic_deref24(mem_loc));
		}

		this.opcodes["DIVR"] = (reg1, reg2) => {
			sic_cpu.__sic_dec_to_reg(reg1);
			sic_cpu.__sic_dec_to_reg(reg2);

			this.registers[reg2] = Math.floor(this.registers[reg2] / this.registers[reg1]);
		}

		this.opcodes["J"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			this.registers["PC"] = mem_loc;
		}

		this.opcodes["JEQ"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			if (this.registers["SW"] === '=') {
				this.opcodes["J"](mem_loc);
			}
		}

		this.opcodes["JGT"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			if (this.registers["SW"] === '>') {
				this.opcodes["J"](mem_loc);
			}
		}

		this.opcodes["JLE"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			if (this.registers["SW"] === '<') {
				this.opcodes["J"](mem_loc);
			}
		}

		this.opcodes["JSUB"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			this.registers["L"] = this.registers["PC"];
			this.registers["PC"] = mem_loc;
		}

		this.opcodes["LDA"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			this.registers["A"] = this.__sic_deref24(mem_loc);
		}

		this.opcodes["LDB"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			this.registers["B"] = this.__sic_deref24(mem_loc);
		}

		this.opcodes["LDCH"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			this.registers["A"] = this.registers["A"] & 0xFFFF00 + this.__sic_deref8(mem_loc);
		}

		this.opcodes["LDL"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			this.registers["L"] = this.__sic_deref24(mem_loc);
		}

		this.opcodes["LDS"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			this.registers["S"] = this.__sic_deref24(mem_loc);
		}

		this.opcodes["LDT"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			this.registers["T"] = this.__sic_deref24(mem_loc);
		}

		this.opcodes["LDX"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			this.registers["X"] = this.__sic_deref24(mem_loc);
		}

		this.opcodes["MUL"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			this.registers["A"] *= this.__sic_deref24(mem_loc);
			this.__sic_correct_flow("A");
		}

		this.opcodes["MULR"] = (reg1, reg2) => {
			sic_cpu.__sic_dec_to_reg(reg1);
			sic_cpu.__sic_dec_to_reg(reg2);

			this.registers[reg2] *= this.registers[reg1];
			this.__sic_correct_flow(reg2);
		}

		this.opcodes["OR"] = (mem_loc) => {
			this.__sic_validate_addr(mem_loc);

			this.registers["A"] |= this.__sic_deref24(mem_loc);
		}

		this.opcodes["RD"] = (dev_name) => {
			this.__sic_validate_rddev(dev_name);

			let dev = this.devices[dev_name];
			let ch = (<sic_rdfile>dev).get();

			if (ch === undefined) {
				return 0x4; // EOF
			}

			this.opcodes["LDCH"](ch);
		}

		this.opcodes["RMO"] = (reg1, reg2) => {
			sic_cpu.__sic_dec_to_reg(reg1);
			sic_cpu.__sic_dec_to_reg(reg2);

			this.registers[reg2] = this.registers[reg1];
		}

		this.opcodes["RSUB"] = () => {
			this.registers["PC"] = this.registers["L"];
		}

		this.opcodes["SHIFTL"] = (reg: number, n: number) => {
			sic_cpu.__sic_dec_to_reg(reg);

			// circular shift. not regular bitshift
			for (let i = 0; i < n; ++i) {
				let tmp = reg & 0x800000 >>> 23;
				this.registers[reg] <<= 1;
				this.registers[reg] += tmp;
			}
		}

		this.opcodes["SHIFTR"] = (reg: number, n: number): void => {
			sic_cpu.__sic_dec_to_reg(reg);

			// >> does sign extension, >>> does zero extension
			this.registers[reg] >>= n;
		}

		this.opcodes["STA"] = (mem_loc: number): void => {
			this.__sic_validate_addr(mem_loc);

			this.__sic_place24(this.registers["A"], mem_loc);
		}

		this.opcodes["STB"] = (mem_loc: number): void => {
			this.__sic_validate_addr(mem_loc);

			this.__sic_place24(this.registers["B"], mem_loc);
		}

		this.opcodes["STCH"] = (mem_loc: number): void => {
			this.__sic_validate_addr(mem_loc);

			this.__sic_place8(this.registers["A"] & 0xFF, mem_loc);
		}

		this.opcodes["STI"] = (mem_loc: number): void => {
			throw "sti not implemented yet";
		}

		this.opcodes["STL"] = (mem_loc: number): void => {
			this.__sic_validate_addr(mem_loc);

			this.__sic_place24(this.registers["L"], mem_loc);
		}

		this.opcodes["STSW"] = (mem_loc: number): void => {
			throw "stsw not implemented yet";
		}

		this.opcodes["STT"] = (mem_loc: number): void => {
			this.__sic_validate_addr(mem_loc);

			this.__sic_place24(this.registers["T"], mem_loc);
		}

		this.opcodes["STX"] = (mem_loc: number): void => {
			this.__sic_validate_addr(mem_loc);

			this.__sic_place24(this.registers["X"], mem_loc);
		}

		this.opcodes["SUB"] = (mem_loc: number): void => {
			this.__sic_validate_addr(mem_loc);

			this.registers["A"] -= this.__sic_deref24(mem_loc);
			this.__sic_correct_flow("A");
		}

		this.opcodes["SUBR"] = (reg1: number, reg2: number): void => {
			let r1 = sic_cpu.__sic_dec_to_reg(reg1);
			let r2 = sic_cpu.__sic_dec_to_reg(reg2);

			this.registers[r2] -= this.registers[r1];
			this.__sic_correct_flow(r2);
		}

		this.opcodes["SVC"] = (n: number): void => {
			throw "svc not implemented yet";
		}

		this.opcodes["TD"] = (dev_name: string): void => {
			// THE DEVICE IS ALWAYS READY
			this.registers["SW"] = '=';
		}

		this.opcodes["TIX"] = (mem_loc: number): void => {
			this.__sic_validate_addr(mem_loc);

			this.registers["X"]++;
			this.opcodes["COMP"](mem_loc);
		}

		this.opcodes["TIXR"] = (reg: number): void => {
			let q = sic_cpu.__sic_dec_to_reg(reg);

			this.registers["X"]++;
			this.opcodes["COMPR"](reg);
		}

		this.opcodes["WD"] = (dev_name: string): void => {
			this.__sic_validate_wrdev(dev_name);

			(<sic_wrfile>this.devices[dev_name]).push(this.registers["A"] & 0xFF);
		}
	}

	add_rddev(name: string, data: number[]): void {
		for (let n of data) {
			if (n < 0x00 || n > 0xFF) {
				throw "all bytes in data must be in range [0x00-0xFF]";
			}
		}
		if (this.devices[name] != null) {
			throw "there's already a device with the name " + name;
		}
		this.devices[name] = new sic_rdfile(data);
	}

	rm_rddev(name: string): void {
		if (this.devices[name] == null) {
			throw "device " + name + " does not exist";
		}
		delete this.devices[name];
	}

	add_wrdev(name: string): void {
		if (this.devices[name] != null) {
			throw "there's already a device with the name " + name;
		}
		this.devices[name] = new sic_wrfile();
	}

	rm_wrdev(name: string): void {
		if (this.devices[name] == null) {
			throw "device " + name + " does not exist";
		}
		delete this.devices[name];
	}

	__sic_validate_addr(mem_loc: number): void {
		if (mem_loc < 0x0 || mem_loc > this.max_addr) {
			throw "mem_loc is outside the addressable range";
		}
	}

	__sic_validate_rddev(dev_name: string): void {
		if (this.devices[dev_name] == null) {
			throw "device " + dev_name + " does not exist";
		}
		if (this.devices[dev_name].reading !== true) {
			throw "device " + dev_name + " is not opened for reading";
		}
	}

	__sic_validate_wrdev(dev_name: string): void {
		if (this.devices[dev_name] == null) {
			throw "device " + dev_name + " does not exist";
		}
		if (this.devices[dev_name].writing !== true) {
			throw "device " + dev_name + " is not opened for writing"
		}
	}

	__sic_deref24(mem_loc: number): number {
		if (mem_loc < 0x0 || mem_loc > this.max_addr - 0x2) {
			throw "mem_loc is outside the addressable range";
		}
		return this.memory[mem_loc] << 16 + this.memory[mem_loc + 1] << 8 + this.memory[mem_loc + 2];
	}

	__sic_deref16(mem_loc: number): number {
		if (mem_loc < 0x0 || mem_loc > this.max_addr - 0x1) {
			throw "mem_loc is outside the addressable range";
		}
		return this.memory[mem_loc] << 8 + this.memory[mem_loc + 1];
	}

	__sic_deref8(mem_loc: number): number {
		if (mem_loc < 0x0 || mem_loc > this.max_addr) {
			throw "mem_loc is outside the addressable range";
		}
		return this.memory[mem_loc];
	}

	__sic_place24(val: number, mem_loc: number): void {
		if (val < 0x0 || val > 0xFFFFFF) {
			throw "val is outside a 24-bit range";
		}
		if (mem_loc < 0x0 || mem_loc > this.max_addr - 0x2) {
			throw "mem_loc is outside the addressable range";
		}

		this.memory[mem_loc] = val & 0xFF0000 >> 16;
		this.memory[mem_loc + 1] = val & 0xFF00 >> 8;
		this.memory[mem_loc + 2] = val & 0xFF;
	}

	__sic_place16(val: number, mem_loc: number): void {
		if (val < 0x0 || val > 0xFFFF) {
			throw "val is outside a 16-bit range";
		}
		if (mem_loc < 0x0 || mem_loc > this.max_addr - 0x1) {
			throw "mem_loc is outside the addressable range";
		}

		this.memory[mem_loc] = val & 0xFF00 >> 8;
		this.memory[mem_loc + 1] = val & 0xFF;
	}

	__sic_place8(val: number, mem_loc: number): void {
		if (val < 0x0 || val > 0xFF) {
			throw "val is outside an 8-bit range";
		}
		if (mem_loc < 0x0 || mem_loc > this.max_addr) {
			throw "mem_loc is outside the addressable range";
		}

		this.memory[mem_loc] = val;
	}

	__sic_correct_flow(reg: string): void {
		if (this.registers["reg"] == null) {
			throw "reg " + reg + " does not exist";
		}

		let x = this.registers["reg"];
		while (x < 0xFFFFFF) {
			x += 0xFFFFFF;
		}
		x %= 0xFFFFFF;
		this.registers["reg"] = x;
	}

	static __sic_dec_to_reg(reg: number): string {
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
				throw reg + " is not a valid register";
		}
	}
}