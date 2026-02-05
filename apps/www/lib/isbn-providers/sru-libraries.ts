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
    publisher: 'dc.publisher',
    year: 'dc.date',
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

// ===================== LIBRARY HUB DISCOVER (UK) =====================
// Library Hub Discover (JISC) is the UK academic union catalog covering 100+ libraries
// including the British Library. Replaces the defunct explore.bl.uk SRU endpoint.
// The BL's own SRU died after the Oct 2023 cyber-attack; new catalogue.bl.uk has no SRU.
// Docs: https://discover.libraryhub.jisc.ac.uk/support/api/
const libraryhubConfig: SruConfig = {
  code: 'bl',
  name: 'Library Hub Discover (UK)',
  country: 'GB',
  baseUrl: 'https://discover.libraryhub.jisc.ac.uk/sru-api',
  recordSchema: 'marcxml',
  version: '1.1',
  indexes: {
    isbn: 'bath.isbn',
    title: 'dc.title',
    author: 'dc.creator',
    publisher: 'dc.publisher',
    year: 'dc.date',
  },
  sourceUrlPattern: 'https://discover.libraryhub.jisc.ac.uk/search?isbn={isbn}',
}

// ===================== EXPORTS =====================

export const loc = createSruProvider(locConfig)
export const bnf = createSruProvider(bnfConfig)
export const dnb = createSruProvider(dnbConfig)
export const k10plus = createSruProvider(k10plusConfig)
export const sudoc = createSruProvider(sudocConfig)
export const bl = createSruProvider(libraryhubConfig)

// NOT IMPLEMENTED — no usable SRU endpoint:
// KBR (Belgium): Z39.50 only at catalog.kbr.be:9001, no SRU
// KB NL: jsru.kb.nl returns Dublin Core (not MARCXML), ISBN search unreliable
