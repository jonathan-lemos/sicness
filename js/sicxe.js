let sic_rdfile = (contents) => {
	if (!Array.isArray(contents)){
		throw "Contents needs to be a byte array";
	}
	this.contents = contents.map(val => {
		if (typeof val !== "number"){
			throw "val must be a number";
		}
		if (val < 0x00 || val > 0xFF){
			throw "The values in the byte array have to be in the range [0x00-0xFF]"
		}
		return val;
	});
	this.reading = true;
	this.writing = false;
}

let sic_rdfile.prototype.get = () => {
	var q = contents[0];
	this.contents.shift();
}

let sic_rdfile.prototype.eof = () => {
	return contents[0] == null;
}

let sic_wrfile = () => {
	this.contents = [];
	this.reading = false;
	this.writing = true;
}

let sic_wrfile.prototype.push = (val) => {
	if (typeof val !== "number"){
		throw "val must be a number";
	}
	if (val < 0x00 || val > 0xFF){
		throw "val must be in range [0x00-0xFF]"
	}
	this.contents.push(val);
}

let sic_cpu = (max_addr) => {
	this.registers = {};
	this.registers["A"]  = 0xFFFFFF; // accumulator
	this.registers["X"]  = 0xFFFFFF; // index (relative address)
	this.registers["L"]  = 0xFFFFFF; // linkage (return)
	this.registers["PC"] = 0x000000; // program-counter (instruction)
	this.registers["SW"] = 0x000000; // status-word (flag)
	this.max_addr        = max_addr;
	this.memory          = [];
	this.devices         = {};
}

let sicxe_cpu = (max_addr) => {
	this.registers = {};
	this.registers["A"]  = 0xFFFFFF; // accumulator
	this.registers["X"]  = 0xFFFFFF; // index (relative address)
	this.registers["L"]  = 0xFFFFFF; // linkage (return)
	this.registers["B"]  = 0xFFFFFF; // base
	this.registers["S"]  = 0xFFFFFF; // general
	this.registers["T"]  = 0xFFFFFF; // general
	this.registers["F"]  = 0xFFFFFF; // floating point
	this.registers["PC"] = 0x000000; // program-counter (instruction)
	this.registers["SW"] = 0x000000; // status-word (flag)
	this.max_addr        = max_addr;
	this.memory          = [];
	this.devices         = {};
}
let sicxe_cpu.prototype = Object.create(new sic_cpu());

let sic_cpu.prototype.add_rddev = (name, data) => {
	this.devices[name] = new sic_rdfile(data);
}

let sic_cpu.prototype.add_wrdev = (name) => {
	this.devices[name] = new sic_wrfile();
}

let sic_cpu.prototype.__sic_validate_addr = (mem_loc) => {
	if (typeof mem_loc !== "number"){
		throw "mem_loc is not a number";
	}
	if (mem_loc < 0x00 || mem_loc > this.max_addr){
		throw "mem_loc is outside the addressable range";
	}
}

let sic_cpu.prototype.__sic_validate_reg = (reg) => {
	if (typeof reg !== "string"){
		throw "reg is not a string";
	}
	if (this.registers[reg] === undefined){
		throw "reg " + reg + " does not exist";
	}
}

let sic_cpu.prototype.__sic_validate_rddev = (dev_name) => {
	if (typeof dev_name !== "string"){
		throw "dev_name is not a string";
	}
	if (this.devices[dev_name] === undefined){
		throw "dev " + dev_name + " does not exist";
	}
	if (this.reading !== true){
		throw "dev " + dev_name + " is not opened for reading";
	}
}

let sic_cpu.prototype.__sic_validate_wrdev = (dev_name) => {
	if (typeof dev_name !== "string"){
		throw "dev_name is not a string";
	}
	if (this.devices[dev_name] === undefined){
		throw "dev " + dev_name + " does not exist";
	}
	if (this.writing !== true){
		throw "dev " + dev_name + " is not opened for reading";
	}
}

let sic_cpu.prototype.__sic_deref24 = (mem_loc) => {
	if (typeof mem_loc !== "number"){
		throw "mem_loc is not a number";
	}
	if (mem_loc < 0x0 || mem_loc > this.max_addr - 0x2){
		throw "mem_loc is outside the addressable range";
	}
	return this.memory[mem_loc] << 16 + this.memory[mem_loc + 1] << 8 + this.memory[mem_loc + 2];
}

let sic_cpu.prototype.__sic_deref16 = (mem_loc) => {
	if (typeof mem_loc !== "number"){
		throw "mem_loc is not a number";
	}
	if (mem_loc < 0x0 || mem_loc > this.max_addr - 0x1){
		throw "mem_loc is outside the addressable range";
	}
	return this.memory[mem_loc] << 8 + this.memory[mem_loc + 1];
}

