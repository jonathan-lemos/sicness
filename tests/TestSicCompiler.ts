import { expect } from "chai";
import { SicBase } from "../src/SicCompiler/SicBase";
import { SicCompiler } from "../src/SicCompiler/SicCompiler";
import { SicCsect } from "../src/SicCompiler/SicCsect";
import { asByte, asHex, asWord, bytesToString } from "../src/SicCompiler/SicFmt";
import { SicFormat1 } from "../src/SicCompiler/SicFormat1";
import { SicFormat2 } from "../src/SicCompiler/SicFormat2";
import { SicFormat3 } from "../src/SicCompiler/SicFormat3";
import { SicFormat4 } from "../src/SicCompiler/SicFormat4";
import { SicFormatLegacy } from "../src/SicCompiler/SicFormatLegacy";
import { SicLitTab } from "../src/SicCompiler/SicLitTab";
import { SicOpAddrType, SicOperandAddr, SicOpType } from "../src/SicCompiler/SicOperandAddr";
import { SicPending } from "../src/SicCompiler/SicPending";
import { SicSpace } from "../src/SicCompiler/SicSpace";
import { SicSplit } from "../src/SicCompiler/SicSplit";
import { sicCheckUnsigned, sicMakeMask, sicMakeUnsigned } from "../src/SicCompiler/SicUnsigned";

describe("Number to string tests", () => {
	it("converts to hex correctly", () => {
		expect(asHex(0x63)).to.equal("63");
		expect(asHex(255)).to.equal("FF");
		expect(asHex(1234)).to.equal("4D2");
	});

	it("converts a number to a byte correctly", () => {
		expect(asByte(0x63)).to.equal("63");
		expect(asByte(255)).to.equal("FF");
		expect(asByte(15)).to.equal("0F");
	});

	it("converts a number to a word correctly", () => {
		expect(asWord(0x63)).to.equal("000063");
		expect(asWord(16777215)).to.equal("FFFFFF");
		expect(asWord(1234)).to.equal("0004D2");
	});

	it("reduces a byte array to a string correctly", () => {
		expect(bytesToString([0x12, 0x34, 0x56, 0x78, 0x9A])).to.equal("123456789A");
		expect(bytesToString([0x0A, 0x0B, 255, 1])).to.equal("0A0BFF01");
	});
});

describe("SicUnsigned tests", () => {
	it("creates bitmasks correctly", () => {
		expect(sicMakeMask(7)).to.equal(0x7F);
		expect(sicMakeMask(8)).to.equal(0xFF);
		expect(sicMakeMask(12)).to.equal(0xFFF);
		expect(sicMakeMask(16)).to.equal(0xFFFF);
	});

	it("validates unsigned values correctly", () => {
		expect(() => sicCheckUnsigned(255, 8)).not.to.throw();
		expect(() => sicCheckUnsigned(256, 8)).to.throw();
		expect(() => sicCheckUnsigned(0, 8)).not.to.throw();
		expect(() => sicCheckUnsigned(65535, 16)).not.to.throw();
	});

	it("converts signed values to unsigned correctly", () => {
		expect(sicMakeUnsigned(0x7F, 8)).to.equal(0x7F);
		expect(() => sicMakeUnsigned(0x80, 8)).to.throw();
		expect(sicMakeUnsigned(-0x80, 8)).to.equal(0x80);
		expect(() => sicMakeUnsigned(-0x81, 8)).to.throw();
		expect(sicMakeUnsigned(-0x80, 16)).to.equal(0xFF80);
	});
});

