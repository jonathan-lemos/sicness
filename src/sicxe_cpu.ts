/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

import {sicCheckUnsigned, sicDecToReg, sicMakeUnsigned, sicRegToDec} from "./sicxe_cc";

export class OpcodeArrEntry{
	public mnemonic: string;
	public opcode: number;
	public format: number;

	constructor(mnemonic: string, opcode: number, format: number){
		this.mnemonic = mnemonic;
		this.opcode = opcode;
		this.format = format;
	}
}

export const opcodeArr: OpcodeArrEntry[] = [];
opcodeArr[0x18] = new OpcodeArrEntry("ADD", 0x18, 3);
opcodeArr[0x58] = new OpcodeArrEntry("ADDF", 0x58, 3);
opcodeArr[0x90] = new OpcodeArrEntry("ADDR", 0x90, 2);
opcodeArr[0x40] = new OpcodeArrEntry("AND", 0x40, 3);
opcodeArr[0xB4] = new OpcodeArrEntry("CLEAR", 0xB4, 2);
opcodeArr[0x28] = new OpcodeArrEntry("COMP", 0x28, 3);
opcodeArr[0x88] = new OpcodeArrEntry("COMPF", 0x88, 3);
opcodeArr[0xA0] = new OpcodeArrEntry("COMPR", 0xA0, 2);
opcodeArr[0x24] = new OpcodeArrEntry("DIV", 0x24, 3);
opcodeArr[0x64] = new OpcodeArrEntry("DIVF", 0x64, 3);
opcodeArr[0x9C] = new OpcodeArrEntry("DIVR", 0x9C, 2);
opcodeArr[0xC4] = new OpcodeArrEntry("FIX", 0xC4, 1);
opcodeArr[0xC0] = new OpcodeArrEntry("FLOAT", 0xC0, 1);
opcodeArr[0xF4] = new OpcodeArrEntry("HIO", 0xF4, 1);
opcodeArr[0x3C] = new OpcodeArrEntry("J", 0x3C, 3);
opcodeArr[0x30] = new OpcodeArrEntry("JEQ", 0x30, 3);
opcodeArr[0x38] = new OpcodeArrEntry("JLT", 0x38, 3);
opcodeArr[0x48] = new OpcodeArrEntry("JSUB", 0x48, 3);
opcodeArr[0x00] = new OpcodeArrEntry("LDA", 0x00, 3);
opcodeArr[0x68] = new OpcodeArrEntry("LDB", 0x68, 3);
opcodeArr[0x50] = new OpcodeArrEntry("LDCH", 0x50, 3);
opcodeArr[0x70] = new OpcodeArrEntry("LDF", 0x70, 3);
opcodeArr[0x08] = new OpcodeArrEntry("LDL", 0x08, 3);
opcodeArr[0x6C] = new OpcodeArrEntry("LDS", 0x6C, 3);
opcodeArr[0x74] = new OpcodeArrEntry("LDT", 0x74, 3);
opcodeArr[0x04] = new OpcodeArrEntry("LDX", 0x04, 3);
opcodeArr[0xD0] = new OpcodeArrEntry("LPS", 0xD0, 3);
opcodeArr[0x20] = new OpcodeArrEntry("MUL", 0x20, 3);
opcodeArr[0x60] = new OpcodeArrEntry("MULF", 0x60, 3);
opcodeArr[0x98] = new OpcodeArrEntry("MULR", 0x98, 2);
opcodeArr[0xC8] = new OpcodeArrEntry("NORM", 0xC8, 1);
opcodeArr[0x44] = new OpcodeArrEntry("OR", 0x44, 3);
opcodeArr[0xD8] = new OpcodeArrEntry("RD", 0xD8, 3);
opcodeArr[0xAC] = new OpcodeArrEntry("RMO", 0xAC, 2);
opcodeArr[0x4C] = new OpcodeArrEntry("RSUB", 0x4C, 3);
opcodeArr[0xA4] = new OpcodeArrEntry("SHIFTL", 0xA4, 2);
opcodeArr[0xA8] = new OpcodeArrEntry("SHIFTR", 0xA8, 2);
opcodeArr[0xF0] = new OpcodeArrEntry("SIO", 0xF0, 1);
opcodeArr[0xEC] = new OpcodeArrEntry("SSK", 0xEC, 3);
opcodeArr[0x0C] = new OpcodeArrEntry("STA", 0x0C, 3);
opcodeArr[0x78] = new OpcodeArrEntry("STB", 0x78, 3);
opcodeArr[0x54] = new OpcodeArrEntry("STCH", 0x54, 3);
opcodeArr[0x80] = new OpcodeArrEntry("STF", 0x80, 3);
opcodeArr[0xD4] = new OpcodeArrEntry("STI", 0xD4, 3);
opcodeArr[0x14] = new OpcodeArrEntry("STL", 0x14, 3);
opcodeArr[0x7C] = new OpcodeArrEntry("STS", 0x7C, 3);
opcodeArr[0xE8] = new OpcodeArrEntry("STSW", 0xE8, 3);
opcodeArr[0x84] = new OpcodeArrEntry("STT", 0x84, 3);
opcodeArr[0x10] = new OpcodeArrEntry("STX", 0x10, 3);
opcodeArr[0x1C] = new OpcodeArrEntry("SUB", 0x1C, 3);
opcodeArr[0x5C] = new OpcodeArrEntry("SUBF", 0x5C, 3);
opcodeArr[0x94] = new OpcodeArrEntry("SUBR", 0x94, 2);
opcodeArr[0xB0] = new OpcodeArrEntry("SVC", 0xB0, 2);
opcodeArr[0xE0] = new OpcodeArrEntry("TD", 0xE0, 3);
opcodeArr[0xF8] = new OpcodeArrEntry("TIO", 0xF8, 1);
opcodeArr[0x2C] = new OpcodeArrEntry("TIX", 0x2C, 3);
opcodeArr[0xB8] = new OpcodeArrEntry("TIXR", 0xB8, 2);
opcodeArr[0xDC] = new OpcodeArrEntry("WD", 0xDC, 3);

