import { expect } from "chai";
import * as cc from "../src/sicxe_cc";

describe("Number to string tests", () => {
	it("converts to hex correctly", () => {
		expect(cc.asHex(0x63)).to.equal("63");
		expect(cc.asHex(255)).to.equal("FF");
		expect(cc.asHex(1234)).to.equal("4D2");
	});

	it("converts a number to a byte correctly", () => {
		expect(cc.asByte(0x63)).to.equal("63");
		expect(cc.asByte(255)).to.equal("FF");
		expect(cc.asByte(15)).to.equal("0F");
	});

	it("converts a number to a word correctly", () => {
		expect(cc.asWord(0x63)).to.equal("000063");
		expect(cc.asWord(16777215)).to.equal("FFFFFF");
		expect(cc.asWord(1234)).to.equal("0004D2");
	});

	it("reduces a byte array to a string correctly", () => {
		expect(cc.bytesToString([0x12, 0x34, 0x56, 0x78, 0x9A])).to.equal("123456789A");
		expect(cc.bytesToString([0x0A, 0x0B, 255, 1])).to.equal("0A0BFF01");
	});
});

describe("SicUnsigned tests", () => {
	it("creates bitmasks correctly", () => {
		expect(cc.sicMakeMask(7)).to.equal(0x7F);
		expect(cc.sicMakeMask(8)).to.equal(0xFF);
		expect(cc.sicMakeMask(12)).to.equal(0xFFF);
		expect(cc.sicMakeMask(16)).to.equal(0xFFFF);
	});

	it("validates unsigned values correctly", () => {
		expect(() => cc.sicCheckUnsigned(255, 8)).not.to.throw();
		expect(() => cc.sicCheckUnsigned(256, 8)).to.throw();
		expect(() => cc.sicCheckUnsigned(0, 8)).not.to.throw();
		expect(() => cc.sicCheckUnsigned(65535, 16)).not.to.throw();
	});

	it("converts signed values to unsigned correctly", () => {
		expect(cc.sicMakeUnsigned(0x7F, 8)).to.equal(0x7F);
		expect(() => cc.sicMakeUnsigned(0x80, 8)).to.throw();
		expect(cc.sicMakeUnsigned(-0x80, 8)).to.equal(0x80);
		expect(() => cc.sicMakeUnsigned(-0x81, 8)).to.throw();
		expect(cc.sicMakeUnsigned(-0x80, 16)).to.equal(0xFF80);
	});
});

describe("SicSplit tests", () => {
	it("handles basic statements correctly", () => {
		const ss = new cc.SicSplit("\tLDA\tVAL");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("LDA");
		expect(ss.args).to.equal("VAL");
	});

	it("handles labels correctly", () => {
		const ss = new cc.SicSplit("TAG\tLDA\tVAL");
		expect(ss.tag).to.equal("TAG");
		expect(ss.op).to.equal("LDA");
		expect(ss.args).to.equal("VAL");
	});

	it("handles 2 arguments without spaces correctly", () => {
		const ss = new cc.SicSplit("\tRMO A,B");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("RMO");
		expect(ss.args).to.equal("A,B");
	});

	it("handles 2 arguments with spaces correctly", () => {
		const ss = new cc.SicSplit("\tRMO\tA, B");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("RMO");
		expect(ss.args).to.equal("A,B");
	});

	it("handles 0 arguments correctly", () => {
		const ss = new cc.SicSplit("\tFIX");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("FIX");
		expect(ss.args).to.equal("");
	});

	it("handles lowercase arguments correctly", () => {
		const ss = new cc.SicSplit("tag\tlda\ta");
		expect(ss.tag).to.equal("TAG");
		expect(ss.op).to.equal("LDA");
		expect(ss.args).to.equal("A");
	});
});

describe("SicPending tests", () => {
	const tagTab: {[key: string]: number} = {
		VAL: 0x123,
	};

	const litTab = new cc.SicLitTab();
	litTab.add(0x123);
	litTab.createOrg(0x456);

	it("handles tags correctly", () => {
		const sp = new cc.SicPending("VAL");
		expect(sp.isTag()).to.equal(true);
		expect(sp.isLiteral()).to.equal(false);
		expect(sp.convert(tagTab, litTab)).to.equal(0x123);
	});

	it("handles literals correctly", () => {
		const sp = new cc.SicPending(0x123);
		expect(sp.isTag()).to.equal(false);
		expect(sp.isLiteral()).to.equal(true);
		expect(sp.convert(tagTab, litTab)).to.equal(0x456);
	});
});