describe("SicSplit tests", () => {
	it("handles basic statements correctly", () => {
		const ss = new SicSplit("\tLDA\tVAL");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("LDA");
		expect(ss.args).to.equal("VAL");
	});

	it("handles labels correctly", () => {
		const ss = new SicSplit("TAG\tLDA\tVAL");
		expect(ss.tag).to.equal("TAG");
		expect(ss.op).to.equal("LDA");
		expect(ss.args).to.equal("VAL");
	});

	it("handles 2 arguments without spaces correctly", () => {
		const ss = new SicSplit("\tRMO A,B");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("RMO");
		expect(ss.args).to.equal("A,B");
	});

	it("handles 2 arguments with spaces correctly", () => {
		const ss = new SicSplit("\tRMO\tA, B");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("RMO");
		expect(ss.args).to.equal("A,B");
	});

	it("handles 0 arguments correctly", () => {
		const ss = new SicSplit("\tFIX");
		expect(ss.tag).to.equal("");
		expect(ss.op).to.equal("FIX");
		expect(ss.args).to.equal("");
	});

	it("handles lowercase arguments correctly", () => {
		const ss = new SicSplit("tag\tlda\ta");
		expect(ss.tag).to.equal("TAG");
		expect(ss.op).to.equal("LDA");
		expect(ss.args).to.equal("A");
	});
});

describe("SicPending tests", () => {
	const tagTab: {[key: string]: number} = {
		VAL: 0x123,
	};

	const litTab = new SicLitTab();
	litTab.add(0x123);
	litTab.createOrg(0x456);

	it("handles tags correctly", () => {
		const sp = new SicPending("VAL");
		expect(sp.isTag()).to.equal(true);
		expect(sp.isLiteral()).to.equal(false);
		expect(sp.convert(tagTab, litTab, null)).to.equal(0x123);
	});

	it("handles literals correctly", () => {
		const sp = new SicPending(0x123);
		expect(sp.isTag()).to.equal(false);
		expect(sp.isLiteral()).to.equal(true);
		expect(sp.convert(tagTab, litTab, null)).to.equal(0x456);
	});
});

describe("SicBase tests", () => {
	it("handles straight numbers correctly", () => {
		const b = new SicBase(0x10);
		expect(b.ready()).to.equal(true);
		expect(b.val).to.equal(0x10);
	});

	it("handles sicpending correctly", () => {
		const p = new SicPending("VAL");
		const tagTab: {[key: string]: number} = {
			VAL: 0x123,
		};
		const litTab: {[key: number]: number} = {
			0x100: 0x200,
		};
		const b = new SicBase(p);
		expect(b.ready()).to.equal(false);
		b.makeReady(tagTab);
		expect(b.ready()).to.equal(true);
		expect(b.val as number).to.equal(0x123);
	});

	it("handles literals correctly", () => {
		const p = new SicPending(0x10);
		const b = new SicBase(p);
		expect(b.ready()).to.equal(true);
		expect(b.val as number).to.equal(0x10);
	});
});

