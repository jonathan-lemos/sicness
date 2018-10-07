var memory;    // the memory of the program
var registers; // the registers of the cpu
var devices;   // the devices attached to the program

const MAX_ADDR=0x2FFF;

function sic_rdfile(contents){
	this.contents = contents;
	this.ptr      = 0;
	this.eof      = false;
}

function sic_wrfile(){
	this.contents = [];
}

function sic_cpu_reset(){
	registers = {};
	registers["A"]  = 0xFFFFFF; // accumulator
	registers["X"]  = 0xFFFFFF; // index (address)
	registers["L"]  = 0xFFFFFF; // linkage (return)
	registers["B"]  = 0xFFFFFF; // base
	registers["S"]  = 0xFFFFFF; // general
	registers["T"]  = 0xFFFFFF; // general
	registers["F"]  = 0xFFFFFF; // floating point
	registers["PC"] = 0x000000; // program-counter (instruction)
	registers["SW"] = 0x000000; // status-word (flag)
	memory = {};
}

function sic_file_reset(c_dev00, c_devf1, c_devf2, c_devf3){
	devices = [];
	devices.push(new sic_rdfile(c_dev00));
	devices.push(new sic_rdfile(c_devf1));
	devices.push(new sic_rdfile(c_devf2));
	devices.push(new sic_rdfile(c_devf3));
	devices.push(new sic_wrfile());
	devices.push(new sic_wrfile());
	devices.push(new sic_wrfile());
}

function __sic_deref24(mem_loc){
	// 0x2FFD is the last place we can store a 3 byte address
	if (mem_loc < 0x0 || mem_loc > MAX_ADDR - 0x2){
		throw "mem_loc is outside the addressable range";
	}
	return memory[mem_loc] << 16 + memory[mem_loc + 1] << 8 + memory[mem_loc + 2];
}

function __sic_deref16(mem_loc){
	if (mem_loc < 0x0 || mem_loc > MAX_ADDR - 0x1){
		throw "mem_loc is outside the addressable range";
	}
	return memory[mem_loc] << 8 + memory[mem_loc + 1];
}

function __sic_deref8(mem_loc){
	if (mem_loc < 0x0 || mem_loc > MAX_ADDR){
		throw "mem_loc is outside the addressable range";
	}
	return memory[mem_loc];
}

function __sic_place24(val, mem_loc){
	if (val < 0x0 || val > 0xFFFFFF){
		throw "val is outside a 24-bit range";
	}
	if (mem_loc < 0x0 || mem_loc > MAX_ADDR - 0x2){
		throw "mem_loc is outside the addressable range";
	}

	memory[mem_loc]     = val & 0xFF0000 >> 16;
	memory[mem_loc + 1] = val &   0xFF00 >> 8;
	memory[mem_loc + 2] = val &     0xFF;
}

function __sic_place16(val, mem_loc){
	if (val < 0x0 || val > 0xFFFF){
		throw "val is outside a 16-bit range";
	}
	if (mem_loc < 0x0 || mem_loc > MAX_ADDR - 0x1){
		throw "mem_loc is outside the addressable range";
	}

	memory[mem_loc]     = val & 0xFF00 >> 8;
	memory[mem_loc + 1] = val &   0xFF;
}

function __sic_place8(val, mem_loc){
	if (val < 0x0 || val > 0xFF){
		throw "val is outside an 8-bit range";
	}
	if (mem_loc < 0x0 || mem_loc > MAX_ADDR){
		throw "mem_loc is outside the addressable range";
	}

	memory[mem_loc] = val;
}

function __sic_correct_flow(reg){
	var x = registers["reg"];
	while (x > 0xFFFFFF){
		x -= 0xFFFFFF;
	}
	while (x < 0xFFFFFF){
		x += 0xFFFFFF;
	}
	registers["reg"] = x;
}

function sic_ADD(mem_loc){
	registers["A"] += __sic_deref24(mem_loc);
	__sic_correct_flow("A");
}

function sicxe_ADDR(reg1, reg2){
	registers[reg2] += registers[reg1];
	__sic_correct_flow(reg2);
}

function sic_AND(mem_loc){
	registers["A"] &= __sic_deref24(mem_loc);
}

function sicxe_CLEAR(reg){
	registers[reg] = 0x0;
}

function sic_COMP(mem_loc){
	var x = registers["A"]
	var y = __sic_deref24(mem_loc);
	if (x > y){
		registers["SW"] = ">";
	}
	else if (x < y){
		registers["SW"] = "<";
	}
	else{
		registers["SW"] = "=";
	}
}