describe("SicBase tests", () => {
	it("handles straight numbers correctly", () => {
		const b = new cc.SicBase(0x10);
		expect(b.ready()).to.equal(true);
		expect(b.val).to.equal(0x10);
	});

	it("handles sicpending correctly", () => {
		const p = new cc.SicPending("VAL");
		const tagTab: {[key: string]: number} = {
			VAL: 0x123,
		};
		const litTab: {[key: number]: number} = {
			0x100: 0x200,
		};
		const b = new cc.SicBase(p);
		expect(b.ready()).to.equal(false);
		b.makeReady(tagTab);
		expect(b.ready()).to.equal(true);
		expect(b.val as number).to.equal(0x123);
	});

	it("handles literals correctly", () => {
		const p = new cc.SicPending(0x10);
		const b = new cc.SicBase(p);
		expect(b.ready()).to.equal(true);
		expect(b.val as number).to.equal(0x10);
	});
});

describe("SicOperandAddr tests", () => {
	const litTest = new cc.SicLitTab();

	it("handles format 3 arguments correctly", () => {
		const form3 = new cc.SicOperandAddr("VAL", cc.SicOpType.f3, litTest);
		expect(form3.addr).to.equal(cc.SicOpAddrType.direct);
		expect(form3.pcrel).to.equal(true);
		expect(form3.base).to.equal(undefined);
		expect(form3.indexed).to.equal(false);
		expect(form3.type).to.equal(cc.SicOpType.f3);
		expect((form3.val as cc.SicPending).val).to.equal("VAL");
	});

	it("handles sic legacy arguments correctly", () => {
		const legacy = new cc.SicOperandAddr("AAA", cc.SicOpType.legacy, litTest);
		expect(legacy.addr).to.equal(cc.SicOpAddrType.direct);
		expect(legacy.pcrel).to.equal(false);
		expect(legacy.base).to.equal(undefined);
		expect(legacy.indexed).to.equal(false);
		expect(legacy.type).to.equal(cc.SicOpType.legacy);
		expect((legacy.val as cc.SicPending).val).to.equal("AAA");
	});

	it("handles format 4 arguments correctly", () => {
		const form4 = new cc.SicOperandAddr("BBB", cc.SicOpType.f4, litTest);
		expect(form4.addr).to.equal(cc.SicOpAddrType.direct);
		expect(form4.pcrel).to.equal(false);
		expect(form4.base).to.equal(undefined);
		expect(form4.indexed).to.equal(false);
		expect(form4.type).to.equal(cc.SicOpType.f4);
		expect((form4.val as cc.SicPending).val).to.equal("BBB");
	});

	it("handles indirect arguments correctly", () => {
		const indirect = new cc.SicOperandAddr("@VAL", cc.SicOpType.f3, litTest);
		expect(indirect.addr).to.equal(cc.SicOpAddrType.indirect);
		expect(indirect.pcrel).to.equal(true);
		expect(indirect.base).to.equal(undefined);
		expect(indirect.indexed).to.equal(false);
		expect(indirect.type).to.equal(cc.SicOpType.f3);
		expect((indirect.val as cc.SicPending).val).to.equal("VAL");
	});

	it("handles immediate arguments correctly", () => {
		const immediate = new cc.SicOperandAddr("#VAL", cc.SicOpType.f3, litTest);
		expect(immediate.addr).to.equal(cc.SicOpAddrType.immediate);
		expect(immediate.pcrel).to.equal(true);
		expect(immediate.base).to.equal(undefined);
		expect(immediate.indexed).to.equal(false);
		expect(immediate.type).to.equal(cc.SicOpType.f3);
		expect((immediate.val as cc.SicPending).val).to.equal("VAL");
	});

	it("handles numeric arguments correctly", () => {
		const immNumber = new cc.SicOperandAddr("#X'100'", cc.SicOpType.f3, litTest);
		expect(immNumber.addr).to.equal(cc.SicOpAddrType.immediate);
		expect(immNumber.pcrel).to.equal(false);
		expect(immNumber.base).to.equal(undefined);
		expect(immNumber.indexed).to.equal(false);
		expect(immNumber.type).to.equal(cc.SicOpType.f3);
		expect(immNumber.val).to.equal(0x100);
	});

	it("handles literal arguments correctly", () => {
		const literal = new cc.SicOperandAddr("=15", cc.SicOpType.f3, litTest);
		expect(literal.addr).to.equal(cc.SicOpAddrType.direct);
		expect(literal.pcrel).to.equal(true);
		expect(literal.base).to.equal(undefined);
		expect(literal.indexed).to.equal(false);
		expect(literal.type).to.equal(cc.SicOpType.f3);
		expect((literal.val as cc.SicPending).val).to.equal(15);

		expect(litTest.hasPending(15)).to.equal(true);
	});

	it("handles baserel format 3 arguments correctly", () => {
		const baserel = new cc.SicOperandAddr("VAL", cc.SicOpType.f3, litTest, new cc.SicBase(8));
		expect(baserel.addr).to.equal(cc.SicOpAddrType.direct);
		// both pcrel and baserel are supposed to be true
		// makeReady() tries pcrel and then baserel
		expect(baserel.pcrel).to.equal(true);
		expect((baserel.base as cc.SicBase).val).to.equal(8);
		expect(baserel.indexed).to.equal(false);
		expect(baserel.type).to.equal(cc.SicOpType.f3);
		expect((baserel.val as cc.SicPending).val).to.equal("VAL");
	});

	it("drops baserel/pcrel on format4 arguments correctly", () => {
		const baserel = new cc.SicOperandAddr("VAL", cc.SicOpType.f4, litTest, new cc.SicBase(8));
		expect(baserel.addr).to.equal(cc.SicOpAddrType.direct);
		expect(baserel.pcrel).to.equal(false);
		expect(baserel.base).to.equal(undefined);
		expect(baserel.indexed).to.equal(false);
		expect(baserel.type).to.equal(cc.SicOpType.f4);
		expect((baserel.val as cc.SicPending).val).to.equal("VAL");
	});

	it("handles indexed arguments correctly", () => {
		const indexed = new cc.SicOperandAddr("TAG,X", cc.SicOpType.f3, litTest);
		expect(indexed.addr).to.equal(cc.SicOpAddrType.direct);
		expect(indexed.pcrel).to.equal(true);
		expect(indexed.base).to.equal(undefined);
		expect(indexed.indexed).to.equal(true);
		expect(indexed.type).to.equal(cc.SicOpType.f3);
		expect((indexed.val as cc.SicPending).val).to.equal("TAG");
	});

	it("throws on invalid arguments", () => {
		expect(() => new cc.SicOperandAddr("VAL,VAL2", cc.SicOpType.f3, litTest)).to.throw();
		expect(() => new cc.SicOperandAddr("@VAL", cc.SicOpType.legacy, litTest)).to.throw();
		expect(() => new cc.SicOperandAddr("$$AQQ", cc.SicOpType.f3, litTest)).to.throw();
	});
});