describe("SicOperandAddr tests", () => {
	const csect = new SicCsect(0);

	it("handles format 3 arguments correctly", () => {
		const form3 = new SicOperandAddr("VAL", SicOpType.f3, csect);
		expect(form3.addr).to.equal(SicOpAddrType.direct);
		expect(form3.pcrel).to.equal(true);
		expect(form3.base).to.equal(undefined);
		expect(form3.indexed).to.equal(false);
		expect(form3.type).to.equal(SicOpType.f3);
		expect((form3.val as SicPending).val).to.equal("VAL");
	});

	it("handles sic legacy arguments correctly", () => {
		const legacy = new SicOperandAddr("AAA", SicOpType.legacy, csect);
		expect(legacy.addr).to.equal(SicOpAddrType.direct);
		expect(legacy.pcrel).to.equal(false);
		expect(legacy.base).to.equal(undefined);
		expect(legacy.indexed).to.equal(false);
		expect(legacy.type).to.equal(SicOpType.legacy);
		expect((legacy.val as SicPending).val).to.equal("AAA");
	});

	it("handles format 4 arguments correctly", () => {
		const form4 = new SicOperandAddr("BBB", SicOpType.f4, csect);
		expect(form4.addr).to.equal(SicOpAddrType.direct);
		expect(form4.pcrel).to.equal(false);
		expect(form4.base).to.equal(undefined);
		expect(form4.indexed).to.equal(false);
		expect(form4.type).to.equal(SicOpType.f4);
		expect((form4.val as SicPending).val).to.equal("BBB");
	});

	it("handles indirect arguments correctly", () => {
		const indirect = new SicOperandAddr("@VAL", SicOpType.f3, csect);
		expect(indirect.addr).to.equal(SicOpAddrType.indirect);
		expect(indirect.pcrel).to.equal(true);
		expect(indirect.base).to.equal(undefined);
		expect(indirect.indexed).to.equal(false);
		expect(indirect.type).to.equal(SicOpType.f3);
		expect((indirect.val as SicPending).val).to.equal("VAL");
	});

	it("handles immediate arguments correctly", () => {
		const immediate = new SicOperandAddr("#VAL", SicOpType.f3, csect);
		expect(immediate.addr).to.equal(SicOpAddrType.immediate);
		expect(immediate.pcrel).to.equal(true);
		expect(immediate.base).to.equal(undefined);
		expect(immediate.indexed).to.equal(false);
		expect(immediate.type).to.equal(SicOpType.f3);
		expect((immediate.val as SicPending).val).to.equal("VAL");
	});

	it("handles numeric arguments correctly", () => {
		const immNumber = new SicOperandAddr("#X'100'", SicOpType.f3, csect);
		expect(immNumber.addr).to.equal(SicOpAddrType.immediate);
		expect(immNumber.pcrel).to.equal(false);
		expect(immNumber.base).to.equal(undefined);
		expect(immNumber.indexed).to.equal(false);
		expect(immNumber.type).to.equal(SicOpType.f3);
		expect(immNumber.val).to.equal(0x100);
	});

	it("handles literal arguments correctly", () => {
		const literal = new SicOperandAddr("=15", SicOpType.f3, csect);
		expect(literal.addr).to.equal(SicOpAddrType.direct);
		expect(literal.pcrel).to.equal(true);
		expect(literal.base).to.equal(undefined);
		expect(literal.indexed).to.equal(false);
		expect(literal.type).to.equal(SicOpType.f3);
		expect((literal.val as SicPending).val).to.equal(15);

		expect(csect.litTab.hasPending(15)).to.equal(true);
	});

	it("handles baserel format 3 arguments correctly", () => {
		csect.base = new SicBase(8);
		const baserel = new SicOperandAddr("VAL", SicOpType.f3, csect);
		expect(baserel.addr).to.equal(SicOpAddrType.direct);
		// both pcrel and baserel are supposed to be true
		// makeReady() tries pcrel and then baserel
		expect(baserel.pcrel).to.equal(true);
		expect((baserel.base as SicBase).val).to.equal(8);
		expect(baserel.indexed).to.equal(false);
		expect(baserel.type).to.equal(SicOpType.f3);
		expect((baserel.val as SicPending).val).to.equal("VAL");
	});

	csect.base = undefined;

	it("drops baserel/pcrel on format4 arguments correctly", () => {
		csect.base = new SicBase(8);
		const baserel = new SicOperandAddr("VAL", SicOpType.f4, csect);
		expect(baserel.addr).to.equal(SicOpAddrType.direct);
		expect(baserel.pcrel).to.equal(false);
		expect(baserel.base).to.equal(undefined);
		expect(baserel.indexed).to.equal(false);
		expect(baserel.type).to.equal(SicOpType.f4);
		expect((baserel.val as SicPending).val).to.equal("VAL");
	});

	it("handles indexed arguments correctly", () => {
		csect.base = undefined;
		const indexed = new SicOperandAddr("TAG,X", SicOpType.f3, csect);
		expect(indexed.addr).to.equal(SicOpAddrType.direct);
		expect(indexed.pcrel).to.equal(true);
		expect(indexed.base).to.equal(undefined);
		expect(indexed.indexed).to.equal(true);
		expect(indexed.type).to.equal(SicOpType.f3);
		expect((indexed.val as SicPending).val).to.equal("TAG");
	});

	it("throws on invalid arguments", () => {
		expect(() => new SicOperandAddr("VAL,VAL2", SicOpType.f3, csect)).to.throw();
		expect(() => new SicOperandAddr("@VAL", SicOpType.legacy, csect)).to.throw();
		expect(() => new SicOperandAddr("$$AQQ", SicOpType.f3, csect)).to.throw();
	});
});

