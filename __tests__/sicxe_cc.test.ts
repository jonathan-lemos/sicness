import * as cc from "../sicxe_cc";

describe("sic_bytecode tests", () => {
    test("ADD test", () => {
        let sb = new cc.sic_bytecode("ADD");
        expect(sb.format).toEqual(3);
        expect(sb.opcode).toEqual(0x18);
        expect(sb.mnemonic).toEqual("ADD");
    });

    test("+ADD test", () => {
        let sb = new cc.sic_bytecode("+ADD");
        expect(sb.format).toEqual(4);
        expect(sb.opcode).toEqual(0x18);
        expect(sb.mnemonic).toEqual("ADD");
    });

    test("RMO test", () => {
        let sb = new cc.sic_bytecode("RMO");
        expect(sb.format).toEqual(2);
        expect(sb.opcode).toEqual(0xAC);
        expect(sb.mnemonic).toEqual("RMO");
    });

    test("FIX test", () => {
        let sb = new cc.sic_bytecode("FIX");
        expect(sb.format).toEqual(1);
        expect(sb.opcode).toEqual(0xC4);
        expect(sb.mnemonic).toEqual("FIX");
    });

    test("THROW test (unknown mnemonic)", () => {
        expect(() => new cc.sic_bytecode("NOX")).toThrow();
    });
});

describe("sic_split tests", () => {
    test("Untagged test", () => {
        let ss = new cc.sic_split("\tLDA\tVAL");
        expect(ss.tag).toEqual("");
        expect(ss.op).toEqual("LDA");
        expect(ss.args).toEqual(["VAL"]);
    });

    test("Tagged test", () => {
        let ss = new cc.sic_split("TAG\tLDA\tVAL");
        expect(ss.tag).toEqual("TAG");
        expect(ss.op).toEqual("LDA");
        expect(ss.args).toEqual(["VAL"]);
    });

    test("Format 2 test 1", () => {
        let ss = new cc.sic_split("\tRMO\tA,B");
        expect(ss.tag).toEqual("");
        expect(ss.op).toEqual("RMO");
        expect(ss.args).toEqual(["A", "B"]);
    });

    test("Format 2 test 2", () => {
        let ss = new cc.sic_split("\tRMO\tA, B");
        expect(ss.tag).toEqual("");
        expect(ss.op).toEqual("RMO");
        expect(ss.args).toEqual(["A", "B"]);
    });

    test("Format 1 test", () => {
        let ss = new cc.sic_split("\tFIX");
        expect(ss.tag).toEqual("");
        expect(ss.op).toEqual("FIX");
        expect(ss.args).toEqual([]);
    });
});