describe("SicFormat1 tests", () => {
	it("handles basic format1 arguments correctly", () => {
		const splitGood = new cc.SicSplit("\tFIX");
		const f1 = new cc.SicFormat1(splitGood);
		expect(f1.bc.mnemonic).to.equal("FIX");
		expect(f1.length()).to.equal(1);
		expect(f1.ready()).to.equal(true);
		expect(f1.toBytes()).to.eql([0xC4]);
	});

	it("throws on invalid format 1 arguments", () => {
		const splitBad1 = new cc.SicSplit("\tLDA");
		const splitBad2 = new cc.SicSplit("\tFIX A");
		expect(() => new cc.SicFormat1(splitBad1)).to.throw();
		expect(() => new cc.SicFormat1(splitBad2)).to.throw();
	});
});

describe("SicFormat2 tests", () => {
	it("handles basic format2 arguments correctly", () => {
		const splitGood = new cc.SicSplit("\tSHIFTL B, 4");
		const f2 = new cc.SicFormat2(splitGood);
		expect(f2.bc.mnemonic).to.equal("SHIFTL");
		expect(f2.length()).to.equal(2);
		expect(f2.ready()).to.equal(true);
		expect(f2.toBytes()).to.eql([0xA4, 0x34]);
	});

	it("throws on invalid format2 arguments", () => {
		const splitBad1 = new cc.SicSplit("\tSHIFTL");
		const splitBad2 = new cc.SicSplit("\tLDA B, 4");
		expect(() => new cc.SicFormat2(splitBad1)).to.throw();
		expect(() => new cc.SicFormat2(splitBad2)).to.throw();
	});
});

