import * as cc from "../sicxe_cc";

describe("__sic_unsigned tests", () => {
    test("__sic_make_mask tests", () => {
        expect(cc.__sic_make_mask(7)).toEqual(0x7F);
        expect(cc.__sic_make_mask(8)).toEqual(0xFF);
        expect(cc.__sic_make_mask(12)).toEqual(0xFFF);
        expect(cc.__sic_make_mask(16)).toEqual(0xFFFF);
    });

    test("__sic_check_unsigned test", () => {
        expect(() => cc.__sic_check_unsigned(255, 8)).not.toThrow();
        expect(() => cc.__sic_check_unsigned(256, 8)).toThrow();
        expect(() => cc.__sic_check_unsigned(0, 8)).not.toThrow();
        expect(() => cc.__sic_check_unsigned(65535, 16)).not.toThrow();
    });

    test("__sic_make_unsigned test", () => {
        expect(cc.__sic_make_unsigned(0xFF, 8)).toEqual(0xFF);
        expect(() => cc.__sic_make_unsigned(256, 8)).toThrow();
        expect(cc.__sic_make_unsigned(-0x80, 8)).toEqual(0x80);
        expect(() => cc.__sic_make_unsigned(-129, 8)).toThrow();
        expect(cc.__sic_make_unsigned(-0x80, 16)).toEqual(0xFF80);
    });
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
        let ss = new cc.sic_split("\tRMO A,B");
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
    test("f1 test", () => {
        let split_good = new cc.sic_split("\tFIX");
        let f1 = new cc.sic_format1(split_good);
        expect(f1.bc.mnemonic).toEqual("FIX");
        expect(f1.length()).toEqual(1);
        expect(f1.ready()).toEqual(true);
        expect(f1.toBytes()).toEqual([0xC4]);
    });

    test("f1 throw", () => {
        let split_bad1 = new cc.sic_split("\tLDA");
        let split_bad2 = new cc.sic_split("\tFIX A");
        expect(() => new cc.sic_format1(split_bad1)).toThrow();
        expect(() => new cc.sic_format1(split_bad2)).toThrow();
    });
});

describe("sic_format2 tests", () => {
    test("f2 test", () => {
        let split_good = new cc.sic_split("\tSHIFTL B, 4");
        let f2 = new cc.sic_format2(split_good);
        expect(f2.bc.mnemonic).toEqual("SHIFTL");
        expect(f2.length()).toEqual(2);
        expect(f2.ready()).toEqual(true);
        expect(f2.toBytes()).toEqual([0xA4, 0x34])
    });

    test("f2 throw", () => {
        let split_bad1 = new cc.sic_split("\tSHIFTL B");
        let split_bad2 = new cc.sic_split("\tLDA B, 4");
        expect(() => new cc.sic_format2(split_bad1)).toThrow();
        expect(() => new cc.sic_format2(split_bad2)).toThrow();
    });
});

describe("sic_format3 tests", () => {
    let tag_callback = (tag: string): number => {
        if (tag === "VAL"){
            return 0x20;
        }
        throw "tag_callback should not have been called with value: " + tag;
    }

    test("f3 test indexed", () => {
        let split_good1 = new cc.sic_split("\tLDA BTAG,X");
        let f3 = new cc.sic_format3(split_good1, "BTAG");

        expect(f3.bc.opcode).toEqual(0x00);
        expect(f3.bc.mnemonic).toEqual("LDA");
        expect(f3.op.val).toEqual("BTAG");
        expect(f3.op.indexed).toEqual(true);
        expect(f3.op.baserel).toEqual(true);
        expect(f3.op.pcrel).toEqual(false);
        expect(f3.length()).toEqual(3);
        expect(f3.ready()).toEqual(false);

        f3.convertTag(0x10, tag_callback);
        expect(f3.ready()).toEqual(true);
        expect(f3.toBytes()).toEqual([0x03, 0xC0, 0x00]);
    });

    test("f3 test indirect", () => {
        let split_good2 = new cc.sic_split("\tLDA @VAL");
        let f3 = new cc.sic_format3(split_good2);

        expect(f3.bc.opcode).toEqual(0x00);
        expect(f3.op.val).toEqual("VAL");
        expect(f3.op.type).toEqual(cc.sic_op_type.indirect);
        expect(f3.op.pcrel).toEqual(true);
        expect(f3.ready()).toEqual(false);

        f3.convertTag(0x30, tag_callback);
        expect(f3.ready()).toEqual(true);
        expect(f3.op.val).toEqual(0xFF0);
        expect(f3.toBytes()).toEqual([0x02, 0x2F, 0xF0]);
    });

    test("f3 test literal", () => {
        let split_good3 = new cc.sic_split("\tLDA #X'10'");
        let f3 = new cc.sic_format3(split_good3);

        expect(f3.bc.opcode).toEqual(0x00);
        expect(f3.op.val).toEqual(0x10);
        expect(f3.op.type).toEqual(cc.sic_op_type.immediate);
        expect(f3.ready()).toEqual(true);

        expect(f3.toBytes()).toEqual([0x01, 0x00, 0x10]);
    });

    test("f3 test throw", () => {
        let split_bad1 = new cc.sic_split("\tLDA, VAL, X'10'");
        let split_bad2 = new cc.sic_split("\t+LDA VAL");

        expect(() => new cc.sic_format3(split_bad1)).toThrow();
        expect(() => new cc.sic_format3(split_bad2)).toThrow();
    });
});

