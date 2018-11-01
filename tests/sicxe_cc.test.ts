import { expect } from "chai";
import * as cc from "../src/sicxe_cc";

describe("__sic_unsigned its", () => {
	it("__sic_make_mask tests", () => {
		expect(cc.__sic_make_mask(7)).to.equal(0x7F);
		expect(cc.__sic_make_mask(8)).to.equal(0xFF);
		expect(cc.__sic_make_mask(12)).to.equal(0xFFF);
		expect(cc.__sic_make_mask(16)).to.equal(0xFFFF);
	});

	it("__sic_check_unsigned test", () => {
		expect(() => cc.__sic_check_unsigned(255, 8)).not.to.throw();
		expect(() => cc.__sic_check_unsigned(256, 8)).to.throw();
		expect(() => cc.__sic_check_unsigned(0, 8)).not.to.throw();
		expect(() => cc.__sic_check_unsigned(65535, 16)).not.to.throw();
	});

	it("__sic_make_unsigned test", () => {
		expect(cc.__sic_make_unsigned(0xFF, 8)).to.equal(0xFF);
		expect(() => cc.__sic_make_unsigned(256, 8)).to.throw();
		expect(cc.__sic_make_unsigned(-0x80, 8)).to.equal(0x80);
		expect(() => cc.__sic_make_unsigned(-129, 8)).to.throw();
		expect(cc.__sic_make_unsigned(-0x80, 16)).to.equal(0xFF80);
	});
});

describe("sic_bytecode its", () => {
	it("ADD test", () => {
		const sb = new cc.sic_bytecode("ADD");
		expect(sb.format).to.equal(3);
		expect(sb.opcode).to.equal(0x18);
		expect(sb.mnemonic).to.equal("ADD");
	});

	it("+ADD test", () => {
		const sb = new cc.sic_bytecode("+ADD");
		expect(sb.format).to.equal(4);
		expect(sb.opcode).to.equal(0x18);
		expect(sb.mnemonic).to.equal("ADD");
	});

	it("RMO test", () => {
		const sb = new cc.sic_bytecode("RMO");
		expect(sb.format).to.equal(2);
		expect(sb.opcode).to.equal(0xAC);
		expect(sb.mnemonic).to.equal("RMO");
	});

	it("FIX test", () => {
		const sb = new cc.sic_bytecode("FIX");
		expect(sb.format).to.equal(1);
		expect(sb.opcode).to.equal(0xC4);
		expect(sb.mnemonic).to.equal("FIX");
	});

	it("THROW test (unknown mnemonic)", () => {
		expect(() => new cc.sic_bytecode("NOX")).to.throw();
	});
});

describe("sic_split its", () => {
	it("Untagged test", () => {
		const ss = new cc.sic_split("\tLDA\tVAL");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("LDA");
		expect(ss.args).to.equal("VAL");
	});

	it("Tagged test", () => {
		const ss = new cc.sic_split("TAG\tLDA\tVAL");
		expect(ss.tag).to.equal("TAG");
		expect(ss.op).to.equal("LDA");
		expect(ss.args).to.equal("VAL");
	});

	it("Format 2 test 1", () => {
		const ss = new cc.sic_split("\tRMO A,B");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("RMO");
		expect(ss.args).to.equal("A,B");
	});

	it("Format 2 test 2", () => {
		const ss = new cc.sic_split("\tRMO\tA, B");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("RMO");
		expect(ss.args).to.equal("A,B");
	});

	it("Format 1 test", () => {
		const ss = new cc.sic_split("\tFIX");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("FIX");
		expect(ss.args).to.equal("");
	});
});