describe("SicFormat1 tests", () => {
	it("handles basic format1 arguments correctly", () => {
		const splitGood = new SicSplit("\tFIX");
		const f1 = new SicFormat1(splitGood);
		expect(f1.bc.mnemonic).to.equal("FIX");
		expect(f1.length()).to.equal(1);
		expect(f1.ready()).to.equal(true);
		expect(f1.toBytes()).to.eql([0xC4]);
	});

	it("throws on invalid format 1 arguments", () => {
		const splitBad1 = new SicSplit("\tLDA");
		const splitBad2 = new SicSplit("\tFIX A");
		expect(() => new SicFormat1(splitBad1)).to.throw();
		expect(() => new SicFormat1(splitBad2)).to.throw();
	});
});

describe("SicFormat2 tests", () => {
	it("handles basic format2 arguments correctly", () => {
		const splitGood = new SicSplit("\tSHIFTL B, 4");
		const f2 = new SicFormat2(splitGood);
		expect(f2.bc.mnemonic).to.equal("SHIFTL");
		expect(f2.length()).to.equal(2);
		expect(f2.ready()).to.equal(true);
		expect(f2.toBytes()).to.eql([0xA4, 0x34]);
	});

	it("throws on invalid format2 arguments", () => {
		const splitBad1 = new SicSplit("\tSHIFTL");
		const splitBad2 = new SicSplit("\tLDA B, 4");
		expect(() => new SicFormat2(splitBad1)).to.throw();
		expect(() => new SicFormat2(splitBad2)).to.throw();
	});
});