describe("SicFormat3 tests", () => {
	const tagTab: {[key: string]: number} = {
		VAL: 0x123,
	};
	const litTab = new cc.SicLitTab();

	it("handles pcrel forward correctly", () => {
		const split = new cc.SicSplit("AAA\tLDX VAL .comment");
		const f3 = new cc.SicFormat3(split, litTab);

		expect(f3.length()).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x50, tagTab, litTab);
		expect(f3.ready()).to.equal(true);
		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x123) - (loc(0x50) + len(0x03)) = 0x0D0
		// 0x20 - xbPe(0x20) + disp top 4(0x00)
		// 0xD0 - disp bot 8(0xD0)
		expect(f3.toBytes()).to.eql([0x07, 0x20, 0xD0]);
	});

	it("handles pcrel backward correctly", () => {
		const split = new cc.SicSplit("BBB\tLDX VAL");
		const f3 = new cc.SicFormat3(split, litTab);

		expect(f3.length()).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x200, tagTab, litTab);
		expect(f3.ready()).to.equal(true);
		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x123) - (loc(0x200) + len(0x03)) = 0xF23
		// 0x2F - xbPe(0x20) + disp top 4(0x0F)
		// 0x20 - disp bot 8(0x20)
		expect(f3.toBytes()).to.eql([0x07, 0x2F, 0x20]);
	});

	it("handles indirect arguments correctly", () => {
		const split = new cc.SicSplit("\tLDX @VAL");
		const f3 = new cc.SicFormat3(split, litTab);

		expect(f3.length()).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x200, tagTab, litTab);
		expect(f3.ready()).to.equal(true);
		// 0x06 - LDX(0x04) + Ni(0x02)
		//     disp = address(0x123) - (loc(0x200) + len(0x03)) = 0xF20
		// 0x2F - xbPe(0x20) + disp top 4(0x0F)
		// 0x20 - disp bot 8(0x20)
		expect(f3.toBytes()).to.eql([0x06, 0x2F, 0x20]);
	});

	it("handles immediate arguments correctly", () => {
		const split = new cc.SicSplit("\tLDX #VAL");
		const f3 = new cc.SicFormat3(split, litTab);

		expect(f3.length()).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x200, tagTab, litTab);
		expect(f3.ready()).to.equal(true);
		// 0x06 - LDX(0x04) + nI(0x01)
		//     disp = address(0x123) - (loc(0x200) + len(0x03)) = 0xF20
		// 0x2F - xbPe(0x20) + disp top 4(0x0F)
		// 0x20 - disp bot 8(0x20)
		expect(f3.toBytes()).to.eql([0x05, 0x2F, 0x20]);
	});

	it("handles literal arguments correctly", () => {
		const split = new cc.SicSplit("\tLDX =X'1CD'");
		const split2 = new cc.SicSplit("\tLDX =X'1CE'");
		const split3 = new cc.SicSplit("\tLDX =461"); // 0x1CD
		const litTabEb = new cc.SicLitTab();

		const ft1 = new cc.SicFormat3(split, litTabEb);
		expect(litTabEb.hasPending(0x1CD)).to.equal(true);
		const ft2 = new cc.SicFormat3(split2, litTabEb);
		expect(litTabEb.hasPending(0x1CE)).to.equal(true);
		const ft3 = new cc.SicFormat3(split3, litTabEb);
		expect(litTabEb.hasPending(0x1CD)).to.equal(true);

		litTabEb.createOrg(0x2AB);

		expect(ft1.length()).to.equal(3);
		expect(ft1.ready()).to.equal(false);
		expect(ft2.length()).to.equal(3);
		expect(ft2.ready()).to.equal(false);
		expect(ft3.length()).to.equal(3);
		expect(ft3.ready()).to.equal(false);

		ft1.makeReady(0x100, tagTab, litTabEb);
		expect(ft1.ready()).to.equal(true);
		ft2.makeReady(0x103, tagTab, litTabEb);
		expect(ft2.ready()).to.equal(true);
		ft3.makeReady(0x106, tagTab, litTabEb);
		expect(ft3.ready()).to.equal(true);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = location(0x2AB) - (loc(0x100) + length(0x03)) = 0x1A8
		// 0x21 - xbPe(0x20) + disp top 4(0x01)
		// 0xA8 - disp bot 8(0xA8)
		expect(ft1.toBytes()).to.eql([0x07, 0x21, 0xA8]);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = location(0x2AE) - (loc(0x103) + length(0x03)) = 0x1A8
		// 0x21 - xbPe(0x20) + disp top 4(0x01)
		// 0xA8 - disp bot 8(0xA8)
		expect(ft2.toBytes()).to.eql([0x07, 0x21, 0xA8]);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = location(0x2AB) - (loc(0x106) + length(0x03)) = 0x1A2
		// 0x21 - xbPe(0x20) + disp top 4(0x01)
		// 0xA2 - disp bot 8(0xA2)
		expect(ft3.toBytes()).to.eql([0x07, 0x21, 0xA2]);
	});

	it("handles baserel arguments correctly", () => {
		const splitFar = new cc.SicSplit("\tLDX X'9FF'");
		const splitNear = new cc.SicSplit("\tLDX X'200'");
		const base = new cc.SicBase(0x300);
		const f3Far = new cc.SicFormat3(splitFar, litTab, base);
		const f3Near = new cc.SicFormat3(splitNear, litTab, base);

		expect(f3Far.length()).to.equal(3);
		expect(f3Far.ready()).to.equal(false);
		f3Far.makeReady(0x100, tagTab, litTab);
		expect(f3Far.ready()).to.equal(true);

		expect(f3Near.length()).to.equal(3);
		expect(f3Near.ready()).to.equal(false);
		f3Near.makeReady(0x100, tagTab, litTab);
		expect(f3Near.ready()).to.equal(true);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x9FF) - base(0x300) = 0x6FF
		// 0x49 - xBpe(0x40) + disp top 4(0x06)
		// 0xEF - disp bot 8(0xFF)
		expect(f3Far.toBytes()).to.eql([0x07, 0x46, 0xFF]);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x200) - base(0x300) = 0xF00
		// 0x49 - xbPe(0x40) + disp top 4(0x0F)
		// 0xEF - disp bot 8(0x00)
		expect(f3Near.toBytes()).to.eql([0x07, 0x4F, 0x00]);
	});

	it("handles indexed arguments correctly", () => {
		const split = new cc.SicSplit("\tLDX VAL,X");
		const f3 = new cc.SicFormat3(split, litTab);

		expect(f3.length()).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x50, tagTab, litTab);
		expect(f3.ready()).to.equal(true);
		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x123) - (loc(0x50) + len(0x03)) = 0x0D0
		// 0xA0 - XbPe(0xA0) + disp top 4(0x00)
		// 0xD0 - disp bot 8(0xD0)
		expect(f3.toBytes()).to.eql([0x07, 0xA0, 0xD0]);
	});

	it("throws on invalid arguments", () => {
		const splitBad1 = new cc.SicSplit("\t+LDA VAL");
		const splitBad2 = new cc.SicSplit("\t*LDA VAL");
		const splitBad3 = new cc.SicSplit("\tLDA A,B");
		const splitBad4 = new cc.SicSplit("\tRMO A");

		expect(() => new cc.SicFormat3(splitBad1, litTab)).to.throw();
		expect(() => new cc.SicFormat3(splitBad2, litTab)).to.throw();
		expect(() => new cc.SicFormat3(splitBad3, litTab)).to.throw();
		expect(() => new cc.SicFormat3(splitBad4, litTab)).to.throw();
	});
});