function sicxe_COMPR(reg1, reg2){
	var x = registers["A"]
	var y = registers["B"]
	if (x > y){
		registers["SW"] = ">";
	}
	else if (x < y){
		registers["SW"] = "<";
	}
	else{
		registers["SW"] = "=";
	}
}

function sic_DIV(mem_loc){
	registers["A"] = Math.floor(registers["A"] / __sic_deref24(mem_loc));
}

function sicxe_DIVR(reg1, reg2){
	registers[reg2] = Math.floor(registers[reg2] / registers[reg1]);
}

function sic_J(mem_loc){
	if (mem_loc < 0x0 || mem_loc > MAX_ADDR){
		throw "mem_loc is outside the addressable range";
	}
	registers["PC"] = mem_loc;
}

function sic_JEQ(mem_loc){
	if (registers["SW"] === "="){
		sic_J(mem_loc);
	}
}

function sic_JGT(mem_loc){
	if (registers["SW"] === ">"){
		sic_J(mem_loc);
	}
}

function sic_JLE(mem_loc){
	if (registers["SW"] === "<"){
		sic_J(mem_loc);
	}
}

function sic_JSUB(mem_loc){
	if (mem_loc < 0x0 || mem_loc > MAX_ADDR){
		throw "mem_loc is outside the addressable range";
	}

	registers["L"] = registers["PC"];
	registers["PC"] = mem_loc;
}

function sic_LDA(mem_loc){
	registers["A"] = __sic_deref24(mem_loc);
}

function sicxe_LDB(mem_loc){
	registers["B"] = __sic_deref24(mem_loc);
}

function sic_LDCH(mem_loc){
	registers["A"] = registers["A"] & 0xFFFF00 + __sic_deref8(mem_loc);
}

function sic_LDL(mem_loc){
	registers["L"] = __sic_deref24(mem_loc);
}

function sicxe_LDS(mem_loc){
	registers["S"] = __sic_deref24(mem_loc);
}

function sicxe_LDT(mem_loc){
	registers["T"] = __sic_deref24(mem_loc);
}

function sic_LDX(mem_loc){
	registers["X"] = __sic_deref24(mem_loc);
}

function sic_MUL(mem_loc){
	registers["A"] *= __sic_deref24(mem_loc);
	__sic_correct_flow("A");
}

function sicxe_MULR(reg1, reg2){
	registers[reg2] *= registers[reg1];
	__sic_correct_flow(reg2);
}

function sic_OR(mem_loc){
	registers["A"] |= __sic_deref24(mem_loc);
}

function sic_RD(dev_no){
	if (dev_no < 0 || dev_no > 3){
		throw "bad device number";
	}

	var dev;
	switch (dev_no){
	case 0:
		dev = dev00;
		break;
	case 1:
		dev = devf1;
		break;
	case 2:
		dev = devf2;
		break;
	case 3:
		dev = devf3;
		break;
	default:
		throw "the programmer that wrote this code is a dunce";
	}
	var ch = dev.contents[dev.ptr];
	dev.ptr++;

	sic_LDCH(ch);
}

function sicxe_RMO(reg1, reg2){
	registers[reg2] = registers[reg1];
}

function sic_RSUB(mem_loc){
	registers["PC"] = registers["L"];
}

function sicxe_SHIFTL(reg, n){
	// circular shift. not regular bitshift
	for (var i = 0; i < n; ++i){
		var tmp = reg & 0x800000 >>> 23;
		registers[reg] <<= 1;
		registers[reg] += tmp;
	}
}

function sicxe_SHIFTR(reg, n){
	// >> does sign extension, >>> does zero extension
	registers[reg] >>= n;
}

function sic_STA(mem_loc){
	__sic_place24(registers["A"], mem_loc);
}

function sicxe_STB(mem_loc){
	__sic_place24(registers["B"], mem_loc);
}

function sic_STCH(mem_loc){
	__sic_place8(registers["A"] & 0xFF, mem_loc);
}

function sic_STL(mem_loc){
	__sic_place24(registers["L"], mem_loc);
}

function sic_STSW(mem_loc){
	throw "stsw not implemented yet";
}

function sic_STX(mem_loc){
	__sic_place24(registers["X"]);
}

function sic_SUB(mem_loc){
	registers["A"] -= __sic_deref24(mem_loc);
	__sic_correct_flow("A");
}

function sic_TD(dev_no){
	throw "TD not implemented";
}

function sic_TIX(mem_loc){
	registers["X"]++;
	sic_COMP(mem_loc);
}

function sic_WD(dev_no){
	if (dev_no < 4 || dev_no > 6){
		throw "Bad device number"
	}
	devices[dev_no].push(registers["A"] & 0xFF);
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
