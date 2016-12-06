//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

/**
@project JSDraw
@version 5.1.0
@description JSDraw Chemical/Biological Structure Editor
*/

/**
* JSDraw2 namespace
* @namespace scilligence.JSDraw2
*/
JSDraw2 = {};
scilligence.JSDraw2 = JSDraw2;
scilligence.JSDraw3 = JSDraw3 = JSDraw2;

JSDraw2.speedup = { fontsize: 4, gap: 0, disableundo: false, minbondlength: 1 };

/**
* JSDraw Version
* @property scilligence.JSDraw2.version
*/
JSDraw2.version = "JSDraw V5.1.0";

// JSDraw file version
JSDraw2.kFileVersion = "5.0";

/**
* JSDraw Default Options
* @property {dictionay} scilligence.JSDraw2.defaultoptions default Editor options: { skin: "w8" or null, delheteroatom: false, salts: { name: MF, ...}, abbreviations: {}, tlc: {}, popupwidth: number, popupheight: number, popupxdraw: true or false, monocolor: true or false, jdrawpath: "http://server/jdraw/" }
*/
JSDraw2.defaultoptions = {};
JSDraw2.password = {encrypt:true};

JSDraw2.TEXTKEYWORDS = ["°C", "rt", "reflux", "hr", "min", "sec", "psi", "atm", "overnight", "microwave", "Δ"];
JSDraw2.MOLECULETYPES = ["SmallMolecule", "Polymer", "Peptide", "DNA", "RNA", "ADC", "ChemicalReagent"];
JSDraw2.CHIRALITIES = ["Achiral", "Absolute", "Racemic", "Diastereomeric", "Enatiomer R", "Enatiomer S"];

/**
* Predefined Bond Types:
<pre>
JSDraw2.BONDTYPES = {
    UNKNOWN: 0,
    SINGLE: 1,
    DOUBLE: 2,
    TRIPLE: 3,
    DELOCALIZED: 4,
    WEDGE: 5,
    HASH: 6,
    WIGGLY: 7,
    EITHER: 8,
    SINGLEORDOUBLE: 9,
    SINGLEORAROMATIC: 10,
    DOUBLEORAROMATIC: 11,
    QUADRUPLE: 12,
    DUMMY: 13,
    PEPTIDE: 21,
    NUCLEOTIDE: 22,
    DISULFIDE: 23,
    AMIDE: 24
}
</pre>
* @class {static} scilligence.JSDraw2.BONDTYPES
*/
JSDraw2.BONDTYPES = {
    UNKNOWN: 0,
    SINGLE: 1,
    DOUBLE: 2,
    TRIPLE: 3,
    DELOCALIZED: 4,
    WEDGE: 5,
    HASH: 6,
    WIGGLY: 7,
    EITHER: 8,
    SINGLEORDOUBLE: 9,
    SINGLEORAROMATIC: 10,
    DOUBLEORAROMATIC: 11,
    QUADRUPLE: 12,
    DUMMY: 13,
    BOLD: 14,
    BOLDHASH: 15,
    PEPTIDE: 21,
    NUCLEOTIDE: 22,
    DISULFIDE: 23,
    AMIDE: 24
};

JSDraw2.RXNCENTER = {
    NOTCENTER: -1,
    CENTER: 1,
    BREAK: 4,
    CHANGE: 8,
    BREAKANDCHANGE: 12
};

JSDraw2.ALIGN = {
    RIGHT: 0,
    BOTTOM: 1,
    LEFT: 2,
    TOP: 3
};

JSDraw2.BIO = {
    AA: 'AA',
    //BASE: 'BASE',
    ANTIBODY: 'ANTIBODY',
    PROTEIN: "PROTEIN",
    GENE: "GENE",
    DNA: "DNA",
    RNA: "RNA",
    BASE_DNA: "BASEDNA",
    BASE_RNA: "BASERNA"
};

JSDraw2.ANTIBODY = {
    IgG: "IgG",
    Fab: "Fab",
    ScFv: "ScFv"
};


JSDraw2.DNATable = {
    GCT: "A", GCC: "A", GCA: "A", GCG: "A",
    CGT: "R", CGC: "R", CGA: "R", CGG: "R", AGA: "R", AGG: "R",
    AAT: "", AAC: "N",
    GAT: "D", GAC: "D",
    TGT: "C", TGC: "C",
    CAA: "Q", CAG: "Q",
    GAA: "E", GAG: "E",
    GGT: "G", GGC: "G", GGA: "G", GGG: "G",
    CAT: "H", CAC: "H",
    ATT: "I", ATC: "I", ATA: "I",
    TTA: "L", TTG: "L", CTT: "L", CTC: "L", CTA: "L", CTG: "L",
    AAA: "K", AAG: "K",
    ATG: "M",
    TTT: "F", TTC: "F",
    CCT: "P", CCC: "P", CCA: "P", CCG: "P",
    TCT: "S", TCC: "S", TCA: "S", TCG: "S", AGT: "S", AGC: "S",
    ACT: "T", ACC: "T", ACA: "T", ACG: "T",
    TGG: "W",
    TAT: "Y", TAC: "Y",
    GTT: "V", GTC: "V", GTA: "V", GTG: "V",
    ATG: "[",
    TAA: "]", TGA: "]", TAG: "]"
};


JSDraw2.RNATable = {
    GCU: "A", GCC: "A", GCA: "A", GCG: "A",
    CGU: "R", CGC: "R", CGA: "R", CGG: "R", AGA: "R", AGG: "R",
    AAU: "N", AAC: "N",
    GAU: "D", GAC: "D",
    UGU: "C", UGC: "C",
    CAA: "Q", CAG: "Q",
    GAA: "E", GAG: "E",
    GGU: "G", GGC: "G", GGA: "G", GGG: "G",
    CAU: "H", CAC: "H",
    AUU: "I", AUC: "I", AUA: "I",
    AUG: "[",
    UUA: "L", UUG: "L", CUU: "L", CUC: "L", CUA: "L", CUG: "L",
    AAA: "K", AAG: "K",
    AUG: "M",
    UUU: "F", UUC: "F",
    CCU: "P", CCC: "P", CCA: "P", CCG: "P",
    UCU: "S", UCC: "S", UCA: "S", UCG: "S", AGU: "S", AGC: "S",
    ACU: "T", ACC: "T", ACA: "T", ACG: "T",
    UGG: "W",
    UAU: "Y", UAC: "Y",
    GUU: "V", GUC: "V", GUA: "V", GUG: "V",
    UAA: "]", UGA: "]", UAG: "]"
};