describe("SicFormatLegacy tests", () => {
	const tagTab: {[key: string]: number} = {
		VAL: 0x123,
	};
	const litTab = new cc.SicLitTab();

	it("handles literal arguments correctly", () => {
		const split = new cc.SicSplit("\t*LDX =X'1CD'");
		const split2 = new cc.SicSplit("\t*LDX =X'1CE'");
		const split3 = new cc.SicSplit("\t*LDX =461"); // 0x1CD
		const litTabEb = new cc.SicLitTab();

		const ft1 = new cc.SicFormatLegacy(split, litTabEb);
		expect(litTabEb.hasPending(0x1CD)).to.equal(true);
		const ft2 = new cc.SicFormatLegacy(split2, litTabEb);
		expect(litTabEb.hasPending(0x1CE)).to.equal(true);
		const ft3 = new cc.SicFormatLegacy(split3, litTabEb);
		expect(litTabEb.hasPending(0x1CD)).to.equal(true);

		litTabEb.createOrg(0x2AB);

		expect(ft1.length()).to.equal(3);
		expect(ft1.ready()).to.equal(false);
		expect(ft2.length()).to.equal(3);
		expect(ft2.ready()).to.equal(false);
		expect(ft3.length()).to.equal(3);
		expect(ft3.ready()).to.equal(false);

		ft1.makeReady(0x100, tagTab, litTabEb);
		expect(ft1.ready()).to.equal(true);
		ft2.makeReady(0x103, tagTab, litTabEb);
		expect(ft2.ready()).to.equal(true);
		ft3.makeReady(0x106, tagTab, litTabEb);
		expect(ft3.ready()).to.equal(true);

		// 0x04 - LDX(0x04)
		//     disp = location(0x2AB) - (loc(0x100) + length(0x03)) = 0x2AB
		// 0x02 - xbpe(0x00) + disp top 7(0x02)
		// 0xAB - disp bot 8(0xAB)
		expect(ft1.toBytes()).to.eql([0x04, 0x02, 0xAB]);

		// 0x04 - LDX(0x04)
		//     disp = location(0x2AE) = 0x2AE
		// 0x02 - xb0e(0x00) + disp top 7(0x01)
		// 0xAE - disp bot 8(0xA8)
		expect(ft2.toBytes()).to.eql([0x04, 0x02, 0xAE]);

		// 0x04 - LDX(0x04)
		//     disp = location(0x2AB) = 0x2AB
		// 0x02 - xbPe(0x20) + disp top 7(0x01)
		// 0xAB - disp bot 8(0xA2)
		expect(ft3.toBytes()).to.eql([0x04, 0x02, 0xAB]);
	});

	it("handles indexed arguments correctly", () => {
		const split = new cc.SicSplit("\t*LDX VAL,X");
		const fL = new cc.SicFormatLegacy(split, litTab);

		expect(fL.length()).to.equal(3);
		expect(fL.ready()).to.equal(false);

		fL.makeReady(0x50, tagTab, litTab);
		expect(fL.ready()).to.equal(true);
		// 0x04 - LDX(0x04)
		//     disp = address(0x123)
		// 0x81 - Xbpe(0x80) + disp top 7(0x01)
		// 0x23 - disp bot 8(0x23)
		expect(fL.toBytes()).to.eql([0x04, 0x81, 0x23]);
	});

	it("throws on invalid arguments", () => {
		const splitBad1 = new cc.SicSplit("\t+LDA VAL");
		const splitBad2 = new cc.SicSplit("\tLDA VAL");
		const splitBad3 = new cc.SicSplit("\t*LDA A,B");
		const splitBad4 = new cc.SicSplit("\t*RMO A");

		expect(() => new cc.SicFormatLegacy(splitBad1, litTab)).to.throw();
		expect(() => new cc.SicFormatLegacy(splitBad2, litTab)).to.throw();
		expect(() => new cc.SicFormatLegacy(splitBad3, litTab)).to.throw();
		expect(() => new cc.SicFormatLegacy(splitBad4, litTab)).to.throw();
	});
});

