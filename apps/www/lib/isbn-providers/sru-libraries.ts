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

// ===================== KBR (BELGIUM) =====================
const kbrConfig: SruConfig = {
  code: 'kbr',
  name: 'KBR (Belgium)',
  country: 'BE',
  baseUrl: 'https://opac.kbr.be/sru',
  recordSchema: 'marcxml',
  version: '1.1',
  indexes: {
    isbn: 'bath.isbn',
    title: 'dc.title',
    author: 'dc.creator',
    publisher: 'dc.publisher',
    year: 'dc.date',
  },
  sourceUrlPattern: 'https://opac.kbr.be/LIBRARY/doc/SYRACUSE/{isbn}',
}

// ===================== KONINKLIJKE BIBLIOTHEEK (NETHERLANDS) =====================
const kbConfig: SruConfig = {
  code: 'kb',
  name: 'Koninklijke Bibliotheek',
  country: 'NL',
  baseUrl: 'https://jsru.kb.nl/sru/sru',
  recordSchema: 'marcxml',
  version: '1.1',
  indexes: {
    isbn: 'bath.isbn',
    title: 'dc.title',
    author: 'dc.creator',
    publisher: 'dc.publisher',
    year: 'dc.date',
  },
  sourceUrlPattern: 'https://www.kb.nl/zoeken?isbn={isbn}',
}

// ===================== BRITISH LIBRARY =====================
const blConfig: SruConfig = {
  code: 'bl',
  name: 'British Library',
  country: 'GB',
  baseUrl: 'https://explore.bl.uk/sru',
  recordSchema: 'marcxml',
  version: '1.1',
  indexes: {
    isbn: 'bath.isbn',
    title: 'dc.title',
    author: 'dc.creator',
    publisher: 'dc.publisher',
    year: 'dc.date',
  },
  sourceUrlPattern: 'https://explore.bl.uk/primo_library/libweb/action/search.do?fn=search&vl(freeText0)={isbn}',
}

// ===================== EXPORTS =====================

export const loc = createSruProvider(locConfig)
export const bnf = createSruProvider(bnfConfig)
export const dnb = createSruProvider(dnbConfig)
export const kbr = createSruProvider(kbrConfig)
export const kb = createSruProvider(kbConfig)
export const bl = createSruProvider(blConfig)