describe("SicFormat3 tests", () => {
	const csect = new SicCsect(0);
	csect.tagTab = {
		VAL: 0x123,
		YUGE: 0x9FF,
	};

	it("handles pcrel forward correctly", () => {
		const split = new SicSplit("AAA\tLDX VAL .comment");
		const f3 = new SicFormat3(split, csect);

		expect(f3.length()).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x50, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(f3.ready()).to.equal(true);
		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x123) - (loc(0x50) + len(0x03)) = 0x0D0
		// 0x20 - xbPe(0x20) + disp top 4(0x00)
		// 0xD0 - disp bot 8(0xD0)
		expect(f3.toBytes()).to.eql([0x07, 0x20, 0xD0]);
	});

	it("handles pcrel backward correctly", () => {
		const split = new SicSplit("BBB\tLDX VAL");
		const f3 = new SicFormat3(split, csect);

		expect(f3.length()).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x200, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(f3.ready()).to.equal(true);
		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x123) - (loc(0x200) + len(0x03)) = 0xF23
		// 0x2F - xbPe(0x20) + disp top 4(0x0F)
		// 0x20 - disp bot 8(0x20)
		expect(f3.toBytes()).to.eql([0x07, 0x2F, 0x20]);
	});

	it("handles indirect arguments correctly", () => {
		const split = new SicSplit("\tLDX @VAL");
		const f3 = new SicFormat3(split, csect);

		expect(f3.length()).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x200, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(f3.ready()).to.equal(true);
		// 0x06 - LDX(0x04) + Ni(0x02)
		//     disp = address(0x123) - (loc(0x200) + len(0x03)) = 0xF20
		// 0x2F - xbPe(0x20) + disp top 4(0x0F)
		// 0x20 - disp bot 8(0x20)
		expect(f3.toBytes()).to.eql([0x06, 0x2F, 0x20]);
	});

	it("handles immediate arguments correctly", () => {
		const split = new SicSplit("\tLDX #VAL");
		const f3 = new SicFormat3(split, csect);

		expect(f3.length()).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x200, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(f3.ready()).to.equal(true);
		// 0x06 - LDX(0x04) + nI(0x01)
		//     disp = address(0x123) - (loc(0x200) + len(0x03)) = 0xF20
		// 0x2F - xbPe(0x20) + disp top 4(0x0F)
		// 0x20 - disp bot 8(0x20)
		expect(f3.toBytes()).to.eql([0x05, 0x2F, 0x20]);
	});

	it("handles literal arguments correctly", () => {
		const split = new SicSplit("\tLDX =X'1CD'");
		const split2 = new SicSplit("\tLDX =X'1CE'");
		const split3 = new SicSplit("\tLDX =461"); // 0x1CD
		csect.litTab = new SicLitTab();

		const ft1 = new SicFormat3(split, csect);
		expect(csect.litTab.hasPending(0x1CD)).to.equal(true);
		const ft2 = new SicFormat3(split2, csect);
		expect(csect.litTab.hasPending(0x1CE)).to.equal(true);
		const ft3 = new SicFormat3(split3, csect);
		expect(csect.litTab.hasPending(0x1CD)).to.equal(true);

		csect.litTab.createOrg(0x2AB);

		expect(ft1.length()).to.equal(3);
		expect(ft1.ready()).to.equal(false);
		expect(ft2.length()).to.equal(3);
		expect(ft2.ready()).to.equal(false);
		expect(ft3.length()).to.equal(3);
		expect(ft3.ready()).to.equal(false);

		ft1.makeReady(0x100, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(ft1.ready()).to.equal(true);
		ft2.makeReady(0x103, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(ft2.ready()).to.equal(true);
		ft3.makeReady(0x106, csect.tagTab, csect.litTab, csect.extRefTab);
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

	csect.litTab = new SicLitTab();

	it("handles baserel arguments correctly", () => {
		const splitFar = new SicSplit("\tLDX YUGE");
		const splitNear = new SicSplit("\tLDX X'200'");
		csect.base = new SicBase(0x300);
		const f3Far = new SicFormat3(splitFar, csect);
		const f3Near = new SicFormat3(splitNear, csect);

		expect(f3Far.length()).to.equal(3);
		expect(f3Far.ready()).to.equal(false);
		f3Far.makeReady(0x100, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(f3Far.ready()).to.equal(true);

		expect(f3Near.length()).to.equal(3);
		expect(f3Near.ready()).to.equal(true);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x9FF) - base(0x300) = 0x6FF
		// 0x49 - xBpe(0x40) + disp top 4(0x06)
		// 0xEF - disp bot 8(0xFF)
		expect(f3Far.toBytes()).to.eql([0x07, 0x46, 0xFF]);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x200) = 0x200
		// 0x49 - xbpe(0x00) + disp top 4(0x02)
		// 0xEF - disp bot 8(0x00)
		expect(f3Near.toBytes()).to.eql([0x07, 0x02, 0x00]);
	});

	csect.base = undefined;

	it("handles indexed arguments correctly", () => {
		const split = new SicSplit("\tLDX VAL,X");
		const f3 = new SicFormat3(split, csect);

		expect(f3.length()).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x50, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(f3.ready()).to.equal(true);
		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x123) - (loc(0x50) + len(0x03)) = 0x0D0
		// 0xA0 - XbPe(0xA0) + disp top 4(0x00)
		// 0xD0 - disp bot 8(0xD0)
		expect(f3.toBytes()).to.eql([0x07, 0xA0, 0xD0]);
	});

	it("throws on invalid arguments", () => {
		const splitBad1 = new SicSplit("\t+LDA VAL");
		const splitBad2 = new SicSplit("\t*LDA VAL");
		const splitBad3 = new SicSplit("\tLDA A,B");
		const splitBad4 = new SicSplit("\tRMO A");

		expect(() => new SicFormat3(splitBad1, csect)).to.throw();
		expect(() => new SicFormat3(splitBad2, csect)).to.throw();
		expect(() => new SicFormat3(splitBad3, csect)).to.throw();
		expect(() => new SicFormat3(splitBad4, csect)).to.throw();
	});
});