describe("SicFormat4 tests", () => {
	const litTab = new cc.SicLitTab();
	const tagTab: {[key: string]: number} = {
		VAL: 0x123,
	};

	it("handles indirect arguments correctly", () => {
		const split = new cc.SicSplit("\t+LDX @VAL");
		const f4 = new cc.SicFormat4(split, litTab);

		expect(f4.length()).to.equal(4);
		expect(f4.ready()).to.equal(false);

		f4.makeReady(0x200, tagTab, litTab);
		expect(f4.ready()).to.equal(true);
		// 0x05 - LDX(0x04) + Ni(0x02)
		//     disp = address(0x123) = 0x00123
		// 0x2F - xbpE(0x10) + disp top 4(0x00)
		// 0x23 - disp bot 8(0x23)
		expect(f4.toBytes()).to.eql([0x06, 0x10, 0x01, 0x23]);
	});

	it("handles immediate arguments correctly", () => {
		const split = new cc.SicSplit("\t+LDX #VAL");
		const f4 = new cc.SicFormat4(split, litTab);

		expect(f4.length()).to.equal(4);
		expect(f4.ready()).to.equal(false);

		f4.makeReady(0x200, tagTab, litTab);
		expect(f4.ready()).to.equal(true);
		// 0x05 - LDX(0x04) + nI(0x01)
		//     disp = address(0x123)
		// 0x10 - xbpE(0x10) + disp top 4(0x00)
		// 0x01 - disp mid 8(0x01)
		// 0x23 - disp bot 8(0x23)
		expect(f4.toBytes()).to.eql([0x05, 0x10, 0x01, 0x23]);
	});

	it("handles literal arguments correctly", () => {
		const split = new cc.SicSplit("\t+LDX =X'1CD'");
		const split2 = new cc.SicSplit("\t+LDX =X'1CE'");
		const split3 = new cc.SicSplit("\t+LDX =461"); // 0x1CD

		const ft1 = new cc.SicFormat4(split, litTab);
		expect(litTab.hasPending(0x1CD)).to.equal(true);
		const ft2 = new cc.SicFormat4(split2, litTab);
		expect(litTab.hasPending(0x1CE)).to.equal(true);
		const ft3 = new cc.SicFormat4(split3, litTab);
		expect(litTab.hasPending(0x1CD)).to.equal(true);

		litTab.createOrg(0x2AB);

		expect(ft1.length()).to.equal(4);
		expect(ft1.ready()).to.equal(false);
		expect(ft2.length()).to.equal(4);
		expect(ft2.ready()).to.equal(false);
		expect(ft3.length()).to.equal(4);
		expect(ft3.ready()).to.equal(false);

		ft1.makeReady(0x100, tagTab, litTab);
		expect(ft1.ready()).to.equal(true);
		ft2.makeReady(0x104, tagTab, litTab);
		expect(ft2.ready()).to.equal(true);
		ft3.makeReady(0x108, tagTab, litTab);
		expect(ft3.ready()).to.equal(true);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = location(0x2AB) = 0x002AB
		// 0x21 - xbpE(0x01) + disp top 4(0x00)
		// 0xA8 - disp mid 8(0x02)
		// 0xAB - disp bot 8(0xAB)
		expect(ft1.toBytes()).to.eql([0x07, 0x10, 0x02, 0xAB]);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = location(0x2AB) = 0x002AE
		// 0x21 - xbpE(0x01) + disp top 4(0x00)
		// 0xA8 - disp mid 8(0x02)
		// 0xAE - disp bot 8(0xAE)
		expect(ft2.toBytes()).to.eql([0x07, 0x10, 0x02, 0xAE]);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = location(0x2AB) = 0x002AB
		// 0x21 - xbpE(0x01) + disp top 4(0x00)
		// 0xA8 - disp mid 8(0x02)
		// 0xAB - disp bot 8(0xAB)
		expect(ft3.toBytes()).to.eql([0x07, 0x10, 0x02, 0xAB]);
	});

	it("handles indexed arguments correctly", () => {
		const split = new cc.SicSplit("\t+LDX VAL,X");
		const f4 = new cc.SicFormat4(split, litTab);

		expect(f4.length()).to.equal(4);
		expect(f4.ready()).to.equal(false);

		f4.makeReady(0x50, tagTab, litTab);
		expect(f4.ready()).to.equal(true);
		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x123) = 0x00123
		// 0x90 - XbpE(0x90) + disp top 4(0x00)
		// 0x01 - disp mid 8(0x01)
		// 0x23 - disp bot 8(0x23)
		expect(f4.toBytes()).to.eql([0x07, 0x90, 0x01, 0x23]);
	});

	it("throws on invalid arguments", () => {
		const splitBad1 = new cc.SicSplit("\tLDA VAL");
		const splitBad2 = new cc.SicSplit("\t*LDA VAL");
		const splitBad3 = new cc.SicSplit("\t+LDA A,B");
		const splitBad4 = new cc.SicSplit("\t+RMO A");

		expect(() => new cc.SicFormat4(splitBad1, litTab)).to.throw();
		expect(() => new cc.SicFormat4(splitBad2, litTab)).to.throw();
		expect(() => new cc.SicFormat4(splitBad3, litTab)).to.throw();
		expect(() => new cc.SicFormat4(splitBad4, litTab)).to.throw();
	});
});

