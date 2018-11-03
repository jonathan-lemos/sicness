import { expect } from "chai";
import * as cc from "../src/sicxe_cc";

describe("__sic_unsigned tests", () => {
	it("SicMakeMask tests", () => {
		expect(cc.sicMakeMask(7)).to.equal(0x7F);
		expect(cc.sicMakeMask(8)).to.equal(0xFF);
		expect(cc.sicMakeMask(12)).to.equal(0xFFF);
		expect(cc.sicMakeMask(16)).to.equal(0xFFFF);
	});

	it("sicCheckUnsigned test", () => {
		expect(() => cc.sicCheckUnsigned(255, 8)).not.to.throw();
		expect(() => cc.sicCheckUnsigned(256, 8)).to.throw();
		expect(() => cc.sicCheckUnsigned(0, 8)).not.to.throw();
		expect(() => cc.sicCheckUnsigned(65535, 16)).not.to.throw();
	});

	it("sicMakeUnsigned test", () => {
		expect(cc.sicMakeUnsigned(0xFF, 8)).to.equal(0xFF);
		expect(() => cc.sicMakeUnsigned(256, 8)).to.throw();
		expect(cc.sicMakeUnsigned(-0x80, 8)).to.equal(0x80);
		expect(() => cc.sicMakeUnsigned(-129, 8)).to.throw();
		expect(cc.sicMakeUnsigned(-0x80, 16)).to.equal(0xFF80);
	});
});

describe("SicBytecode tests", () => {
	it("ADD test", () => {
		const sb = new cc.SicBytecode("ADD");
		expect(sb.format).to.equal(3);
		expect(sb.opcode).to.equal(0x18);
		expect(sb.mnemonic).to.equal("ADD");
	});

	it("+ADD test", () => {
		const sb = new cc.SicBytecode("+ADD");
		expect(sb.format).to.equal(4);
		expect(sb.opcode).to.equal(0x18);
		expect(sb.mnemonic).to.equal("ADD");
	});

	it("RMO test", () => {
		const sb = new cc.SicBytecode("RMO");
		expect(sb.format).to.equal(2);
		expect(sb.opcode).to.equal(0xAC);
		expect(sb.mnemonic).to.equal("RMO");
	});

	it("FIX test", () => {
		const sb = new cc.SicBytecode("FIX");
		expect(sb.format).to.equal(1);
		expect(sb.opcode).to.equal(0xC4);
		expect(sb.mnemonic).to.equal("FIX");
	});

	it("THROW test (unknown mnemonic)", () => {
		expect(() => new cc.SicBytecode("NOX")).to.throw();
	});
});

describe("SicSplit tests", () => {
	it("Untagged test", () => {
		const ss = new cc.SicSplit("\tLDA\tVAL");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("LDA");
		expect(ss.args).to.equal("VAL");
	});

	it("Tagged test", () => {
		const ss = new cc.SicSplit("TAG\tLDA\tVAL");
		expect(ss.tag).to.equal("TAG");
		expect(ss.op).to.equal("LDA");
		expect(ss.args).to.equal("VAL");
	});

	it("Format 2 test 1", () => {
		const ss = new cc.SicSplit("\tRMO A,B");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("RMO");
		expect(ss.args).to.equal("A,B");
	});

	it("Format 2 test 2", () => {
		const ss = new cc.SicSplit("\tRMO\tA, B");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("RMO");
		expect(ss.args).to.equal("A,B");
	});

	it("Format 1 test", () => {
		const ss = new cc.SicSplit("\tFIX");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("FIX");
		expect(ss.args).to.equal("");
	});
});