export class SicRdFile {
	public contents: number[];
	public reading: boolean;
	public writing: boolean;
	constructor(contents: number[]) {
		this.contents = contents.map(val => {
			sicCheckUnsigned(val, 8);
			return val;
		});
		this.reading = true;
		this.writing = false;
	}

	public get(): number {
		if (this.contents.length === 0){
			return 0x04; // EOF
		}
		return this.contents.shift() as number;
	}

	public eof(): boolean {
		return this.contents === undefined || this.contents.length === 0;
	}
}

export class SicWrFile {
	public contents: number[];
	public reading: boolean;
	public writing: boolean;

	constructor() {
		this.contents = [];
		this.reading = false;
		this.writing = true;
	}

	public push(val: number): void {
		sicCheckUnsigned(val, 8);
		this.contents.push(val);
	}
}

export interface ISicFile {
	reading: boolean;
	writing: boolean;
}

export class SicHexRegister{
	private val: number;

	constructor(defaultVal: number = 0xFFFFFF){
		this.val = defaultVal;
	}

	public add(n: number){
		sicCheckUnsigned(n, 24);
		this.val += n;
		this.correctFlow();
	}

	public sub(n: number){
		sicCheckUnsigned(n, 24);
		this.val -= n;
		this.correctFlow();
	}

	public mul(n: number){
		sicCheckUnsigned(n, 24);
		this.val *= n;
		this.correctFlow();
	}

	public div(n: number): void{
		sicCheckUnsigned(n, 24);
		this.val /= n;
	}

	public get(): number{
		return this.val;
	}

	public float(n: number): number{
		return 0; // TODO
	}

	private correctFlow(): void {
		while (this.val < 0x0) {
			this.val += 0xFFFFFF;
		}
		this.val %= 0xFFFFFF;
	}
}

export class SicFloatRegister{
	private static hexToFloat(n: number): number{
		return 0; // TODO
	}

	private static floatToHex(n: number): number{
		return 0; // TODO
	}

	private val: number;

