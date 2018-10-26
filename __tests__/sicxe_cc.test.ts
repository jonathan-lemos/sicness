import * as cc from "../sicxe_cc";

describe("__sic_unsigned tests", () => {
    test("__sic_check_unsigned test", () => {
        expect(() => cc.__sic_check_unsigned(255, 8)).not.toThrow();
        expect(() => cc.__sic_check_unsigned(256, 8)).toThrow();
        expect(() => cc.__sic_check_unsigned(0, 8)).not.toThrow();
        expect(() => cc.__sic_check_unsigned(65535, 16)).not.toThrow();
    });

    test("__sic_make_unsigned test", () => {
        expect(cc.__sic_make_unsigned(255, 8)).toEqual(255);
        expect(() => cc.__sic_make_unsigned(256, 8)).toThrow();
        expect(cc.__sic_make_unsigned(-128, 8)).toEqual(255);
        expect(() => cc.__sic_make_unsigned(-129, 8)).toThrow();
        expect(cc.__sic_make_unsigned(-128, 16)).toEqual(255);
    })
});

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
        expect(ss.args).toEqual("VAL");
    });

    test("Tagged test", () => {
        let ss = new cc.sic_split("TAG\tLDA\tVAL");
        expect(ss.tag).toEqual("TAG");
        expect(ss.op).toEqual("LDA");
        expect(ss.args).toEqual("VAL");
    });

    test("Format 2 test 1", () => {
        let ss = new cc.sic_split("\tRMO\tA,B");
        expect(ss.tag).toEqual("");
        expect(ss.op).toEqual("RMO");
        expect(ss.args).toEqual("A,B");
    });

    test("Format 2 test 2", () => {
        let ss = new cc.sic_split("\tRMO\tA, B");
        expect(ss.tag).toEqual("");
        expect(ss.op).toEqual("RMO");
        expect(ss.args).toEqual("A,B");
    });

    test("Format 1 test", () => {
        let ss = new cc.sic_split("\tFIX");
        expect(ss.tag).toEqual("");
        expect(ss.op).toEqual("FIX");
        expect(ss.args).toEqual("");
    });
});

describe("sic_operand_f3 tests", () => {
    let f3direct = new cc.sic_operand_f3("VAL", false);
    let f3indirect = new cc.sic_operand_f3("@VAL", false);
    let f3immediate = new cc.sic_operand_f3("#VAL", false);
    let f3literal = new cc.sic_operand_f3("#X'10'", false);
    let f3tagged = new cc.sic_operand_f3("TAG,X", false, "TAG");
    let f4 = new cc.sic_operand_f3("VAL", true);

    test("f3 direct", () => {
        expect(f3direct.pcrel).toEqual(true);
        expect(f3direct.baserel).toEqual(false);
        expect(f3direct.indexed).toEqual(false);
        expect(f3direct.type).toEqual(cc.sic_op_type.direct);
        expect(f3direct.val).toEqual("VAL");
        expect(f3direct.format4).toEqual(false);
    });

    test("f3 indirect", () => {
        expect(f3indirect.type).toEqual(cc.sic_op_type.indirect);
    });

    test("f3 immediate", () => {
        expect(f3immediate.type).toEqual(cc.sic_op_type.immediate);
    });

    test("f3 literal", () => {
        expect(f3literal.type).toEqual(cc.sic_op_type.immediate);
        expect(f3literal.val).toEqual(16);
    });

    test("f3 tagged", () => {
        expect(f3tagged.baserel).toEqual(true);
        expect(f3tagged.indexed).toEqual(true);
    });

    test("f3 f4", () => {
        expect(f4.format4).toEqual(true);
    });

    test("f3 throw", () => {
        expect(() => new cc.sic_operand_f3("VAL,VAL2", false)).toThrow();
    })
});

describe("sic_format1 tests", () => {
    
})