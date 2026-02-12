// SRU Library Configurations
// Each national library uses the same SRU protocol with different endpoints and CQL indexes

import { createSruProvider, type SruConfig } from './sru-provider'

// ===================== LIBRARY OF CONGRESS =====================
const locConfig: SruConfig = {
  code: 'loc',
  name: 'Library of Congress',
  country: 'US',
  baseUrl: 'https://lx2.loc.gov/sru/lcdb',
  recordSchema: 'marcxml',
  version: '1.1',
  indexes: {
    isbn: 'bath.isbn',
    title: 'dc.title',
    author: 'dc.creator',
    // dc.publisher is not supported by LoC SRU — falls back to keyword
    year: 'dc.date',
    keyword: 'cql.anywhere',
  },
  sourceUrlPattern: 'https://lccn.loc.gov/{isbn}',
}

// ===================== BIBLIOTHÈQUE NATIONALE DE FRANCE =====================
const bnfConfig: SruConfig = {
  code: 'bnf',
  name: 'Bibliothèque nationale de France',
  country: 'FR',
  baseUrl: 'https://catalogue.bnf.fr/api/SRU',
  recordSchema: 'unimarcXchange',
  version: '1.2',
  isUnimarc: true,
  indexes: {
    isbn: 'bib.isbn',
    title: 'bib.title',
    author: 'bib.author',
    publisher: 'bib.publisher',
    year: 'bib.publicationdate',
  },
  cqlRelations: {
    isbn: 'adj',
    text: 'all',
  },
  sourceUrlPattern: 'https://catalogue.bnf.fr/rechercher.do?critere1=ISBN&recherche1={isbn}',
}

// ===================== DEUTSCHE NATIONALBIBLIOTHEK =====================
const dnbConfig: SruConfig = {
  code: 'dnb',
  name: 'Deutsche Nationalbibliothek',
  country: 'DE',
  baseUrl: 'https://services.dnb.de/sru/dnb',
  recordSchema: 'MARC21-xml',
  version: '1.1',
  indexes: {
    isbn: 'dnb.num',
    title: 'dnb.tit',
    author: 'dnb.atr',
    publisher: 'dnb.vlg',
    year: 'dnb.jhr',
  },
  sourceUrlPattern: 'https://d-nb.info/{isbn}',
}

// ===================== K10PLUS (GERMANY - GBV/SWB UNION CATALOG) =====================
// K10plus is the merged union catalog of GBV and SWB library consortia
// ~200M holdings across German academic and research libraries
// Used by Zotero as primary source for German-language books
// Docs: https://wiki.k10plus.de/display/K10PLUS/SRU
const k10plusConfig: SruConfig = {
  code: 'k10plus',
  name: 'K10plus (GBV/SWB)',
  country: 'DE',
  baseUrl: 'https://sru.k10plus.de/opac-de-627',
  recordSchema: 'marcxml',
  version: '1.1',
  indexes: {
    isbn: 'pica.isb',
    title: 'pica.tit',
    author: 'pica.per',
    publisher: 'pica.vlg',
    year: 'pica.jah',
  },
  sourceUrlPattern: 'https://kxp.k10plus.de/DB=2.1/CMD?ACT=SRCHA&IKT=1007&TRM={isbn}',
}

// ===================== SUDOC (FRANCE - UNIVERSITY UNION CATALOG) =====================
// SUDOC is the French university union catalog managed by ABES
// ~15M bibliographic records from 3000+ French academic libraries
// Uses UNIMARC format. SRU service launched May 2023.
// Docs: https://abes.fr/guide-utilisation-service-sru-catalogue-sudoc/
const sudocConfig: SruConfig = {
  code: 'sudoc',
  name: 'SUDOC (France)',
  country: 'FR',
  baseUrl: 'https://www.sudoc.abes.fr/cbs/sru/',
  recordSchema: 'unimarc',
  version: '1.1',
  isUnimarc: true,
  indexes: {
    isbn: 'isb',
    title: 'mti',
    author: 'aut',
    publisher: 'edi',
    year: 'apu',
  },
  sourceUrlPattern: 'https://www.sudoc.abes.fr/cbs/DB=2.1/CMD?ACT=SRCHA&IKT=7&TRM={isbn}',
}

// ===================== BNE (SPAIN — BIBLIOTECA NACIONAL DE ESPAÑA) =====================
// BNE runs Ex Libris Alma, providing a standard SRU endpoint with alma.* indexes
// ~15M records covering all Spanish publications (legal deposit since 1716)
// Docs: https://www.bne.es/en/profiles/librarians/record-supply/descarga-sru
const bneConfig: SruConfig = {
  code: 'bne',
  name: 'Biblioteca Nacional de España',
  country: 'ES',
  baseUrl: 'https://catalogo.bne.es/view/sru/34BNE_INST',
  recordSchema: 'marcxml',
  version: '1.2',
  indexes: {
    isbn: 'alma.isbn',
    title: 'alma.title',
    author: 'alma.creator',
    year: 'alma.main_pub_date',
    keyword: 'alma.all_for_ui',
  },
  sourceUrlPattern: 'https://catalogo.bne.es/search?query=alma.isbn={isbn}',
}

// ===================== SLSP/SWISSCOVERY (SWITZERLAND — 500+ LIBRARIES) =====================
// SLSP runs Ex Libris Alma for the Swiss National Library + 500 academic libraries
// Provides access to the combined Swiss union catalog (successor to swissbib)
// Docs: https://slsp.ch/en/metadata/
const slspConfig: SruConfig = {
  code: 'slsp',
  name: 'Swisscovery (SLSP)',
  country: 'CH',
  baseUrl: 'https://swisscovery.slsp.ch/view/sru/41SLSP_NETWORK',
  recordSchema: 'marcxml',
  version: '1.2',
  indexes: {
    isbn: 'alma.isbn',
    title: 'alma.title',
    author: 'alma.creator',
    year: 'alma.main_pub_date',
    keyword: 'alma.all_for_ui',
  },
  sourceUrlPattern: 'https://swisscovery.slsp.ch/search?query=any,contains,{isbn}',
}

// ===================== EXPORTS =====================

export const loc = createSruProvider(locConfig)
export const bnf = createSruProvider(bnfConfig)
export const dnb = createSruProvider(dnbConfig)
export const k10plus = createSruProvider(k10plusConfig)
export const sudoc = createSruProvider(sudocConfig)
export const bne = createSruProvider(bneConfig)
export const slsp = createSruProvider(slspConfig)

// NOT IMPLEMENTED — no usable SRU endpoint:
// KBR (Belgium): Z39.50 only at catalog.kbr.be:9001, no SRU
// KB NL: jsru.kb.nl returns Dublin Core (not MARCXML), ISBN search unreliable