describe("SicOperandF3 tests", () => {
	const f3direct = new cc.SicOperandF3("VAL", false);
	const f3indirect = new cc.SicOperandF3("@VAL", false);
	const f3immediate = new cc.SicOperandF3("#VAL", false);
	const f3literal = new cc.SicOperandF3("#X'10'", false);
	const f3tagged = new cc.SicOperandF3("TAG,X", false, "TAG");
	const f4 = new cc.SicOperandF3("VAL", true);

	it("f3 direct", () => {
		expect(f3direct.pcrel).to.equal(true);
		expect(f3direct.baserel).to.equal(false);
		expect(f3direct.indexed).to.equal(false);
		expect(f3direct.type).to.equal(cc.SicOpType.direct);
		expect(f3direct.val).to.equal("VAL");
		expect(f3direct.format4).to.equal(false);
	});

	it("f3 indirect", () => {
		expect(f3indirect.type).to.equal(cc.SicOpType.indirect);
	});

	it("f3 immediate", () => {
		expect(f3immediate.type).to.equal(cc.SicOpType.immediate);
	});

	it("f3 literal", () => {
		expect(f3literal.type).to.equal(cc.SicOpType.immediate);
		expect(f3literal.val).to.equal(16);
	});

	it("f3 tagged", () => {
		expect(f3tagged.baserel).to.equal(true);
		expect(f3tagged.indexed).to.equal(true);
	});

	it("f3 f4", () => {
		expect(f4.format4).to.equal(true);
	});

	it("f3 throw", () => {
		expect(() => new cc.SicOperandF3("VAL,VAL2", false)).to.throw();
	});
});

describe("SicFormat1 tests", () => {
	it("f1 test", () => {
		const splitGood = new cc.SicSplit("\tFIX");
		const f1 = new cc.SicFormat1(splitGood);
		expect(f1.bc.mnemonic).to.equal("FIX");
		expect(f1.length()).to.equal(1);
		expect(f1.ready()).to.equal(true);
		expect(f1.toBytes()).to.equal([0xC4]);
	});

	it("f1 throw", () => {
		const splitBad1 = new cc.SicSplit("\tLDA");
		const splitBad2 = new cc.SicSplit("\tFIX A");
		expect(() => new cc.SicFormat1(splitBad1)).to.throw();
		expect(() => new cc.SicFormat1(splitBad2)).to.throw();
	});
});

describe("SicFormat2 tests", () => {
	it("f2 test", () => {
		const splitGood = new cc.SicSplit("\tSHIFTL B, 4");
		const f2 = new cc.SicFormat2(splitGood);
		expect(f2.bc.mnemonic).to.equal("SHIFTL");
		expect(f2.length()).to.equal(2);
		expect(f2.ready()).to.equal(true);
		expect(f2.toBytes()).to.equal([0xA4, 0x34]);
	});

	it("f2 throw", () => {
		const splitBad1 = new cc.SicSplit("\tSHIFTL B");
		const splitBad2 = new cc.SicSplit("\tLDA B, 4");
		expect(() => new cc.SicFormat2(splitBad1)).to.throw();
		expect(() => new cc.SicFormat2(splitBad2)).to.throw();
	});
});

describe("SicFormat3 tests", () => {
	const tagCallback = (tag: string): number => {
		if (tag === "VAL") {
			return 0x20;
		}
		throw new Error("tagCallback should not have been called with value: " + tag);
	};

	it("f3 test indexed", () => {
		const splitGood1 = new cc.SicSplit("\tLDA BTAG,X");
		const f3 = new cc.SicFormat3(splitGood1, "BTAG");

		expect(f3.bc.opcode).to.equal(0x00);
		expect(f3.bc.mnemonic).to.equal("LDA");
		expect(f3.op.val).to.equal("BTAG");
		expect(f3.op.indexed).to.equal(true);
		expect(f3.op.baserel).to.equal(true);
		expect(f3.op.pcrel).to.equal(false);
		expect(f3.length()).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.convertTag(0x10, tagCallback);
		expect(f3.ready()).to.equal(true);
		expect(f3.toBytes()).to.equal([0x03, 0xC0, 0x00]);
	});

	it("f3 test indirect", () => {
		const splitGood2 = new cc.SicSplit("\tLDA @VAL");
		const f3 = new cc.SicFormat3(splitGood2);

		expect(f3.bc.opcode).to.equal(0x00);
		expect(f3.op.val).to.equal("VAL");
		expect(f3.op.type).to.equal(cc.SicOpType.indirect);
		expect(f3.op.pcrel).to.equal(true);
		expect(f3.ready()).to.equal(false);

		f3.convertTag(0x30, tagCallback);
		expect(f3.ready()).to.equal(true);
		expect(f3.op.val).to.equal(0xFF0);
		expect(f3.toBytes()).to.equal([0x02, 0x2F, 0xF0]);
	});

	it("f3 test literal", () => {
		const splitGood3 = new cc.SicSplit("\tLDA #X'10'");
		const f3 = new cc.SicFormat3(splitGood3);

		expect(f3.bc.opcode).to.equal(0x00);
		expect(f3.op.val).to.equal(0x10);
		expect(f3.op.type).to.equal(cc.SicOpType.immediate);
		expect(f3.ready()).to.equal(true);

		expect(f3.toBytes()).to.equal([0x01, 0x00, 0x10]);
	});

	it("f3 test throw", () => {
		const splitBad1 = new cc.SicSplit("\tLDA, VAL, X'10'");
		const splitBad2 = new cc.SicSplit("\t+LDA VAL");

		expect(() => new cc.SicFormat3(splitBad1)).to.throw();
		expect(() => new cc.SicFormat3(splitBad2)).to.throw();
	});
});