let sic_cpu.prototype.__sic_deref8 = (mem_loc) => {
	if (typeof mem_loc !== "number"){
		throw "mem_loc is not a number";
	}
	if (mem_loc < 0x0 || mem_loc > this.max_addr){
		throw "mem_loc is outside the addressable range";
	}
	return this.memory[mem_loc];
}

let sic_cpu.prototype.__sic_place24 = (val, mem_loc) => {
	if (typeof val !== "number"){
		throw "val is not a number";
	}
	if (typeof mem_loc !== "number"){
		throw "mem_loc is not a number";
	}
	if (val < 0x0 || val > 0xFFFFFF){
		throw "val is outside a 24-bit range";
	}
	if (mem_loc < 0x0 || mem_loc > this.max_addr - 0x2){
		throw "mem_loc is outside the addressable range";
	}

	this.memory[mem_loc]     = val & 0xFF0000 >> 16;
	this.memory[mem_loc + 1] = val &   0xFF00 >> 8;
	this.memory[mem_loc + 2] = val &     0xFF;
}

let sic_cpu.prototype.__sic_place16 = (val, mem_loc) => {
	if (typeof val !== "number"){
		throw "val is not a number";
	}
	if (typeof mem_loc !== "number"){
		throw "mem_loc is not a number";
	}
	if (val < 0x0 || val > 0xFFFF){
		throw "val is outside a 16-bit range";
	}
	if (mem_loc < 0x0 || mem_loc > this.max_addr - 0x1){
		throw "mem_loc is outside the addressable range";
	}

	this.memory[mem_loc]     = val & 0xFF00 >> 8;
	this.memory[mem_loc + 1] = val &   0xFF;
}

let sic_cpu.prototype.__sic_place8 = (val, mem_loc) => {
	if (typeof val !== "number"){
		throw "val is not a number";
	}
	if (typeof mem_loc !== "number"){
		throw "mem_loc is not a number";
	}
	if (val < 0x0 || val > 0xFF){
		throw "val is outside an 8-bit range";
	}
	if (mem_loc < 0x0 || mem_loc > this.max_addr){
		throw "mem_loc is outside the addressable range";
	}

	this.memory[mem_loc] = val;
}

let sic_cpu.prototype.__sic_correct_flow = (reg) => {
	this.__sic_validate_reg(reg);

	var x = this.registers["reg"];
	while (x < 0xFFFFFF){
		x += 0xFFFFFF;
	}
	x %= 0xFFFFFF;
	this.registers["reg"] = x;
}

let sic_cpu.prototype.opcodes["ADD"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	this.registers["A"] += this.__sic_deref24(mem_loc);
	this.__sic_correct_flow("A");
}

let sicxe_cpu.prototype.opcodes["ADDR"] = (reg1, reg2) => {
	this.__sic_validate_reg(reg1);
	this.__sic_validate_reg(reg2);

	this.registers[reg2] += this.registers[reg1];
	this.__sic_correct_flow(reg2);
}

let sicxe_cpu.prototype.opcodes["AND"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	this.registers["A"] &= this.__sic_deref24(mem_loc);
}

let sicxe_cpu.prototype.opcodes["CLEAR"] = (reg) => {
	this.__sic_validate_reg(reg);

	this.registers[reg] = 0x0;
}

let sic_cpu.prototype.opcodes["COMP"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	var x = this.registers["A"]
	var y = this.__sic_deref24(mem_loc);
	if (x > y){
		this.registers["SW"] = '>';
	}
	else if (x < y){
		this.registers["SW"] = '<';
	}
	else{
		this.registers["SW"] = '=';
	}
}

let sicxe_cpu.prototype.opcodes["COMPR"] = (reg1, reg2) => {
	this.__sic_validate_reg(reg1);
	this.__sic_validate_reg(reg2);

	var x = this.registers["A"]
	var y = this.registers["B"]
	if (x === undefined || y === undefined){
		throw "One or more registers do not exist";
	}
	if (x > y){
		this.registers["SW"] = '>';
	}
	else if (x < y){
		this.registers["SW"] = '<';
	}
	else{
		this.registers["SW"] = '=';
	}
}

let sic_cpu.prototype.opcodes["DIV"] = (mem_loc) => {
	this.registers["A"] = Math.floor(this.registers["A"] / this.__sic_deref24(mem_loc));
}

let sicxe_cpu["DIVR"] = (reg1, reg2) => {
	this.__sic_validate_reg(reg1);
	this.__sic_validate_reg(reg2);

	this.registers[reg2] = Math.floor(this.registers[reg2] / this.registers[reg1]);
}

let sic_cpu.prototype.opcodes["J"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	this.registers["PC"] = mem_loc;
}

let sic_cpu.prototype.opcodes["JEQ"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	if (this.registers["SW"] === '='){
		sic_J(mem_loc);
	}
}

let sic_cpu.prototype.opcodes["JGT"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	if (this.registers["SW"] === '>'){
		sic_J(mem_loc);
	}
}

let sic_cpu.prototype.opcodes["JLE"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	if (this.registers["SW"] === '<'){
		sic_J(mem_loc);
	}
}