describe("sic_operand_f3 its", () => {
	const f3direct = new cc.sic_operand_f3("VAL", false);
	const f3indirect = new cc.sic_operand_f3("@VAL", false);
	const f3immediate = new cc.sic_operand_f3("#VAL", false);
	const f3literal = new cc.sic_operand_f3("#X'10'", false);
	const f3tagged = new cc.sic_operand_f3("TAG,X", false, "TAG");
	const f4 = new cc.sic_operand_f3("VAL", true);

	it("f3 direct", () => {
		expect(f3direct.pcrel).to.equal(true);
		expect(f3direct.baserel).to.equal(false);
		expect(f3direct.indexed).to.equal(false);
		expect(f3direct.type).to.equal(cc.sic_op_type.direct);
		expect(f3direct.val).to.equal("VAL");
		expect(f3direct.format4).to.equal(false);
	});

	it("f3 indirect", () => {
		expect(f3indirect.type).to.equal(cc.sic_op_type.indirect);
	});

	it("f3 immediate", () => {
		expect(f3immediate.type).to.equal(cc.sic_op_type.immediate);
	});

	it("f3 literal", () => {
		expect(f3literal.type).to.equal(cc.sic_op_type.immediate);
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
		expect(() => new cc.sic_operand_f3("VAL,VAL2", false)).to.throw();
	});
});

describe("sic_format1 its", () => {
	it("f1 test", () => {
		const splitGood = new cc.sic_split("\tFIX");
		const f1 = new cc.sic_format1(splitGood);
		expect(f1.bc.mnemonic).to.equal("FIX");
		expect(f1.length()).to.equal(1);
		expect(f1.ready()).to.equal(true);
		expect(f1.toBytes()).to.equal([0xC4]);
	});

	it("f1 throw", () => {
		const splitBad1 = new cc.sic_split("\tLDA");
		const splitBad2 = new cc.sic_split("\tFIX A");
		expect(() => new cc.sic_format1(splitBad1)).to.throw();
		expect(() => new cc.sic_format1(splitBad2)).to.throw();
	});
});

describe("sic_format2 its", () => {
	it("f2 test", () => {
		const splitGood = new cc.sic_split("\tSHIFTL B, 4");
		const f2 = new cc.sic_format2(splitGood);
		expect(f2.bc.mnemonic).to.equal("SHIFTL");
		expect(f2.length()).to.equal(2);
		expect(f2.ready()).to.equal(true);
		expect(f2.toBytes()).to.equal([0xA4, 0x34]);
	});

	it("f2 throw", () => {
		const splitBad1 = new cc.sic_split("\tSHIFTL B");
		const splitBad2 = new cc.sic_split("\tLDA B, 4");
		expect(() => new cc.sic_format2(splitBad1)).to.throw();
		expect(() => new cc.sic_format2(splitBad2)).to.throw();
	});
});

describe("sic_format3 its", () => {
	const tagCallback = (tag: string): number => {
		if (tag === "VAL") {
			return 0x20;
		}
		throw new Error("tagCallback should not have been called with value: " + tag);
	};

	it("f3 test indexed", () => {
		const splitGood1 = new cc.sic_split("\tLDA BTAG,X");
		const f3 = new cc.sic_format3(splitGood1, "BTAG");

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
		const splitGood2 = new cc.sic_split("\tLDA @VAL");
		const f3 = new cc.sic_format3(splitGood2);

		expect(f3.bc.opcode).to.equal(0x00);
		expect(f3.op.val).to.equal("VAL");
		expect(f3.op.type).to.equal(cc.sic_op_type.indirect);
		expect(f3.op.pcrel).to.equal(true);
		expect(f3.ready()).to.equal(false);

		f3.convertTag(0x30, tagCallback);
		expect(f3.ready()).to.equal(true);
		expect(f3.op.val).to.equal(0xFF0);
		expect(f3.toBytes()).to.equal([0x02, 0x2F, 0xF0]);
	});

	it("f3 test literal", () => {
		const splitGood3 = new cc.sic_split("\tLDA #X'10'");
		const f3 = new cc.sic_format3(splitGood3);

		expect(f3.bc.opcode).to.equal(0x00);
		expect(f3.op.val).to.equal(0x10);
		expect(f3.op.type).to.equal(cc.sic_op_type.immediate);
		expect(f3.ready()).to.equal(true);

		expect(f3.toBytes()).to.equal([0x01, 0x00, 0x10]);
	});

	it("f3 test throw", () => {
		const splitBad1 = new cc.sic_split("\tLDA, VAL, X'10'");
		const splitBad2 = new cc.sic_split("\t+LDA VAL");

		expect(() => new cc.sic_format3(splitBad1)).to.throw();
		expect(() => new cc.sic_format3(splitBad2)).to.throw();
	});
});

