import { expect } from "chai";
import * as cc from "../src/sicxe_cc";

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
		expect(ss.args).to.equal("VAL");
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
	const tagTest = new Set<string>();
	const litTest = new Set<number>();

	it("handles format 3 arguments correctly", () => {
		const form3 = new cc.SicOperandAddr("VAL", cc.SicOpType.f3, tagTest, litTest);
		expect(form3.addr).to.equal(cc.SicOpAddrType.direct);
		expect(form3.pcrel).to.equal(true);
		expect(form3.base).to.equal(undefined);
		expect(form3.indexed).to.equal(false);
		expect(form3.type).to.equal(cc.SicOpType.f3);
		expect(form3.val).to.equal("VAL");

		expect(tagTest.has("VAL")).to.equal(true);
	});

	it("handles sic legacy arguments correctly", () => {
		const legacy = new cc.SicOperandAddr("AAA", cc.SicOpType.legacy, tagTest, litTest);
		expect(legacy.addr).to.equal(cc.SicOpAddrType.direct);
		expect(legacy.pcrel).to.equal(false);
		expect(legacy.base).to.equal(undefined);
		expect(legacy.indexed).to.equal(false);
		expect(legacy.type).to.equal(cc.SicOpType.legacy);
		expect(legacy.val).to.equal("AAA");

		expect(tagTest.has("AAA")).to.equal(true);
	});

	it("handles format 4 arguments correctly", () => {
		const form4 = new cc.SicOperandAddr("BBB", cc.SicOpType.f4, tagTest, litTest);
		expect(form4.addr).to.equal(cc.SicOpAddrType.direct);
		expect(form4.pcrel).to.equal(false);
		expect(form4.base).to.equal(undefined);
		expect(form4.indexed).to.equal(false);
		expect(form4.type).to.equal(cc.SicOpType.f4);
		expect(form4.val).to.equal("BBB");

		expect(tagTest.has("BBB")).to.equal(true);
	});

	it("handles indirect arguments correctly", () => {
		const indirect = new cc.SicOperandAddr("@VAL", cc.SicOpType.f3, tagTest, litTest);
		expect(indirect.addr).to.equal(cc.SicOpAddrType.indirect);
		expect(indirect.pcrel).to.equal(true);
		expect(indirect.base).to.equal(undefined);
		expect(indirect.indexed).to.equal(false);
		expect(indirect.type).to.equal(cc.SicOpType.f3);
		expect(indirect.val).to.equal("VAL");

		expect(tagTest.has("VAL")).to.equal(true);
	});

	it("handles immediate arguments correctly", () => {
		const immediate = new cc.SicOperandAddr("#VAL", cc.SicOpType.f3, tagTest, litTest);
		expect(immediate.addr).to.equal(cc.SicOpAddrType.immediate);
		expect(immediate.pcrel).to.equal(true);
		expect(immediate.base).to.equal(undefined);
		expect(immediate.indexed).to.equal(false);
		expect(immediate.type).to.equal(cc.SicOpType.f3);
		expect((immediate.val as cc.SicPending).val).to.equal("VAL");

		expect(tagTest.has("VAL")).to.equal(true);
	});

	it("handles numeric arguments correctly", () => {
		const immNumber = new cc.SicOperandAddr("#X'100'", cc.SicOpType.f3, tagTest, litTest);
		expect(immNumber.addr).to.equal(cc.SicOpAddrType.immediate);
		expect(immNumber.pcrel).to.equal(true);
		expect(immNumber.base).to.equal(undefined);
		expect(immNumber.indexed).to.equal(false);
		expect(immNumber.type).to.equal(cc.SicOpType.f3);
		expect(immNumber.val).to.equal(0x100);
	});

	it("handles literal arguments correctly", () => {
		const literal = new cc.SicOperandAddr("=15", cc.SicOpType.f3, tagTest, litTest);
		expect(literal.addr).to.equal(cc.SicOpAddrType.direct);
		expect(literal.pcrel).to.equal(true);
		expect(literal.base).to.equal(undefined);
		expect(literal.indexed).to.equal(false);
		expect(literal.type).to.equal(cc.SicOpType.f3);
		expect((literal.val as cc.SicPending).val).to.equal(0x10);

		expect(litTest.has(15)).to.equal(true);
	});

	it("handles baserel format 3 arguments correctly", () => {
		const baserel = new cc.SicOperandAddr("VAL", cc.SicOpType.f3, tagTest, litTest, new cc.SicBase(8));
		expect(baserel.addr).to.equal(cc.SicOpAddrType.direct);
		// both pcrel and baserel are supposed to be true
		// makeReady() tries pcrel and then baserel
		expect(baserel.pcrel).to.equal(true);
		expect((baserel.base as cc.SicBase).val).to.equal(8);
		expect(baserel.indexed).to.equal(false);
		expect(baserel.type).to.equal(cc.SicOpType.f3);
		expect((baserel.val as cc.SicPending).val).to.equal("VAL");

		expect(tagTest.has("VAL")).to.equal(true);
	});

	it("drops baserel/pcrel on format4 arguments correctly", () => {
		const baserel = new cc.SicOperandAddr("VAL", cc.SicOpType.f4, tagTest, litTest, new cc.SicBase(8));
		expect(baserel.addr).to.equal(cc.SicOpAddrType.direct);
		expect(baserel.pcrel).to.equal(false);
		expect(baserel.base).to.equal(undefined);
		expect(baserel.indexed).to.equal(false);
		expect(baserel.type).to.equal(cc.SicOpType.f4);
		expect((baserel.val as cc.SicPending).val).to.equal("VAL");

		expect(tagTest.has("VAL")).to.equal(true);
	});

	it("handles indexed arguments correctly", () => {
		const indexed = new cc.SicOperandAddr("TAG,X", cc.SicOpType.f3, tagTest, litTest);
		expect(indexed.addr).to.equal(cc.SicOpAddrType.direct);
		expect(indexed.pcrel).to.equal(true);
		expect(indexed.base).to.equal(undefined);
		expect(indexed.indexed).to.equal(true);
		expect(indexed.type).to.equal(cc.SicOpType.f3);
		expect((indexed.val as cc.SicPending).val).to.equal("TAG");

		expect(tagTest.has("TAG")).to.equal(true);
	});

	it("throws on invalid arguments", () => {
		expect(() => new cc.SicOperandAddr("VAL,VAL2", cc.SicOpType.f3, tagTest, litTest)).to.throw();
		expect(() => new cc.SicOperandAddr("@VAL", cc.SicOpType.legacy, tagTest, litTest)).to.throw();
		expect(() => new cc.SicOperandAddr("$$AQQ", cc.SicOpType.f3, tagTest, litTest)).to.throw();
	});
});