let sic_cpu.prototype.opcodes["JSUB"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	this.registers["L"] = this.registers["PC"];
	this.registers["PC"] = mem_loc;
}

let sic_cpu.prototype.opcodes["LDA"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	this.registers["A"] = this.__sic_deref24(mem_loc);
}

let sicxe_cpu.prototype.opcodes["LDB"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	this.registers["B"] = this.__sic_deref24(mem_loc);
}

let sic_cpu.prototype.opcodes["LDCH"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	this.registers["A"] = this.registers["A"] & 0xFFFF00 + this.__sic_deref8(mem_loc);
}

let sic_cpu.prototype.opcodes["LDL"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	this.registers["L"] = this.__sic_deref24(mem_loc);
}

let sicxe_cpu.prototype.opcodes["LDS"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	this.registers["S"] = this.__sic_deref24(mem_loc);
}

let sicxe_cpu.prototype.opcodes["LDT"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	this.registers["T"] = this.__sic_deref24(mem_loc);
}

let sic_cpu.prototype.opcodes["LDX"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	this.registers["X"] = this.__sic_deref24(mem_loc);
}

let sic_cpu.prototype.opcodes["MUL"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	this.registers["A"] *= this.__sic_deref24(mem_loc);
	this.__sic_correct_flow("A");
}

let sicxe_cpu.prototype.opcodes["MULR"] = (reg1, reg2) => {
	this.__sic_validate_reg(reg1);
	this.__sic_validate_reg(reg2);

	this.registers[reg2] *= this.registers[reg1];
	this.__sic_correct_flow(reg2);
}

let sic_cpu.prototype.opcodes["OR"] = (mem_loc) => {
	this.__sic_validate_addr(mem_loc);

	this.registers["A"] |= this.__sic_deref24(mem_loc);
}

let sic_cpu.prototype.opcodes["RD"] = (dev_name) => {
	this.__sic_validate_rddev(dev_name);

	var dev = this.devices[dev_name];
	var ch  = dev.get();

	if (ch === undefined){
		throw "There is no data left in " + dev_name;
	}

	sic_LDCH(ch);
}

let sicxe_cpu.prototype.opcodes["RMO"] = (reg1, reg2) => {
	this.__sic_validate_reg(reg1);
	this.__sic_validate_reg(reg2);

	this.registers[reg2] = this.registers[reg1];
}

let sic_cpu.prototype.opcodes["RSUB"] = () => {
	this.registers["PC"] = this.registers["L"];
}

let sicxe_cpu.prototype.opcodes["SHIFTL"] = (reg, n) => {
	this.__sic_validate_reg(reg);
	if (typeof n !== "number"){
		throw "n must be a number";
	}

	// circular shift. not regular bitshift
	for (var i = 0; i < n; ++i){
		var tmp = reg & 0x800000 >>> 23;
		this.registers[reg] <<= 1;
		this.registers[reg] += tmp;
	}
}

let sicxe_cpu.prototype.opcodes["SHIFTR"] = (reg, n) => {
	this.__sic_validate_reg(reg);
	if (typeof n !== "number"){
		throw "n must be a number";
	}

	// >> does sign extension, >>> does zero extension
	this.registers[reg] >>= n;
}

let sic_cpu.prototype.opcodes["STA(mem_loc){
	this.__sic_place24(this.registers["A"], mem_loc);
}

function sicxe_STB(mem_loc){
	this.__sic_place24(this.registers["B"], mem_loc);
}

function sic_STCH(mem_loc){
	this.__sic_place8(this.registers["A"] & 0xFF, mem_loc);
}

function sic_STL(mem_loc){
	this.__sic_place24(this.registers["L"], mem_loc);
}

function sic_STSW(mem_loc){
	throw "stsw not implemented yet";
}

function sic_STX(mem_loc){
	this.__sic_place24(this.registers["X"]);
}

function sic_SUB(mem_loc){
	this.registers["A"] -= this.__sic_deref24(mem_loc);
	this.__sic_correct_flow("A");
}

function sic_TD(dev_no){
	throw "TD not implemented";
}

function sic_TIX(mem_loc){
	this.registers["X"]++;
	sic_COMP(mem_loc);
}

function sic_WD(dev_no){
	if (dev_no < 4 || dev_no > 6){
		throw "Bad device number"
	}
	devices[dev_no].push(this.registers["A"] & 0xFF);
}


function sic_cycle(){

}

function sic_init(c_dev00, c_devf1, c_devf2, c_devf3){
	sic_cpu_reset();
	sic_file_reset(c_dev00, c_devf1, c_devf2, c_devf3);
	// if dev00 is longer than 128 bytes
	if (dev00.length > 0x7F){
		throw "dev00 is too long";
	}

	if (dev00 == null){
		throw "dev00 does not exist";
	}

	for (var i = 0; i < dev00.length; ++i){
		memory[i] = dev00[i];
	}
}