describe("sic_directive tests", () => {
    let ssf = new cc.sic_split("\tLDA\tVAL");
    let ssp1 = new cc.sic_split("\tSTART\t1000");
    let ssp2 = new cc.sic_split("\tRESB\t5");
    let ssp3 = new cc.sic_split("\tWORD\tX'ABCD'");
    test("THROW test (not a directive)", () => {
        expect(() => new cc.sic_directive(ssf)).toThrow();
    })

    test("START test", () => {
        let sd = new cc.sic_directive(ssp1);
        expect(cc.sic_directive.isDirective("START")).toEqual(true);
        expect(cc.sic_directive.isOtherDirective("START")).toEqual(true);
        expect(cc.sic_directive.isCodeDirective("START")).toEqual(false);
        expect(sd.arg).toEqual("1000");
        expect(sd.mnemonic).toEqual("START");
        expect(() => sd.length()).toThrow();
        expect(() => sd.toBytecode()).toThrow();
    });

    test("RESW test", () => {
        let sd = new cc.sic_directive(ssp2);
        expect(cc.sic_directive.isDirective("RESB")).toEqual(true);
        expect(cc.sic_directive.isOtherDirective("RESB")).toEqual(false);
        expect(cc.sic_directive.isCodeDirective("RESB")).toEqual(true);
        expect(sd.arg).toEqual("5");
        expect(sd.mnemonic).toEqual("RESB");
        expect(sd.length()).toEqual(5);
        expect(sd.toBytecode()).toEqual([0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
    });

    test("WORD test", () => {
        let sd = new cc.sic_directive(ssp3);
        expect(cc.sic_directive.isDirective("WORD")).toEqual(true);
        expect(cc.sic_directive.isOtherDirective("WORD")).toEqual(false);
        expect(cc.sic_directive.isCodeDirective("WORD")).toEqual(true);
        expect(sd.arg).toEqual("X'ABCD'");
        expect(sd.arg).toEqual("X'ABCD'");
        expect(sd.mnemonic).toEqual("WORD");
        expect(sd.length()).toEqual(3);
        expect(sd.toBytecode()).toEqual([0x00, 0xAB, 0xCD]);
    })
});

describe("sic_operand tests", () => {
    let opReg = new cc.sic_operand(0, cc.sic_op_type.register, false);
    let opDirectIndexed = new cc.sic_operand(64, cc.sic_op_type.direct, true);
    let opImmediate = new cc.sic_operand(0xFFFF0, cc.sic_op_type.immediate, false);
    let opIndirect = new cc.sic_operand(0x2FFF, cc.sic_op_type.indirect, false);
    let opTag = new cc.sic_operand("TAG", cc.sic_op_type.direct, false);
    let opTagNExist = new cc.sic_operand("NEXIST", cc.sic_op_type.direct, false);
    const tag_callback = (tag: string): number => {
        if (tag === "TAG"){
            return 0xABCD;
        }
        throw "tag_callback should not have been called with value " + tag;
    }

    test("parse test", () => {
        expect(cc.sic_operand.parse("A").type).toEqual(cc.sic_op_type.register);
        expect(cc.sic_operand.parse("48").type).toEqual(cc.sic_op_type.direct);
        expect(cc.sic_operand.parse("#48").type).toEqual(cc.sic_op_type.immediate);
        expect(cc.sic_operand.parse("@48").type).toEqual(cc.sic_op_type.indirect);
        expect(cc.sic_operand.parse("@X'40'").type).toEqual(cc.sic_op_type.indirect);
        expect(cc.sic_operand.parse("X'4C'").val).toEqual(76);
    });

    test("getAddr() test", () => {
        expect(opReg.getAddr(tag_callback)).toThrow();
        expect(opDirectIndexed.getAddr(tag_callback)).toEqual(64);
        expect(opImmediate.getAddr(tag_callback)).toEqual(0xFFFF0);
        expect(opIndirect.getAddr(tag_callback)).toEqual(0x2FFF);
        expect(opTag.getAddr(tag_callback)).toEqual(0xABCD);
        expect(() => opTagNExist.getAddr(tag_callback)).toThrow();
    });

    test("isTag() test", () => {
        expect(opTag.isTag()).toEqual(true);
        expect(opImmediate.isTag()).toEqual(false);
    });
});

describe("sic_instruction tests", () => {
    let ss1 = new cc.sic_split("\tRMO\tA,B");
    let ss2 = new cc.sic_split("TAG\tLDA\t@VAL");
    let ss3 = new cc.sic_split("\tFIX");
    let ssF = new cc.sic_split("\tRESW\t10");

    test("format 2 test", () => {
        let si = new cc.sic_instruction(ss1);
        expect(si.op1).not.toBeNull();
        // suppress typescript warning
        if (si.op1 !== null) {
            expect(si.op1.val).toEqual(0);
        }

        expect(si.op2).not.toBeNull();
        // suppress typescript warning
        if (si.op2 !== null){
            expect(si.op2.val).toEqual(3);
        }
    });

    test("format 3 test", () => {
        let si = new cc.sic_instruction(ss2);
        expect(si.op1).not.toBeNull();
        // suppress typescript warning
        if (si.op2 !== null){
            expect(si.op2.val).toEqual("VAL");
        }
        expect(si.op2).toEqual(null);
    });
});