describe("sic_format4 tests", () => {
    let tag_callback = (tag: string): number => {
        if (tag === "VAL"){
            return 0x20;
        }
        throw "tag_callback should not have been called with value: " + tag;
    }

    test("f4 test indexed", () => {
        let split_good1 = new cc.sic_split("\t+LDA VAL,X");
        let f4 = new cc.sic_format4(split_good1);

        expect(f4.bc.opcode).toEqual(0x00);
        expect(f4.bc.mnemonic).toEqual("LDA");
        expect(f4.op.val).toEqual("VAL");
        expect(f4.op.pcrel).toEqual(false);
        expect(f4.op.baserel).toEqual(false);
        expect(f4.op.indexed).toEqual(true);
        expect(f4.length()).toEqual(4);
        expect(f4.ready()).toEqual(false);

        f4.convertTag(0x10, tag_callback);
        expect(f4.op.val).toEqual(0x20);
        expect(f4.ready()).toEqual(true);
        expect(f4.toBytes()).toEqual([0x03, 0x90, 0x00, 0x20]);
    });

    test("f4 test indirect", () => {
        let split_good2 = new cc.sic_split("\t+LDA @VAL");
        let f4 = new cc.sic_format4(split_good2);

        expect(f4.bc.opcode).toEqual(0x00);
        expect(f4.op.val).toEqual("VAL");
        expect(f4.op.type).toEqual(cc.sic_op_type.indirect);
        expect(f4.ready()).toEqual(false);

        f4.convertTag(0x10, tag_callback);
        expect(f4.ready()).toEqual(true);
        expect(f4.op.val).toEqual(0x20);
        expect(f4.toBytes()).toEqual([0x02, 0x10, 0x00, 0x20]);
    });

    test("f4 test literal", () => {
        let split_good3 = new cc.sic_split("\t+LDA #10");
        let f4 = new cc.sic_format4(split_good3);

        expect(f4.bc.opcode).toEqual(0x00);
        expect(f4.op.val).toEqual(10);
        expect(f4.op.type).toEqual(cc.sic_op_type.immediate);
        expect(f4.ready()).toEqual(true);

        expect(f4.toBytes()).toEqual([0x01, 0x10, 0x00, 0x0A]);
    });

    test("f4 test throw", () => {
        let split_bad1 = new cc.sic_split("\t+LDA, VAL, 10");
        let split_bad2 = new cc.sic_split("\tLDA VAL");

        expect(() => new cc.sic_format4(split_bad1)).toThrow();
        expect(() => new cc.sic_format4(split_bad2)).toThrow();
    });
});