describe("SicFormat1 tests", () => {
	it("handles basic format1 arguments correctly", () => {
		const splitGood = new cc.SicSplit("\tFIX");
		const f1 = new cc.SicFormat1(splitGood);
		expect(f1.bc.mnemonic).to.equal("FIX");
		expect(f1.length()).to.equal(1);
		expect(f1.ready()).to.equal(true);
		expect(f1.toBytes()).to.equal([0xC4]);
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
		expect(f2.toBytes()).to.equal([0xA4, 0x34]);
	});

	it("throws on invalid format2 arguments", () => {
		const splitBad1 = new cc.SicSplit("\tSHIFTL B");
		const splitBad2 = new cc.SicSplit("\tLDA B, 4");
		expect(() => new cc.SicFormat2(splitBad1)).to.throw();
		expect(() => new cc.SicFormat2(splitBad2)).to.throw();
	});
});

describe("SicFormat3 tests", () => {
	const tagTest = new Set<string>();
	const litTest = new Set<number>();
	const tagTab: {[key: string]: number} = {
		VAL: 0x123,
	};
	const dummyLitTab = new cc.SicLitTab();

	it("handles pcrel forward correctly", () => {
		const split = new cc.SicSplit("AAA\tLDX VAL .comment");
		const f3 = new cc.SicFormat3(split, tagTest, litTest);

		expect(tagTest.has("AAA")).to.equal(true);

		expect(f3.length).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x50, tagTab, dummyLitTab);
		expect(f3.ready()).to.equal(true);
		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x123) - (loc(0x50) + len(0x03)) = 0x0D0
		// 0x20 - xbPe(0x20) + disp top 4(0x00)
		// 0xD0 - disp bot 8(0xD0)
		expect(f3.toBytes()).to.equal([0x07, 0x20, 0xD0]);
	});

	it("handles pcrel backward correctly", () => {
		const split = new cc.SicSplit("BBB\tLDX VAL");
		const f3 = new cc.SicFormat3(split, tagTest, litTest);

		expect(tagTest.has("BBB")).to.equal(true);

		expect(f3.length).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x200, tagTab, dummyLitTab);
		expect(f3.ready()).to.equal(true);
		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x123) - (loc(0x200) + len(0x03)) = 0xF23
		// 0x2F - xbPe(0x20) + disp top 4(0x0F)
		// 0x23 - disp bot 8(0x23)
		expect(f3.toBytes()).to.equal([0x07, 0x2F, 0x23]);
	});

	it("handles indirect arguments correctly", () => {
		const split = new cc.SicSplit("\tLDX @VAL");
		const f3 = new cc.SicFormat3(split, tagTest, litTest);

		expect(tagTest.has("VAL")).to.equal(true);

		expect(f3.length).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x200, tagTab, dummyLitTab);
		expect(f3.ready()).to.equal(true);
		// 0x06 - LDX(0x04) + Ni(0x02)
		//     disp = address(0x123) - (loc(0x200) + len(0x03)) = 0xF20
		// 0x2F - xbPe(0x20) + disp top 4(0x0F)
		// 0x23 - disp bot 8(0x23)
		expect(f3.toBytes()).to.equal([0x06, 0x2F, 0x20]);
	});

	it("handles immediate arguments correctly", () => {
		const split = new cc.SicSplit("\tLDX #VAL");
		const f3 = new cc.SicFormat3(split, tagTest, litTest);

		expect(tagTest.has("VAL")).to.equal(true);

		expect(f3.length).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x200, tagTab, dummyLitTab);
		expect(f3.ready()).to.equal(true);
		// 0x06 - LDX(0x04) + nI(0x01)
		//     disp = address(0x123) - (loc(0x200) + len(0x03)) = 0xF20
		// 0x2F - xbPe(0x20) + disp top 4(0x0F)
		// 0x23 - disp bot 8(0x23)
		expect(f3.toBytes()).to.equal([0x05, 0x2F, 0x20]);
	});

	it("handles literal arguments correctly", () => {
		const split = new cc.SicSplit("\tLDX =X'1CD'");
		const split2 = new cc.SicSplit("\tLDA =X'1CE'");
		const split3 = new cc.SicSplit("\tLDB =461"); // 0x1CD
		const litTab = new cc.SicLitTab();

		const ft1 = new cc.SicFormat3(split, tagTest, litTab.pending);
		expect(litTab.pending.has(0x1CD)).to.equal(true);
		const ft2 = new cc.SicFormat3(split2, tagTest, litTab.pending);
		expect(litTab.pending.has(0x1CE)).to.equal(true);
		const ft3 = new cc.SicFormat3(split3, tagTest, litTab.pending);
		expect(litTab.pending.has(0x1CD)).to.equal(true);

		litTab.createOrg(0x2AB);

		expect(ft1.length).to.equal(3);
		expect(ft1.ready()).to.equal(false);
		expect(ft2.length).to.equal(3);
		expect(ft2.ready()).to.equal(false);
		expect(ft3.length).to.equal(3);
		expect(ft3.ready()).to.equal(false);

		ft1.makeReady(0x100, tagTab, litTab);
		expect(ft1.ready()).to.equal(true);
		ft2.makeReady(0x103, tagTab, litTab);
		expect(ft2.ready()).to.equal(true);
		ft3.makeReady(0x106, tagTab, litTab);
		expect(ft3.ready()).to.equal(true);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = location(0x2AB) - (loc(0x100) + length(0x03)) = 0x1A8
		// 0x21 - xbPe(0x20) + disp top 4(0x01)
		// 0xA8 - disp bot 8(0xA8)
		expect(ft1.toBytes()).to.equal([0x07, 0x21, 0xA8]);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = location(0x2AE) - (loc(0x103) + length(0x03)) = 0x1A8
		// 0x21 - xbPe(0x20) + disp top 4(0x01)
		// 0xA8 - disp bot 8(0xA8)
		expect(ft2.toBytes()).to.equal([0x07, 0x21, 0xA8]);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = location(0x2AB) - (loc(0x106) + length(0x03)) = 0x1A2
		// 0x21 - xbPe(0x20) + disp top 4(0x01)
		// 0xA2 - disp bot 8(0xA2)
		expect(ft3.toBytes()).to.equal([0x07, 0x21, 0xA2]);
	});

	it("handles baserel arguments correctly", () => {
		const splitFar = new cc.SicSplit("\tLDX X'9FF'");
		const splitNear = new cc.SicSplit("\tLDX X'200'");
		const base = new cc.SicBase(0x300);
		const f3Far = new cc.SicFormat3(splitFar, tagTest, litTest, base);
		const f3Near = new cc.SicFormat3(splitNear, tagTest, litTest, base);

		expect(f3Far.length).to.equal(3);
		expect(f3Far.ready()).to.equal(false);
		f3Far.makeReady(0x100, tagTab, dummyLitTab);
		expect(f3Far.ready()).to.equal(true);

		expect(f3Near.length).to.equal(3);
		expect(f3Near.ready()).to.equal(false);
		f3Near.makeReady(0x100, tagTab, dummyLitTab);
		expect(f3Near.ready()).to.equal(true);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x9FF) - base(0x300) = 0x6FF
		// 0x49 - xBpe(0x40) + disp top 4(0x06)
		// 0xEF - disp bot 8(0xFF)
		expect(f3Far.toBytes()).to.equal([0x07, 0x46, 0xFF]);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x200) - (loc(0x100) + length(0x03)) = 0x0FD
		// 0x49 - xbPe(0x20) + disp top 4(0x00)
		// 0xEF - disp bot 8(0xFD)
		expect(f3Near.toBytes()).to.equal([0x07, 0x20, 0xFD]);
	});

	it("handles indexed arguments correctly", () => {
		const split = new cc.SicSplit("\tLDX VAL,X");
		const f3 = new cc.SicFormat3(split, tagTest, litTest);

		expect(f3.length).to.equal(3);
		expect(f3.ready()).to.equal(false);

		f3.makeReady(0x50, tagTab, dummyLitTab);
		expect(f3.ready()).to.equal(true);
		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x123) - (loc(0x50) + len(0x03)) = 0x0D0
		// 0xA0 - XbPe(0xA0) + disp top 4(0x00)
		// 0xD0 - disp bot 8(0xD0)
		expect(f3.toBytes()).to.equal([0x07, 0xA0, 0xD0]);
	});

	it("throws on invalid arguments", () => {
		const splitBad1 = new cc.SicSplit("\t+LDA VAL");
		const splitBad2 = new cc.SicSplit("\t*LDA VAL");
		const splitBad3 = new cc.SicSplit("\tLDA A,B");
		const splitBad4 = new cc.SicSplit("\tRMO A");

		expect(() => new cc.SicFormat3(splitBad1, tagTest, litTest)).to.throw();
		expect(() => new cc.SicFormat3(splitBad2, tagTest, litTest)).to.throw();
		expect(() => new cc.SicFormat3(splitBad3, tagTest, litTest)).to.throw();
		expect(() => new cc.SicFormat3(splitBad4, tagTest, litTest)).to.throw();
	});
});