	constructor(defaultVal: number = 0) {
		this.val = defaultVal;
	}

	public add(n: number): void{
		this.val += n;
	}

	public sub(n: number): void{
		this.val -= n;
	}

	public mul(n: number): void{
		this.val *= n;
	}

	public div(n: number): void{
		this.val /= n;
	}

	public getHex(): number{
		return SicFloatRegister.floatToHex(this.val);
	}

	public getFloat(): number{
		return this.val;
	}

	public fix(n: number){
		return Math.floor(n);
	}
}

export class SicControlRegister{
	private modeSuper: boolean;
	private stateRunning: boolean;
	private pid: number;
	private conditionCode: number;
	private maskInterrupt: number;
	private interuptCode: number;
}

export type SicCpuOperation = (() => void) | ((op: number) => void) | ((op1: number, op2: number) => void);

export class SicCpu {
	private static makeRegisters(): { [reg: string]: SicHexRegister } {
		const reg: { [r: string]: SicHexRegister } = {};
		reg["A"] = new SicHexRegister(); // accumulator
		reg["X"] = new SicHexRegister(); // index (relative address)
		reg["L"] = new SicHexRegister(); // linkage (return)
		reg["B"] = new SicHexRegister(); // base (xe only)
		reg["S"] = new SicHexRegister(); // general (xe only)
		reg["T"] = new SicHexRegister(); // general (xe only)
		reg["F"] = new SicHexRegister(); // floating point (xe only)
		reg["PC"] = new SicHexRegister(0x000000); // program-counter (instruction)
		reg["SW"] = "0".charCodeAt(0); // status-word (flag)
		return reg;
	}

	private static makeMemory(maxAddr: number): number[] {
		const mem: number[] = [];
		for (let i = 0; i <= maxAddr; ++i) {
			mem[i] = 0xFF;
		}
		return mem;
	}