describe("SicFormat4 tests", () => {
	const tagCallback = (tag: string): number => {
		if (tag === "VAL") {
			return 0x20;
		}
		throw new Error("tagCallback should not have been called with value: " + tag);
	};

	it("f4 test indexed", () => {
		const splitGood1 = new cc.SicSplit("\t+LDA VAL,X");
		const f4 = new cc.SicFormat4(splitGood1);

		expect(f4.bc.opcode).to.equal(0x00);
		expect(f4.bc.mnemonic).to.equal("LDA");
		expect(f4.op.val).to.equal("VAL");
		expect(f4.op.pcrel).to.equal(false);
		expect(f4.op.baserel).to.equal(false);
		expect(f4.op.indexed).to.equal(true);
		expect(f4.length()).to.equal(4);
		expect(f4.ready()).to.equal(false);

		f4.convertTag(0x10, tagCallback);
		expect(f4.op.val).to.equal(0x20);
		expect(f4.ready()).to.equal(true);
		expect(f4.toBytes()).to.equal([0x03, 0x90, 0x00, 0x20]);
	});

	it("f4 test indirect", () => {
		const splitGood2 = new cc.SicSplit("\t+LDA @VAL");
		const f4 = new cc.SicFormat4(splitGood2);

		expect(f4.bc.opcode).to.equal(0x00);
		expect(f4.op.val).to.equal("VAL");
		expect(f4.op.type).to.equal(cc.SicOpType.indirect);
		expect(f4.ready()).to.equal(false);

		f4.convertTag(0x10, tagCallback);
		expect(f4.ready()).to.equal(true);
		expect(f4.op.val).to.equal(0x20);
		expect(f4.toBytes()).to.equal([0x02, 0x10, 0x00, 0x20]);
	});

	it("f4 test literal", () => {
		const splitGood3 = new cc.SicSplit("\t+LDA #10");
		const f4 = new cc.SicFormat4(splitGood3);

		expect(f4.bc.opcode).to.equal(0x00);
		expect(f4.op.val).to.equal(10);
		expect(f4.op.type).to.equal(cc.SicOpType.immediate);
		expect(f4.ready()).to.equal(true);

		expect(f4.toBytes()).to.equal([0x01, 0x10, 0x00, 0x0A]);
	});

	it("f4 test throw", () => {
		const splitBad1 = new cc.SicSplit("\t+LDA, VAL, 10");
		const splitBad2 = new cc.SicSplit("\tLDA VAL");

		expect(() => new cc.SicFormat4(splitBad1)).to.throw();
		expect(() => new cc.SicFormat4(splitBad2)).to.throw();
	});
});