describe("SicFormat4 tests", () => {
	const tagTest = new Set<string>();
	const litTest = new Set<number>();
	const tagTab: {[key: string]: number} = {
		VAL: 0x123,
	};
	const dummyLitTab = new cc.SicLitTab();

	it("handles indirect arguments correctly", () => {
		const split = new cc.SicSplit("\t+LDX @VAL");
		const f4 = new cc.SicFormat4(split, tagTest, litTest);

		expect(tagTest.has("VAL")).to.equal(true);

		expect(f4.length).to.equal(4);
		expect(f4.ready()).to.equal(false);

		f4.makeReady(0x200, tagTab, dummyLitTab);
		expect(f4.ready()).to.equal(true);
		// 0x05 - LDX(0x04) + Ni(0x02)
		//     disp = address(0x123) = 0x00123
		// 0x2F - xbpE(0x10) + disp top 4(0x00)
		// 0x23 - disp bot 8(0x23)
		expect(f4.toBytes()).to.equal([0x06, 0x10, 0x01, 0x23]);
	});

	it("handles immediate arguments correctly", () => {
		const split = new cc.SicSplit("\tLDX #VAL");
		const f4 = new cc.SicFormat4(split, tagTest, litTest);

		expect(tagTest.has("VAL")).to.equal(true);

		expect(f4.length).to.equal(4);
		expect(f4.ready()).to.equal(false);

		f4.makeReady(0x200, tagTab, dummyLitTab);
		expect(f4.ready()).to.equal(true);
		// 0x05 - LDX(0x04) + nI(0x01)
		//     disp = address(0x123)
		// 0x10 - xbpE(0x10) + disp top 4(0x00)
		// 0x01 - disp mid 8(0x01)
		// 0x23 - disp bot 8(0x23)
		expect(f4.toBytes()).to.equal([0x05, 0x10, 0x01, 0x23]);
	});

	it("handles literal arguments correctly", () => {
		const split = new cc.SicSplit("\tLDX =X'1CD'");
		const split2 = new cc.SicSplit("\tLDA =X'1CE'");
		const split3 = new cc.SicSplit("\tLDB =461"); // 0x1CD
		const litTab = new cc.SicLitTab();

		const ft1 = new cc.SicFormat4(split, tagTest, litTab.pending);
		expect(litTab.pending.has(0x1CD)).to.equal(true);
		const ft2 = new cc.SicFormat4(split2, tagTest, litTab.pending);
		expect(litTab.pending.has(0x1CE)).to.equal(true);
		const ft3 = new cc.SicFormat4(split3, tagTest, litTab.pending);
		expect(litTab.pending.has(0x1CD)).to.equal(true);

		litTab.createOrg(0x2AB);

		expect(ft1.length).to.equal(4);
		expect(ft1.ready()).to.equal(false);
		expect(ft2.length).to.equal(4);
		expect(ft2.ready()).to.equal(false);
		expect(ft3.length).to.equal(4);
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
		expect(ft1.toBytes()).to.equal([0x07, 0x10, 0x02, 0xAB]);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = location(0x2AB) = 0x002AE
		// 0x21 - xbpE(0x01) + disp top 4(0x00)
		// 0xA8 - disp mid 8(0x02)
		// 0xAE - disp bot 8(0xAE)
		expect(ft2.toBytes()).to.equal([0x07, 0x10, 0x02, 0xAE]);

		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = location(0x2AB) = 0x002B1
		// 0x21 - xbpE(0x01) + disp top 4(0x00)
		// 0xA8 - disp mid 8(0x02)
		// 0xB1 - disp bot 8(0xB1)
		expect(ft3.toBytes()).to.equal([0x07, 0x10, 0x02, 0xB1]);
	});

	it("handles indexed arguments correctly", () => {
		const split = new cc.SicSplit("\tLDX VAL,X");
		const f4 = new cc.SicFormat4(split, tagTest, litTest);

		expect(f4.length).to.equal(3);
		expect(f4.ready()).to.equal(false);

		f4.makeReady(0x50, tagTab, dummyLitTab);
		expect(f4.ready()).to.equal(true);
		// 0x07 - LDX(0x04) + NI(0x03)
		//     disp = address(0x123) = 0x00123
		// 0x90 - XbpE(0x90) + disp top 4(0x00)
		// 0x01 - disp mid 8(0x01)
		// 0x23 - disp bot 8(0x23)
		expect(f4.toBytes()).to.equal([0x07, 0x90, 0x01, 0x23]);
	});

	it("throws on invalid arguments", () => {
		const splitBad1 = new cc.SicSplit("\tLDA VAL");
		const splitBad2 = new cc.SicSplit("\t*LDA VAL");
		const splitBad3 = new cc.SicSplit("\t+LDA A,B");
		const splitBad4 = new cc.SicSplit("\t+RMO A");

		expect(() => new cc.SicFormat4(splitBad1, tagTest, litTest)).to.throw();
		expect(() => new cc.SicFormat4(splitBad2, tagTest, litTest)).to.throw();
		expect(() => new cc.SicFormat4(splitBad3, tagTest, litTest)).to.throw();
		expect(() => new cc.SicFormat4(splitBad4, tagTest, litTest)).to.throw();
	});
});