	private makeOpcodes(): { [op: string]: SicCpuOperation } {
		const ret: { [op: string]: SicCpuOperation } = {};

		ret["ADD"] = (memLoc: number) => {
			this.__sic_validate_addr(memLoc);

			this.registers["A"] += this.__sic_deref24(memLoc);
			this.__sic_correct_flow("A");
		};

		ret["ADDR"] = (reg1, reg2) => {
			SicCpu.__sic_dec_to_reg(reg1);
			SicCpu.__sic_dec_to_reg(reg2);

			this.registers[reg2] += this.registers[reg1];
			this.__sic_correct_flow(reg2);
		}

		ret["AND"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			this.registers["A"] &= this.__sic_deref24(memLoc);
		}

		ret["CLEAR"] = (reg) => {
			SicCpu.__sic_dec_to_reg(reg);

			this.registers[reg] = 0x0;
		}

		ret["COMP"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			let x = this.registers["A"]
			let y = this.__sic_deref24(memLoc);
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

		ret["COMPR"] = (reg1, reg2) => {
			SicCpu.__sic_dec_to_reg(reg1);
			SicCpu.__sic_dec_to_reg(reg2);

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

		ret["DIV"] = (memLoc) => {
			this.registers["A"] = Math.floor(this.registers["A"] / this.__sic_deref24(memLoc));
		}

		ret["DIVR"] = (reg1, reg2) => {
			SicCpu.__sic_dec_to_reg(reg1);
			SicCpu.__sic_dec_to_reg(reg2);

			this.registers[reg2] = Math.floor(this.registers[reg2] / this.registers[reg1]);
		}

		ret["J"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			this.registers["PC"] = memLoc;
		}

		ret["JEQ"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			if (this.registers["SW"] === '=') {
				ret["J"](memLoc);
			}
		}

		ret["JGT"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			if (this.registers["SW"] === '>') {
				ret["J"](memLoc);
			}
		}

		ret["JLE"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			if (this.registers["SW"] === '<') {
				ret["J"](memLoc);
			}
		}

		ret["JSUB"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			this.registers["L"] = this.registers["PC"];
			this.registers["PC"] = memLoc;
		}

		ret["LDA"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			this.registers["A"] = this.__sic_deref24(memLoc);
		}

		ret["LDB"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			this.registers["B"] = this.__sic_deref24(memLoc);
		}

		ret["LDCH"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			this.registers["A"] = this.registers["A"] & 0xFFFF00 + this.__sic_deref8(memLoc);
		}

		ret["LDL"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			this.registers["L"] = this.__sic_deref24(memLoc);
		}

		ret["LDS"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			this.registers["S"] = this.__sic_deref24(memLoc);
		}

		ret["LDT"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			this.registers["T"] = this.__sic_deref24(memLoc);
		}

		ret["LDX"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			this.registers["X"] = this.__sic_deref24(memLoc);
		}

		ret["MUL"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			this.registers["A"] *= this.__sic_deref24(memLoc);
			this.__sic_correct_flow("A");
		}

		ret["MULR"] = (reg1, reg2) => {
			SicCpu.__sic_dec_to_reg(reg1);
			SicCpu.__sic_dec_to_reg(reg2);

			this.registers[reg2] *= this.registers[reg1];
			this.__sic_correct_flow(reg2);
		}

		ret["OR"] = (memLoc) => {
			this.__sic_validate_addr(memLoc);

			this.registers["A"] |= this.__sic_deref24(memLoc);
		}

		ret["RD"] = (dev_name) => {
			this.__sic_validate_rddev(dev_name);

			let dev = this.devices[dev_name];
			let ch = (<SicRdFile>dev).get();

			if (ch === undefined) {
				return 0x4; // EOF
			}

			ret["LDCH"](ch);
		}

		ret["RMO"] = (reg1, reg2) => {
			SicCpu.__sic_dec_to_reg(reg1);
			SicCpu.__sic_dec_to_reg(reg2);

			this.registers[reg2] = this.registers[reg1];
		}

		ret["RSUB"] = () => {
			this.registers["PC"] = this.registers["L"];
		}

		ret["SHIFTL"] = (reg: number, n: number) => {
			SicCpu.__sic_dec_to_reg(reg);

			// circular shift. not regular bitshift
			for (let i = 0; i < n; ++i) {
				let tmp = reg & 0x800000 >>> 23;
				this.registers[reg] <<= 1;
				this.registers[reg] += tmp;
			}
		}

		ret["SHIFTR"] = (reg: number, n: number): void => {
			SicCpu.__sic_dec_to_reg(reg);

			// >> does sign extension, >>> does zero extension
			this.registers[reg] >>= n;
		}

		ret["STA"] = (memLoc: number): void => {
			this.__sic_validate_addr(memLoc);

			this.__sic_place24(this.registers["A"], memLoc);
		}

		ret["STB"] = (memLoc: number): void => {
			this.__sic_validate_addr(memLoc);

			this.__sic_place24(this.registers["B"], memLoc);
		}

		ret["STCH"] = (memLoc: number): void => {
			this.__sic_validate_addr(memLoc);

			this.__sic_place8(this.registers["A"] & 0xFF, memLoc);
		}

		ret["STI"] = (memLoc: number): void => {
			throw "sti not implemented yet";
		}

		ret["STL"] = (memLoc: number): void => {
			this.__sic_validate_addr(memLoc);

			this.__sic_place24(this.registers["L"], memLoc);
		}

		ret["STSW"] = (memLoc: number): void => {
			throw "stsw not implemented yet";
		}

		ret["STT"] = (memLoc: number): void => {
			this.__sic_validate_addr(memLoc);

			this.__sic_place24(this.registers["T"], memLoc);
		}

		ret["STX"] = (memLoc: number): void => {
			this.__sic_validate_addr(memLoc);

			this.__sic_place24(this.registers["X"], memLoc);
		}

		ret["SUB"] = (memLoc: number): void => {
			this.__sic_validate_addr(memLoc);

			this.registers["A"] -= this.__sic_deref24(memLoc);
			this.__sic_correct_flow("A");
		}

		ret["SUBR"] = (reg1: number, reg2: number): void => {
			let r1 = SicCpu.__sic_dec_to_reg(reg1);
			let r2 = SicCpu.__sic_dec_to_reg(reg2);

			this.registers[r2] -= this.registers[r1];
			this.__sic_correct_flow(r2);
		}

		ret["SVC"] = (n: number): void => {
			throw "svc not implemented yet";
		}

		ret["TD"] = (dev_name: string): void => {
			// THE DEVICE IS ALWAYS READY
			this.registers["SW"] = '=';
		}

		ret["TIX"] = (memLoc: number): void => {
			this.__sic_validate_addr(memLoc);

			this.registers["X"]++;
			ret["COMP"](memLoc);
		}

		ret["TIXR"] = (reg: number): void => {
			let q = SicCpu.__sic_dec_to_reg(reg);

			this.registers["X"]++;
			ret["COMPR"](reg);
		}

		ret["WD"] = (dev_name: string): void => {
			this.__sic_validate_wrdev(dev_name);

			(<SicWrFile>this.devices[dev_name]).push(this.registers["A"] & 0xFF);
		}

		return ret;
	}

	public maxAddr: number;
	public registers: { [reg: string]: number };
	public memory: number[];
	public devices: ISicFile[];
	public opcodes: { [opcode: string]: () => void };

	constructor(maxAddr: number, xe: boolean) {
		sicCheckUnsigned(maxAddr, 20);
		this.maxAddr = maxAddr;

		this.registers = SicCpu.makeRegisters();
		this.memory = SicCpu.makeMemory(this.maxAddr);
		this.devices = [];


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
		this.devices[name] = new SicRdFile(data);
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
		this.devices[name] = new SicWrFile();
	}

	rm_wrdev(name: string): void {
		if (this.devices[name] == null) {
			throw "device " + name + " does not exist";
		}
		delete this.devices[name];
	}

	__sic_validate_addr(memLoc: number): void {
		if (memLoc < 0x0 || memLoc > this.maxAddr) {
			throw "memLoc is outside the addressable range";
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

	__sic_deref24(memLoc: number): number {
		if (memLoc < 0x0 || memLoc > this.maxAddr - 0x2) {
			throw "memLoc is outside the addressable range";
		}
		return this.memory[memLoc] << 16 + this.memory[memLoc + 1] << 8 + this.memory[memLoc + 2];
	}

	__sic_deref16(memLoc: number): number {
		if (memLoc < 0x0 || memLoc > this.maxAddr - 0x1) {
			throw "memLoc is outside the addressable range";
		}
		return this.memory[memLoc] << 8 + this.memory[memLoc + 1];
	}

	__sic_deref8(memLoc: number): number {
		if (memLoc < 0x0 || memLoc > this.maxAddr) {
			throw "memLoc is outside the addressable range";
		}
		return this.memory[memLoc];
	}

	__sic_place24(val: number, memLoc: number): void {
		if (val < 0x0 || val > 0xFFFFFF) {
			throw "val is outside a 24-bit range";
		}
		if (memLoc < 0x0 || memLoc > this.maxAddr - 0x2) {
			throw "memLoc is outside the addressable range";
		}

		this.memory[memLoc] = val & 0xFF0000 >> 16;
		this.memory[memLoc + 1] = val & 0xFF00 >> 8;
		this.memory[memLoc + 2] = val & 0xFF;
	}

	__sic_place16(val: number, memLoc: number): void {
		if (val < 0x0 || val > 0xFFFF) {
			throw "val is outside a 16-bit range";
		}
		if (memLoc < 0x0 || memLoc > this.maxAddr - 0x1) {
			throw "memLoc is outside the addressable range";
		}

		this.memory[memLoc] = val & 0xFF00 >> 8;
		this.memory[memLoc + 1] = val & 0xFF;
	}

	__sic_place8(val: number, memLoc: number): void {
		if (val < 0x0 || val > 0xFF) {
			throw "val is outside an 8-bit range";
		}
		if (memLoc < 0x0 || memLoc > this.maxAddr) {
			throw "memLoc is outside the addressable range";
		}

		this.memory[memLoc] = val;
	}

}