describe("sic_format4 its", () => {
	const tagCallback = (tag: string): number => {
		if (tag === "VAL") {
			return 0x20;
		}
		throw new Error("tagCallback should not have been called with value: " + tag);
	};

	it("f4 test indexed", () => {
		const splitGood1 = new cc.sic_split("\t+LDA VAL,X");
		const f4 = new cc.sic_format4(splitGood1);

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
		const splitGood2 = new cc.sic_split("\t+LDA @VAL");
		const f4 = new cc.sic_format4(splitGood2);

		expect(f4.bc.opcode).to.equal(0x00);
		expect(f4.op.val).to.equal("VAL");
		expect(f4.op.type).to.equal(cc.sic_op_type.indirect);
		expect(f4.ready()).to.equal(false);

		f4.convertTag(0x10, tagCallback);
		expect(f4.ready()).to.equal(true);
		expect(f4.op.val).to.equal(0x20);
		expect(f4.toBytes()).to.equal([0x02, 0x10, 0x00, 0x20]);
	});

	it("f4 test literal", () => {
		const splitGood3 = new cc.sic_split("\t+LDA #10");
		const f4 = new cc.sic_format4(splitGood3);

		expect(f4.bc.opcode).to.equal(0x00);
		expect(f4.op.val).to.equal(10);
		expect(f4.op.type).to.equal(cc.sic_op_type.immediate);
		expect(f4.ready()).to.equal(true);

		expect(f4.toBytes()).to.equal([0x01, 0x10, 0x00, 0x0A]);
	});

	it("f4 test throw", () => {
		const splitBad1 = new cc.sic_split("\t+LDA, VAL, 10");
		const splitBad2 = new cc.sic_split("\tLDA VAL");

		expect(() => new cc.sic_format4(splitBad1)).to.throw();
		expect(() => new cc.sic_format4(splitBad2)).to.throw();
	});
});

describe("sic_space its", () => {
	it("RESW/RESB test", () => {
		const splitRESW = new cc.sic_split("\tRESW 2");
		const splitRESB = new cc.sic_split("\tRESB X'03'");
		const sw = new cc.sic_space(splitRESW);
		const sb = new cc.sic_space(splitRESB);

		expect(sw.length()).to.equal(6);
		expect(sw.toBytes()).to.equal([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
		expect(sb.length()).to.equal(0x3);
		expect(sb.toBytes()).to.equal([0xFF, 0xFF, 0xFF]);
	});

	it("WORD/BYTE test", () => {
		const splitWORD = new cc.sic_split("\tWORD X'ABCD12'");
		const splitBYTE = new cc.sic_split("\tBYTE 12");
		const w = new cc.sic_space(splitWORD);
		const b = new cc.sic_space(splitBYTE);

		expect(w.length()).to.equal(3);
		expect(w.toBytes()).to.equal([0xAB, 0xCD, 0x12]);
		expect(b.length()).to.equal(1);
		expect(b.toBytes()).to.equal([12]);
	});

	it("space fail tests", () => {
		const splitFail1 = new cc.sic_split("\tLDA 4");
		const splitFail2 = new cc.sic_split("\tWORD");
		const splitFail3 = new cc.sic_split("\tRESW 1,2");

		expect(() => new cc.sic_space(splitFail1)).to.throw();
		expect(() => new cc.sic_space(splitFail2)).to.throw();
		expect(() => new cc.sic_space(splitFail3)).to.throw();
	});
});

describe("pass1 its", () => {
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
	const p1 = new cc.sic_pass1(lines);

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
		expect((p1.lines[0].instr as cc.sic_format3).bc.mnemonic).to.equal("LDA");
		expect((p1.lines[4].instr as cc.sic_space).mnemonic).to.equal("RESW");
		expect((p1.lines[5].instr as cc.sic_format3).op.pcrel).to.equal(true);
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