describe("SicSpace tests", () => {
	it("handles WORD/BYTE correctly", () => {
		const splitWORD = new cc.SicSplit("\tWORD X'ABCD12'");
		const splitBYTE = new cc.SicSplit("\tBYTE 12");
		const w = new cc.SicSpace(splitWORD);
		const b = new cc.SicSpace(splitBYTE);

		expect(w.length()).to.equal(3);
		expect(w.toBytes()).to.equal([0xAB, 0xCD, 0x12]);
		expect(b.length()).to.equal(1);
		expect(b.toBytes()).to.equal([12]);
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
		"\tLDS =X'ABC',X",
		"VAL EQU X'ABC'",
		"\tUSE FOO",
		"\t+STA =4",
		"\tSTB #ACTION",
		"\tSTT ACTION",
		"\t+STX @ACTION,X",
		"\tSTS #VAL",
		"\tUSE",
		"\tLTORG",
		"ACTION RMO B, A",
		"\tFIX",
		"\t+LDS =4",
		"WORDN WORD X'ABC'",
		"HUGE RESW 1000",
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
		"     \t     \t     \t        \tTEST START 100",
		"00001\t100  \t100  \t020004  \tBACK LDA @4",
		"00002\t103  \t103  \t01      \t\tLDB =4",
		"00003\t106  \t106  \t750004  \t\tLDT #4",
		"00004\t109  \t109  \t070004  \t\tLDX 4",
		"00005\t10C  \t10C  \t6FA014  \t\tLDS =X'1BC',X",
		"     \t     \t     \t        \tVAL\tEQU\tX'1BC'",
		"     \t     \t     \t        \t\tUSE FOO",
		"00006\t10F  \t100  \t0F100120\t\t+STA =4",
		"00007\t113  \t104  \t792010  \t\tSTB #ACTION",
		"00008\t116  \t107  \t872FE7  \t\tSTT BACK",
		"00009\t119  \t10A  \t12900126\t\t+STX @ACTION,X",
		"0000A\t11D  \t10E  \t712003  \t\tSTS #VAL",
		"     \t     \t     \t        \t\tUSE",
		"     \t     \t     \t        \t\tLTORG",
		"0000B\t120  \t10F  \t000004  \tLTORG-WORD X'4'",
		"0000C\t123  \t112  \t0001BC  \tLTORG-WORD X'1BC'",
		"0000D\t126  \t115  \tAC30    \tACTION RMO B,A",
		"     \t129  \t118  \t        \tHUGE RESW 1000",
		"0000E\t1129 \t1118 \t697970  \tWORDB BYTE C'EOF'",
		"     \t     \t     \t        \t\tBASE VAL",
		"0000F\t112C \t111B \t024F6A  \t\tLDA ACTION",
		"     \t     \t     \t        \t\tNOBASE",
		"00010\t112F \t111E \t0201BC  \t\tLDA ACTION",
		"     \t1132 \t1121 \t        \t\tEND TEST",
	];

	it("does the thing", () => {
		const p1 = new cc.SicCompiler(lines);
		expect(p1.lstReport).to.equal(lstExpect);
	});
});