describe("SicSpace tests", () => {
	it("handles WORD/BYTE correctly", () => {
		const splitWORD = new cc.SicSplit("\tWORD X'ABCD12'");
		const splitBYTE = new cc.SicSplit("\tBYTE 12");
		const w = new cc.SicSpace(splitWORD);
		const b = new cc.SicSpace(splitBYTE);

		expect(w.length()).to.equal(3);
		expect(w.toBytes()).to.eql([0xAB, 0xCD, 0x12]);
		expect(b.length()).to.equal(3);
		expect(b.toBytes()).to.eql([0x00, 0x00, 12]);
	});

	it("throws on invalid arguments", () => {
		const splitFail1 = new cc.SicSplit("\tLDA 4");
		const splitFail2 = new cc.SicSplit("\tWORD");
		const splitFail3 = new cc.SicSplit("\tBYTE 1,2");

		expect(() => new cc.SicSpace(splitFail1)).to.throw();
		expect(() => new cc.SicSpace(splitFail2)).to.throw();
		expect(() => new cc.SicSpace(splitFail3)).to.throw();
	});
});

describe("SicCompiler tests", () => {
	const lines = [
		"TEST START 100",
		"BACK LDA @4",
		"\tLDB =4",
		"\tLDT #4",
		"\tLDX 4",
		"\tLDS =X'1BC',X",
		"VAL EQU X'1BC'",
		"\tUSE FOO",
		"\t+STA =4",
		"\tSTB #ACTION",
		"\tSTT BACK",
		"\t+STX @ACTION,X",
		"\tSTS #VAL",
		"\tUSE",
		"\tLTORG",
		"ACTION RMO B,A",
		"\tFIX",
		"\t+LDS =4",
		"WORDN WORD X'ABC'",
		"HUGE RESB X'1000'",
		"WORDB BYTE C'EOF'",
		"\tBASE VAL",
		"\tLDA ACTION",
		"\tNOBASE",
		"\tLDA ACTION",
		"\tEND TEST",
	];
	const lstExpect = [
		"n    \taloc \trloc \tbytecode\tsource",
		"-----\t-----\t-----\t--------\t------",
		"1    \t100  \t100  \t        \tTEST START 100",
		"2    \t100  \t100  \t020004  \tBACK LDA @4",
		"3    \t103  \t103  \t6B201A  \t\tLDB =4",
		"4    \t106  \t106  \t750004  \t\tLDT #4",
		"5    \t109  \t109  \t070004  \t\tLDX 4",
		"6    \t10C  \t10C  \t6FA014  \t\tLDS =X'1BC',X",
		"7    \t     \t     \t        \tVAL EQU X'1BC'",
		"8    \t     \t     \t        \t\tUSE FOO",
		"9    \t10F  \t100  \t0F100120\t\t+STA =4",
		"A    \t113  \t104  \t792010  \t\tSTB #ACTION",
		"B    \t116  \t107  \t872FE7  \t\tSTT BACK",
		"C    \t119  \t10A  \t12900126\t\t+STX @ACTION,X",
		"D    \t11D  \t10E  \t7D01BC  \t\tSTS #VAL",
		"E    \t     \t     \t        \t\tUSE",
		"F    \t     \t     \t        \t\tLTORG",
		"10   \t120  \t10F  \t000004  \tLTORG-WORD X'4'",
		"11   \t123  \t112  \t0001BC  \tLTORG-WORD X'1BC'",
		"12   \t126  \t115  \tAC30    \tACTION RMO B,A",
		"13   \t128  \t117  \tC4      \t\tFIX",
		"14   \t129  \t118  \t6F100120\t\t+LDS =4",
		"15   \t12D  \t11C  \t000ABC  \tWORDN WORD X'ABC'",
		"16   \t130  \t11F  \t        \tHUGE RESB X'1000'",
		"17   \t1130 \t111F \t454F46  \tWORDB BYTE C'EOF'",
		"18   \t     \t     \t        \t\tBASE VAL",
		"19   \t1133 \t1122 \t034F6A  \t\tLDA ACTION",
		"1A   \t     \t     \t        \t\tNOBASE",
		"1B   \t1136 \t1125 \t030126  \t\tLDA ACTION",
		"1C   \t1139 \t1128 \t        \t\tEND TEST",
	];
	const objExpect = [
		// TEST = name of prog, 000100 = start loc, 001039 = length of prog
		"HTEST 000100001039",
		// 000100 = loc, 03 = len, 020004 = obj code
		"T00010003020004",
		"T000103036B201A",
		"T00010603750004",
		"T00010903070004",
		"T00010C036FA014",
		"T00010F040F100120",
		"T00011303792010",
		"T00011603872FE7",
		"T0001190412900126",
		"T00011D037D01BC",
		"T00012003000004",
		"T000123030001BC",
		"T00012602AC30",
		"T00012801C4",
		"T000129046F100120",
		"T00012D03000ABC",
		"T00113003454F46",
		"T00113303034F6A",
		"T00113603030126",
		"E000100",
	];

	it("creates a correct lst for a sample program", () => {
		const p1 = new cc.SicCompiler(lines);
		expect(p1.makeLst()).to.eql(lstExpect);
	});

	it("creates a correct obj for a sample program", () => {
		const p1 = new cc.SicCompiler(lines);
		expect(p1.makeObj()).to.eql(objExpect);
	});

	const csectLines = [
		"TEST START 123",
		"\tLDA #4",
		"NSEC CSECT",
		"\tLDA #5",
		"\tEND TEST",
	];
	const csectLst = [
		"n    \taloc \trloc \tbytecode\tsource",
		"-----\t-----\t-----\t--------\t------",
		"1    \t123  \t123  \t        \tTEST START 123",
		"2    \t123  \t123  \t010004  \t\tLDA #4",
		"3    \t     \t     \t        \tNSEC CSECT",
		"4    \t0    \t0    \t010005  \t\tLDA #5",
		"5    \t126  \t126  \t        \t\tEND TEST",
	];
	const csectObj = [
		"HTEST 000123000003",
		"DNSEC000003",
		"T00012303010004",
		"E000123",
		"HNSEC 000000000003",
		"T00000003010005",
	];

	it("interacts with csect properly", () => {
		const p1 = new cc.SicCompiler(csectLines);
		expect(p1.makeLst()).to.eql(csectLst);
		expect(p1.makeObj()).to.eql(csectObj);
	});
});