describe("sic_space tests", () => {
    test("RESW/RESB test", () => {
        let split_resw = new cc.sic_split("\tRESW 2");
        let split_resb = new cc.sic_split("\tRESB X'03'");
        let sw = new cc.sic_space(split_resw);
        let sb = new cc.sic_space(split_resb);

        expect(sw.length()).toEqual(6);
        expect(sw.toBytes()).toEqual([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
        expect(sb.length()).toEqual(0x3);
        expect(sb.toBytes()).toEqual([0xFF, 0xFF, 0xFF]);
    });

    test("WORD/BYTE test", () => {
        let split_word = new cc.sic_split("\tWORD X'ABCD12'");
        let split_byte = new cc.sic_split("\tBYTE 12");
        let w = new cc.sic_space(split_word);
        let b = new cc.sic_space(split_byte);

        expect(w.length()).toEqual(3);
        expect(w.toBytes()).toEqual([0xAB, 0xCD, 0x12]);
        expect(b.length()).toEqual(1);
        expect(b.toBytes()).toEqual([12]);
    });

    test("space fail tests", () => {
        let split_fail1 = new cc.sic_split("\tLDA 4");
        let split_fail2 = new cc.sic_split("\tWORD");
        let split_fail3 = new cc.sic_split("\tRESW 1,2");

        expect(() => new cc.sic_space(split_fail1)).toThrow();
        expect(() => new cc.sic_space(split_fail2)).toThrow();
        expect(() => new cc.sic_space(split_fail3)).toThrow();
    });
});

describe("pass1 tests", () => {
    let lines = [
        "TEST\tSTART\tA",
        "\tLDA #4",
        "ACTION\tRMO B, A",
        "\tFIX",
        "\t+LDS #X'ABCDE'",
        "NUMBER\tRESW 5",
        "\tSTA NUMBER",
        "\tEND TEST"
    ];
    let p1 = new cc.sic_pass1(lines);

    test("loc test", () => {
        expect(p1.lines.length).toEqual(6);
        //        LDA #4
        expect(p1.lines[0].loc).toEqual(0xA);
        // ACTION RMO A, B
        expect(p1.lines[1].loc).toEqual(0xA + 3);
        //        FIX
        expect(p1.lines[2].loc).toEqual(0xA + 3 + 2);
        //        +LDS #X'ABCDE'
        expect(p1.lines[3].loc).toEqual(0xA + 3 + 2 + 1);
        // NUMBER RESW 5
        expect(p1.lines[4].loc).toEqual(0xA + 3 + 2 + 1 + 4);
        //        STA NUMBER
        expect(p1.lines[5].loc).toEqual(0xA + 3 + 2 + 1 + 4 + 15);
    });

    test("instr test", () => {
        expect((<cc.sic_format3>p1.lines[0].instr).bc.mnemonic).toEqual("LDA");
        expect((<cc.sic_space>p1.lines[4].instr).mnemonic).toEqual("RESW");
        expect((<cc.sic_format3>p1.lines[5].instr).op.pcrel).toEqual(true);
    });

    test("tags test", () => {
        expect(p1.tags.getTagLoc(p1.lines, "ACTION")).toEqual(0x0A + 3);
        expect(p1.tags.getTagLoc(p1.lines, "NUMBER")).toEqual(0x0A + 3 + 2 + 1 + 4);
        expect(() => p1.tags.getTagLoc(p1.lines, "NOEX")).toThrow();
    });

    test("toBytes() test", () => {
        let bytes = p1.toBytes();
        expect(bytes[0]).toEqual([0x01, 0x00, 0x04]);
        expect(bytes[1]).toEqual([0xAC, 0x30]);
        expect(bytes[2]).toEqual([0xC4]);
        expect(bytes[3]).toEqual([0x6D, 0x1A, 0xBC, 0xDE]);
        expect(bytes[4]).toEqual([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
        expect(bytes[5]).toEqual([0x0F, 0x2F, 0xF1]);
    });

    test("toLst() test", () => {
        let lst = p1.toLst();
        expect(lst[0].loc).toEqual("");
        expect(lst[0].bytecode).toEqual("");
        expect(lst[0].instr).toEqual(lines[0]);

        expect(lst[1].loc).toEqual("A");
        expect(lst[1].bytecode).toEqual("010004");
        expect(lst[1].instr).toEqual(lines[1]);

        expect(lst[2].loc).toEqual("D");
        expect(lst[2].bytecode).toEqual("AC30");
        expect(lst[2].instr).toEqual(lines[2]);

        expect(lst[3].loc).toEqual("F");
        expect(lst[3].bytecode).toEqual("C4");
        expect(lst[3].instr).toEqual(lines[3]);

        expect(lst[4].loc).toEqual("10");
        expect(lst[4].bytecode).toEqual("6D1ABCDE");
        expect(lst[4].instr).toEqual(lines[4]);

        expect(lst[5].loc).toEqual("14");
        expect(lst[5].bytecode).toEqual("");
        expect(lst[5].instr).toEqual(lines[5]);

        expect(lst[6].loc).toEqual("23");
        expect(lst[6].bytecode).toEqual("0F2FF1");
        expect(lst[6].instr).toEqual(lines[6]);
    });
});