describe("SicFormatLegacy tests", () => {
	const csect = new SicCsect(0);
	csect.tagTab = {
		VAL: 0x123,
	};

	it("handles literal arguments correctly", () => {
		const split = new SicSplit("\t*LDX =X'1CD'");
		const split2 = new SicSplit("\t*LDX =X'1CE'");
		const split3 = new SicSplit("\t*LDX =461"); // 0x1CD

		const ft1 = new SicFormatLegacy(split, csect);
		expect(csect.litTab.hasPending(0x1CD)).to.equal(true);
		const ft2 = new SicFormatLegacy(split2, csect);
		expect(csect.litTab.hasPending(0x1CE)).to.equal(true);
		const ft3 = new SicFormatLegacy(split3, csect);
		expect(csect.litTab.hasPending(0x1CD)).to.equal(true);

		csect.litTab.createOrg(0x2AB);

		expect(ft1.length()).to.equal(3);
		expect(ft1.ready()).to.equal(false);
		expect(ft2.length()).to.equal(3);
		expect(ft2.ready()).to.equal(false);
		expect(ft3.length()).to.equal(3);
		expect(ft3.ready()).to.equal(false);

		ft1.makeReady(0x100, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(ft1.ready()).to.equal(true);
		ft2.makeReady(0x103, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(ft2.ready()).to.equal(true);
		ft3.makeReady(0x106, csect.tagTab, csect.litTab, csect.extRefTab);

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
		const split = new SicSplit("\t*LDX VAL,X");
		const fL = new SicFormatLegacy(split, csect);

		expect(fL.length()).to.equal(3);
		expect(fL.ready()).to.equal(false);

		fL.makeReady(0x50, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(fL.ready()).to.equal(true);
		// 0x04 - LDX(0x04)
		//     disp = address(0x123)
		// 0x81 - Xbpe(0x80) + disp top 7(0x01)
		// 0x23 - disp bot 8(0x23)
		expect(fL.toBytes()).to.eql([0x04, 0x81, 0x23]);
	});

	it("throws on invalid arguments", () => {
		const splitBad1 = new SicSplit("\t+LDA VAL");
		const splitBad2 = new SicSplit("\tLDA VAL");
		const splitBad3 = new SicSplit("\t*LDA A,B");
		const splitBad4 = new SicSplit("\t*RMO A");

		expect(() => new SicFormatLegacy(splitBad1, csect)).to.throw();
		expect(() => new SicFormatLegacy(splitBad2, csect)).to.throw();
		expect(() => new SicFormatLegacy(splitBad3, csect)).to.throw();
		expect(() => new SicFormatLegacy(splitBad4, csect)).to.throw();
	});
});

describe("SicFormat4 tests", () => {
	const csect = new SicCsect(0);
	csect.tagTab = {
		VAL: 0x123,
	};

	it("handles indirect arguments correctly", () => {
		const split = new SicSplit("\t+LDX @VAL");
		const f4 = new SicFormat4(split, csect);

		expect(f4.length()).to.equal(4);
		expect(f4.ready()).to.equal(false);

		f4.makeReady(0x200, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(f4.ready()).to.equal(true);
		// 0x05 - LDX(0x04) + Ni(0x02)
		//     disp = address(0x123) = 0x00123
		// 0x2F - xbpE(0x10) + disp top 4(0x00)
		// 0x23 - disp bot 8(0x23)
		expect(f4.toBytes()).to.eql([0x06, 0x10, 0x01, 0x23]);
	});

	it("handles immediate arguments correctly", () => {
		const split = new SicSplit("\t+LDX #VAL");
		const f4 = new SicFormat4(split, csect);

		expect(f4.length()).to.equal(4);
		expect(f4.ready()).to.equal(false);

		f4.makeReady(0x200, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(f4.ready()).to.equal(true);
		// 0x05 - LDX(0x04) + nI(0x01)
		//     disp = address(0x123)
		// 0x10 - xbpE(0x10) + disp top 4(0x00)
		// 0x01 - disp mid 8(0x01)
		// 0x23 - disp bot 8(0x23)
		expect(f4.toBytes()).to.eql([0x05, 0x10, 0x01, 0x23]);
	});

	it("handles literal arguments correctly", () => {
		const split = new SicSplit("\t+LDX =X'1CD'");
		const split2 = new SicSplit("\t+LDX =X'1CE'");
		const split3 = new SicSplit("\t+LDX =461"); // 0x1CD

		const ft1 = new SicFormat4(split, csect);
		expect(csect.litTab.hasPending(0x1CD)).to.equal(true);
		const ft2 = new SicFormat4(split2, csect);
		expect(csect.litTab.hasPending(0x1CE)).to.equal(true);
		const ft3 = new SicFormat4(split3, csect);
		expect(csect.litTab.hasPending(0x1CD)).to.equal(true);

		csect.litTab.createOrg(0x2AB);

		expect(ft1.length()).to.equal(4);
		expect(ft1.ready()).to.equal(false);
		expect(ft2.length()).to.equal(4);
		expect(ft2.ready()).to.equal(false);
		expect(ft3.length()).to.equal(4);
		expect(ft3.ready()).to.equal(false);

		ft1.makeReady(0x100, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(ft1.ready()).to.equal(true);
		ft2.makeReady(0x104, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(ft2.ready()).to.equal(true);
		ft3.makeReady(0x108, csect.tagTab, csect.litTab, csect.extRefTab);
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
		const split = new SicSplit("\t+LDX VAL,X");
		const f4 = new SicFormat4(split, csect);

		expect(f4.length()).to.equal(4);
		expect(f4.ready()).to.equal(false);

		f4.makeReady(0x50, csect.tagTab, csect.litTab, csect.extRefTab);
		expect(f4.ready()).to.equal(true);
		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x123) = 0x00123
		// 0x90 - XbpE(0x90) + disp top 4(0x00)
		// 0x01 - disp mid 8(0x01)
		// 0x23 - disp bot 8(0x23)
		expect(f4.toBytes()).to.eql([0x07, 0x90, 0x01, 0x23]);
	});

	it("throws on invalid arguments", () => {
		const splitBad1 = new SicSplit("\tLDA VAL");
		const splitBad2 = new SicSplit("\t*LDA VAL");
		const splitBad3 = new SicSplit("\t+LDA A,B");
		const splitBad4 = new SicSplit("\t+RMO A");

		expect(() => new SicFormat4(splitBad1, csect)).to.throw();
		expect(() => new SicFormat4(splitBad2, csect)).to.throw();
		expect(() => new SicFormat4(splitBad3, csect)).to.throw();
		expect(() => new SicFormat4(splitBad4, csect)).to.throw();
	});
});

describe("SicSpace tests", () => {
	it("handles WORD/BYTE correctly", () => {
		const splitWORD = new SicSplit("\tWORD X'ABCD12'");
		const splitBYTE = new SicSplit("\tBYTE -12");
		const w = new SicSpace(splitWORD);
		const b = new SicSpace(splitBYTE);

		expect(w.length()).to.equal(3);
		expect(w.toBytes()).to.eql([0xAB, 0xCD, 0x12]);
		expect(b.length()).to.equal(3);
		expect(b.toBytes()).to.eql([0x00, 0x00, 0xF4]);
	});

	it("throws on invalid arguments", () => {
		const splitFail1 = new SicSplit("\tLDA 4");
		const splitFail2 = new SicSplit("\tWORD");
		const splitFail3 = new SicSplit("\tBYTE 1,2");

		expect(() => new SicSpace(splitFail1)).to.throw();
		expect(() => new SicSpace(splitFail2)).to.throw();
		expect(() => new SicSpace(splitFail3)).to.throw();
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
		"8    \t10F  \t1128 \t        \t\tUSE FOO",
		"9    \t10F  \t1128 \t0F100120\t\t+STA =4",
		"10   \t113  \t112C \t792010  \t\tSTB #ACTION",
		"11   \t116  \t112F \t872FE7  \t\tSTT BACK",
		"12   \t119  \t1132 \t12900126\t\t+STX @ACTION,X",
		"13   \t11D  \t1136 \t7D01BC  \t\tSTS #VAL",
		"14   \t120  \t10F  \t        \t\tUSE",
		"15   \t     \t     \t        \t\tLTORG",
		"16   \t120  \t10F  \t000004  \tX'4' BYTE X'4'",
		"17   \t123  \t112  \t0001BC  \tX'1BC' BYTE X'1BC'",
		"18   \t126  \t115  \tAC30    \tACTION RMO B,A",
		"19   \t128  \t117  \tC4      \t\tFIX",
		"20   \t129  \t118  \t6F100120\t\t+LDS =4",
		"21   \t12D  \t11C  \t000ABC  \tWORDN WORD X'ABC'",
		"22   \t130  \t11F  \t        \tHUGE RESB X'1000'",
		"23   \t1130 \t111F \t454F46  \tWORDB BYTE C'EOF'",
		"24   \t     \t     \t        \t\tBASE VAL",
		"25   \t1133 \t1122 \t034F6A  \t\tLDA ACTION",
		"26   \t     \t     \t        \t\tNOBASE",
		"27   \t1136 \t1125 \t030126  \t\tLDA ACTION",
		"28   \t1139 \t1139 \t        \t\tEND TEST",
	];
	const objExpect = [
		// TEST = name of prog, 000100 = start loc, 001039 = length of prog
		"H TEST 000100 001039",
		// 000100 = loc, 03 = len, 020004 = obj code
		"T 000100 03 020004",
		"T 000103 03 6B201A",
		"T 000106 03 750004",
		"T 000109 03 070004",
		"T 00010C 03 6FA014",
		"T 00010F 04 0F100120",
		"T 000113 03 792010",
		"T 000116 03 872FE7",
		"T 000119 04 12900126",
		"T 00011D 03 7D01BC",
		"T 000120 03 000004",
		"T 000123 03 0001BC",
		"T 000126 02 AC30",
		"T 000128 01 C4",
		"T 000129 04 6F100120",
		"T 00012D 03 000ABC",
		"T 001130 03 454F46",
		"T 001133 03 034F6A",
		"T 001136 03 030126",
		"E 000100",
	];

	it("creates a correct lst for a sample program", () => {
		const p1 = new SicCompiler(lines);
		expect(p1.makeLst()).to.eql(lstExpect);
	});

	it("creates a correct obj for a sample program", () => {
		const p1 = new SicCompiler(lines);
		expect(p1.makeObj()).to.eql(objExpect);
	});

	const csectLines = [
		"TEST START 123",
		"\tLDA #4",
		"YEET RESW 3",
		"\tEXTDEF YEET",
		"NSEC CSECT",
		"\tEXTREF YEET",
		"\t+LDA YEET",
		"\tEND TEST",
	];
	const csectLst = [
		"n    \taloc \trloc \tbytecode\tsource",
		"-----\t-----\t-----\t--------\t------",
		"1    \t123  \t123  \t        \tTEST START 123",
		"2    \t123  \t123  \t010004  \t\tLDA #4",
		"3    \t126  \t126  \t        \tYEET RESW 3",
		"4    \t     \t     \t        \t\tEXTDEF YEET",
		"5    \t     \t     \t        \tNSEC CSECT",
		"6    \t     \t     \t        \t\tEXTREF YEET",
		"7    \t0    \t0    \t03100000\t\t+LDA YEET",
		"8    \t12F  \t12F  \t        \t\tEND TEST",
	];
	const csectObj = [
		"H TEST 000123 00000C",
		"D YEET 000126",
		"T 000123 03 010004",
		"E 000123",
		"H NSEC 000000 000004",
		"R YEET",
		"T 000000 04 03100000",
		"M 000000 05 +YEET",
		"E",
	];

	it("interacts with csect properly", () => {
		const p1 = new SicCompiler(csectLines);
		expect(p1.makeLst()).to.eql(csectLst);
		expect(p1.makeObj()).to.eql(csectObj);
	});
});