describe("SicSpace tests", () => {
	it("RESW/RESB test", () => {
		const splitRESW = new cc.SicSplit("\tRESW 2");
		const splitRESB = new cc.SicSplit("\tRESB X'03'");
		const sw = new cc.SicSpace(splitRESW);
		const sb = new cc.SicSpace(splitRESB);

		expect(sw.length()).to.equal(6);
		expect(sw.toBytes()).to.equal([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
		expect(sb.length()).to.equal(0x3);
		expect(sb.toBytes()).to.equal([0xFF, 0xFF, 0xFF]);
	});

	it("WORD/BYTE test", () => {
		const splitWORD = new cc.SicSplit("\tWORD X'ABCD12'");
		const splitBYTE = new cc.SicSplit("\tBYTE 12");
		const w = new cc.SicSpace(splitWORD);
		const b = new cc.SicSpace(splitBYTE);

		expect(w.length()).to.equal(3);
		expect(w.toBytes()).to.equal([0xAB, 0xCD, 0x12]);
		expect(b.length()).to.equal(1);
		expect(b.toBytes()).to.equal([12]);
	});

	it("space fail tests", () => {
		const splitFail1 = new cc.SicSplit("\tLDA 4");
		const splitFail2 = new cc.SicSplit("\tWORD");
		const splitFail3 = new cc.SicSplit("\tRESW 1,2");

		expect(() => new cc.SicSpace(splitFail1)).to.throw();
		expect(() => new cc.SicSpace(splitFail2)).to.throw();
		expect(() => new cc.SicSpace(splitFail3)).to.throw();
	});
});

describe("pass1 tests", () => {
	const lines = [
		"TEST\tSTART\tA",
		"\tLDA #4",
		"ACTION\tRMO B, A",
		"\tFIX",
		"\t+LDS #X'ABCDE'",
		"NUMBER\tRESW 5",
		"\tSTA NUMBER",
		"\tEND TEST",
	];
	const p1 = new cc.SicCompiler(lines);

	it("loc test", () => {
		expect(p1.lines.length).to.equal(6);
		//        LDA #4
		expect(p1.lines[0].loc).to.equal(0xA);
		// ACTION RMO A, B
		expect(p1.lines[1].loc).to.equal(0xA + 3);
		//        FIX
		expect(p1.lines[2].loc).to.equal(0xA + 3 + 2);
		//        +LDS #X'ABCDE'
		expect(p1.lines[3].loc).to.equal(0xA + 3 + 2 + 1);
		// NUMBER RESW 5
		expect(p1.lines[4].loc).to.equal(0xA + 3 + 2 + 1 + 4);
		//        STA NUMBER
		expect(p1.lines[5].loc).to.equal(0xA + 3 + 2 + 1 + 4 + 15);
	});

	it("instr test", () => {
		expect((p1.lines[0].instr as cc.SicFormat3).bc.mnemonic).to.equal("LDA");
		expect((p1.lines[4].instr as cc.SicSpace).mnemonic).to.equal("RESW");
		expect((p1.lines[5].instr as cc.SicFormat3).op.pcrel).to.equal(true);
	});

	it("tags test", () => {
		expect(p1.tags.getTagLoc(p1.lines, "ACTION")).to.equal(0x0A + 3);
		expect(p1.tags.getTagLoc(p1.lines, "NUMBER")).to.equal(0x0A + 3 + 2 + 1 + 4);
		expect(() => p1.tags.getTagLoc(p1.lines, "NOEX")).to.throw();
	});

	it("toBytes() test", () => {
		const bytes = p1.toBytes();
		expect(bytes[0]).to.equal([0x01, 0x00, 0x04]);
		expect(bytes[1]).to.equal([0xAC, 0x30]);
		expect(bytes[2]).to.equal([0xC4]);
		expect(bytes[3]).to.equal([0x6D, 0x1A, 0xBC, 0xDE]);
		expect(bytes[4]).to.equal([0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
		expect(bytes[5]).to.equal([0x0F, 0x2F, 0xF1]);
	});

	it("toLst() test", () => {
		const lst = p1.toLst();
		expect(lst[0].loc).to.equal("");
		expect(lst[0].bytecode).to.equal("");
		expect(lst[0].instr).to.equal(lines[0].trim());

		expect(lst[1].loc).to.equal("A");
		expect(lst[1].bytecode).to.equal("010004");
		expect(lst[1].instr).to.equal(lines[1].trim());

		expect(lst[2].loc).to.equal("D");
		expect(lst[2].bytecode).to.equal("AC30");
		expect(lst[2].instr).to.equal(lines[2].trim());

		expect(lst[3].loc).to.equal("F");
		expect(lst[3].bytecode).to.equal("C4");
		expect(lst[3].instr).to.equal(lines[3].trim());

		expect(lst[4].loc).to.equal("10");
		expect(lst[4].bytecode).to.equal("6D1ABCDE");
		expect(lst[4].instr).to.equal(lines[4].trim());

		expect(lst[5].loc).to.equal("14");
		expect(lst[5].bytecode).to.equal("");
		expect(lst[5].instr).to.equal(lines[5].trim());

		expect(lst[6].loc).to.equal("23");
		expect(lst[6].bytecode).to.equal("0F2FF1");
		expect(lst[6].instr).to.equal(lines[6].trim());
	});
});
