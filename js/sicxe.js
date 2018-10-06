var memory;    // the memory of the program
var registers; // the registers of the cpu

var dev00; // this file is where the program starts from
var devf1;
var devf2;
var devf3;
var dev04;
var dev05;
var dev06;

var functions;

function sic_file(contents){
	this.contents = contents;
	this.ptr      = 0;
	this.eof      = false;
}

function sic_reset(){
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

function __sic_deref24(mem_loc){
	// 0x2FFD is the last place we can store a 3 byte address
	if (mem_loc < 0x0 || mem_loc > 0x2FFD){
		throw "mem_loc is outside the addressable range";
	}
	return memory[mem_loc] << 16 + memory[mem_loc + 1] << 8 + memory[mem_loc + 2];
}

function __sic_deref16(mem_loc){
	if (mem_loc < 0x0 || mem_loc > 0x2FFE){
		throw "mem_loc is outside the addressable range";
	}
	return memory[mem_loc] << 8 + memory[mem_loc + 1];
}

function __sic_deref8(mem_loc){
	if (mem_loc < 0x0 || mem_loc > 0x2FFF){
		throw "mem_loc is outside the addressable range";
	}
	return memory[mem_loc];
}

function __sic_place24(val, mem_loc){
	if (val < 0x0 || val > 0xFFFFFF){
		throw "val is outside a 24-bit range";
	}
	if (mem_loc < 0x0 || mem_loc > 0x2FFD){
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
	if (mem_loc < 0x0 || mem_loc > 0x2FFE){
		throw "mem_loc is outside the addressable range";
	}

	memory[mem_loc]     = val & 0xFF00 >> 8;
	memory[mem_loc + 1] = val &   0xFF;
}

function __sic_place8(val, mem_loc){
	if (val < 0x0 || val > 0xFF){
		throw "val is outside an 8-bit range";
	}
	if (mem_loc < 0x0 || mem_loc > 0x2FFF){
		throw "mem_loc is outside the addressable range";
	}

	memory[mem_loc] = val;
}

function sic_ADD(mem_loc){
	registers["A"] += __sic_deref24(mem_loc);
	registers["A"] %= 0xFFFFFF;
}

function sic_AND(mem_loc){
	registers["A"] &= __sic_deref24(mem_loc);
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

function sic_DIV(mem_loc){
	registers["A"] = Math.floor(registers["A"], __sic_deref24(mem_loc));
}

function sic_J(mem_loc){
	if (mem_loc < 0x0 || mem_loc > 0x2FFF){
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
	if (mem_loc < 0x0 || mem_loc > 0x2FFF){
		throw "mem_loc is outside the addressable range";
	}

	registers["L"] = registers["PC"];
	registers["PC"] = mem_loc;
}

function sic_LDA(mem_loc){
	registers["A"] = __sic_deref24(mem_loc);
}

function sic_LDCH(mem_loc){
	registers["A"] = registers["A"] & 0xFFFF00 + __sic_deref8(mem_loc);
}

function sic_LDL(mem_loc){
	registers["L"] = __sic_deref24(mem_loc);
}

function sic_LDX(mem_loc){
	registers["X"] = __sic_deref24(mem_loc);
}

function sic_MUL(mem_loc){
	registers["A"] *= __sic_deref24(mem_loc);
	registers["A"] %= 0xFFFFFF;
}

function sic_OR(mem_loc){
	registers["A"] |= __sic_deref24(mem_loc);
}

function sic_RD(dev_no){
	if (dev_no < 0 || dev_no > 6){
		throw "device no " + dev_no + " does not exist";
	}
	else if (dev_no > 3){
		throw "device no " + dev_no + " is opened for writing";
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

function sic_RSUB(mem_loc){
	registers["PC"] = registers["L"];
}

function sic_STA(mem_loc){
	__sic_place24(registers["A"]);
}

function sic_STCH(mem_loc){
	__sic_place8(registers["A"] & 0xFF);
}

function sic_exec(){

}

function sic_init(f_dev00, f_devf1, f_devf2, f_devf3, f_dev04, f_dev05, f_dev06){
	dev00 = new sic_file(f_dev00);
	devf1 = new sic_file(f_dev01);
	devf2 = new sic_file(f_dev02);
	devf3 = new sic_file(f_dev03);
	dev04 = new sic_file(f_dev04);
	dev05 = new sic_file(f_dev05);
	dev06 = new sic_file(f_dev06);

	sic_reset();
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
