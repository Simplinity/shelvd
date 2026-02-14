// Catalog Entry Translations
// 13 languages for Trade Catalog and ISBD Formal modes
// Source: CATALOG_ENTRY_SPEC.md

export type CatalogLanguage =
  | 'en' | 'fr' | 'de' | 'nl'
  | 'es' | 'pt' | 'it'
  | 'sv' | 'da' | 'no'
  | 'be-fr' | 'be-nl'
  | 'la'

export type CatalogMode = 'trade' | 'isbd'

export const CATALOG_LANGUAGES: { code: CatalogLanguage; label: string; flag: string; association: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧', association: 'ABA / ABAA' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', association: 'SLAM' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', association: 'VDA' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱', association: 'NVvA' },
  { code: 'es', label: 'Español', flag: '🇪🇸', association: 'AILA' },
  { code: 'pt', label: 'Português', flag: '🇵🇹', association: 'ALAFARQ' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', association: 'ALAI' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪', association: 'SVAF' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰', association: 'ABF' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴', association: 'NABF' },
  { code: 'be-fr', label: 'Belgique (FR)', flag: '🇧🇪', association: 'CLAM/BBA' },
  { code: 'be-nl', label: 'België (NL)', flag: '🇧🇪', association: 'CLAM/BBA' },
  { code: 'la', label: 'Latina', flag: '🏛️', association: '—' },
]

// ─── Fixed Labels ───────────────────────────────────────────────────
// Used in both Trade and ISBD modes for section headers and annotations

type LabelKey =
  | 'bibliography' | 'provenance' | 'condition' | 'illustrations'
  | 'signatures' | 'original_title' | 'first_edition' | 'printed_by'
  | 'signed' | 'dust_jacket' | 'dedication' | 'colophon'
  | 'paper' | 'edges' | 'endpapers' | 'text_block'
  | 'enclosure' | 'binding'

export const LABELS: Record<CatalogLanguage, Record<LabelKey, string>> = {
  en: {
    bibliography: 'Bibliography',
    provenance: 'Provenance',
    condition: 'Condition',
    illustrations: 'Illustrations',
    signatures: 'Signatures',
    original_title: 'Original title',
    first_edition: 'First edition',
    printed_by: 'Printed by',
    signed: 'Signed',
    dust_jacket: 'In dust jacket',
    dedication: 'Dedication',
    colophon: 'Colophon',
    paper: 'Paper',
    edges: 'Edges',
    endpapers: 'Endpapers',
    text_block: 'Text block',
    enclosure: 'Protective enclosure',
    binding: 'Binding',
  },
  fr: {
    bibliography: 'Bibliographie',
    provenance: 'Provenance',
    condition: 'État',
    illustrations: 'Illustrations',
    signatures: 'Signatures',
    original_title: 'Titre original',
    first_edition: 'Édition originale',
    printed_by: 'Imprimé par',
    signed: 'Signé',
    dust_jacket: 'Sous jaquette',
    dedication: 'Dédicace',
    colophon: 'Colophon',
    paper: 'Papier',
    edges: 'Tranches',
    endpapers: 'Gardes',
    text_block: "Corps d'ouvrage",
    enclosure: 'Étui',
    binding: 'Reliure',
  },
  de: {
    bibliography: 'Bibliographie',
    provenance: 'Provenienz',
    condition: 'Zustand',
    illustrations: 'Illustrationen',
    signatures: 'Signaturen',
    original_title: 'Originaltitel',
    first_edition: 'Erste Ausgabe',
    printed_by: 'Gedruckt von',
    signed: 'Signiert',
    dust_jacket: 'Mit Schutzumschlag',
    dedication: 'Widmung',
    colophon: 'Kolophon',
    paper: 'Papier',
    edges: 'Schnitt',
    endpapers: 'Vorsätze',
    text_block: 'Buchblock',
    enclosure: 'Schuber',
    binding: 'Einband',
  },
  nl: {
    bibliography: 'Bibliografie',
    provenance: 'Herkomst',
    condition: 'Conditie',
    illustrations: 'Illustraties',
    signatures: 'Signaturen',
    original_title: 'Oorspronkelijke titel',
    first_edition: 'Eerste druk',
    printed_by: 'Gedrukt door',
    signed: 'Gesigneerd',
    dust_jacket: 'Met stofomslag',
    dedication: 'Opdracht',
    colophon: 'Colofon',
    paper: 'Papier',
    edges: 'Snede',
    endpapers: 'Schutbladen',
    text_block: 'Boekblok',
    enclosure: 'Foedraal',
    binding: 'Band',
  },
  es: {
    bibliography: 'Bibliografía',
    provenance: 'Procedencia',
    condition: 'Estado',
    illustrations: 'Ilustraciones',
    signatures: 'Signaturas',
    original_title: 'Título original',
    first_edition: 'Primera edición',
    printed_by: 'Impreso por',
    signed: 'Firmado',
    dust_jacket: 'Con sobrecubierta',
    dedication: 'Dedicatoria',
    colophon: 'Colofón',
    paper: 'Papel',
    edges: 'Cortes',
    endpapers: 'Guardas',
    text_block: 'Cuerpo del libro',
    enclosure: 'Estuche',
    binding: 'Encuadernación',
  },
  pt: {
    bibliography: 'Bibliografia',
    provenance: 'Proveniência',
    condition: 'Estado',
    illustrations: 'Ilustrações',
    signatures: 'Signaturas',
    original_title: 'Título original',
    first_edition: 'Primeira edição',
    printed_by: 'Impresso por',
    signed: 'Assinado',
    dust_jacket: 'Com sobrecapa',
    dedication: 'Dedicatória',
    colophon: 'Cólofon',
    paper: 'Papel',
    edges: 'Cortes',
    endpapers: 'Guardas',
    text_block: 'Corpo do livro',
    enclosure: 'Estojo',
    binding: 'Encadernação',
  },
  it: {
    bibliography: 'Bibliografia',
    provenance: 'Provenienza',
    condition: 'Condizioni',
    illustrations: 'Illustrazioni',
    signatures: 'Segnature',
    original_title: 'Titolo originale',
    first_edition: 'Prima edizione',
    printed_by: 'Stampato da',
    signed: 'Firmato',
    dust_jacket: 'Con sovraccoperta',
    dedication: 'Dedica',
    colophon: 'Colophon',
    paper: 'Carta',
    edges: 'Tagli',
    endpapers: 'Controguardie',
    text_block: 'Corpo del libro',
    enclosure: 'Custodia',
    binding: 'Legatura',
  },
  sv: {
    bibliography: 'Bibliografi',
    provenance: 'Proveniens',
    condition: 'Skick',
    illustrations: 'Illustrationer',
    signatures: 'Signaturer',
    original_title: 'Originaltitel',
    first_edition: 'Första upplagan',
    printed_by: 'Tryckt av',
    signed: 'Signerad',
    dust_jacket: 'Med skyddsomslag',
    dedication: 'Dedikation',
    colophon: 'Kolofon',
    paper: 'Papper',
    edges: 'Snitt',
    endpapers: 'Försättsblad',
    text_block: 'Bokblock',
    enclosure: 'Kassett',
    binding: 'Band',
  },
  da: {
    bibliography: 'Bibliografi',
    provenance: 'Proveniens',
    condition: 'Tilstand',
    illustrations: 'Illustrationer',
    signatures: 'Signaturer',
    original_title: 'Originaltitel',
    first_edition: 'Første udgave',
    printed_by: 'Trykt af',
    signed: 'Signeret',
    dust_jacket: 'Med smudsomslag',
    dedication: 'Dedikation',
    colophon: 'Kolofon',
    paper: 'Papir',
    edges: 'Snit',
    endpapers: 'Forsatsblad',
    text_block: 'Bogblok',
    enclosure: 'Kassette',
    binding: 'Bind',
  },
  no: {
    bibliography: 'Bibliografi',
    provenance: 'Proveniens',
    condition: 'Tilstand',
    illustrations: 'Illustrasjoner',
    signatures: 'Signaturer',
    original_title: 'Originaltittel',
    first_edition: 'Første utgave',
    printed_by: 'Trykt av',
    signed: 'Signert',
    dust_jacket: 'Med smussomslag',
    dedication: 'Dedikasjon',
    colophon: 'Kolofon',
    paper: 'Papir',
    edges: 'Snitt',
    endpapers: 'Forsatsblad',
    text_block: 'Bokblokk',
    enclosure: 'Kassett',
    binding: 'Bind',
  },
  'be-fr': {
    bibliography: 'Bibliographie',
    provenance: 'Provenance',
    condition: 'État',
    illustrations: 'Illustrations',
    signatures: 'Signatures',
    original_title: 'Titre original',
    first_edition: 'Édition originale',
    printed_by: 'Imprimé par',
    signed: 'Signé',
    dust_jacket: 'Sous jaquette',
    dedication: 'Dédicace',
    colophon: 'Colophon',
    paper: 'Papier',
    edges: 'Tranches',
    endpapers: 'Gardes',
    text_block: "Corps d'ouvrage",
    enclosure: 'Étui',
    binding: 'Reliure',
  },
  'be-nl': {
    bibliography: 'Bibliografie',
    provenance: 'Herkomst',
    condition: 'Conditie',
    illustrations: 'Illustraties',
    signatures: 'Signaturen',
    original_title: 'Oorspronkelijke titel',
    first_edition: 'Eerste druk',
    printed_by: 'Gedrukt door',
    signed: 'Gesigneerd',
    dust_jacket: 'Met stofomslag',
    dedication: 'Opdracht',
    colophon: 'Colofon',
    paper: 'Papier',
    edges: 'Snede',
    endpapers: 'Schutbladen',
    text_block: 'Boekblok',
    enclosure: 'Foedraal',
    binding: 'Band',
  },
  la: {
    bibliography: 'Bibl.',
    provenance: 'Prov.',
    condition: 'Stat.',
    illustrations: 'Ill.',
    signatures: 'Sign.',
    original_title: 'Tit. orig.',
    first_edition: 'Ed. pr.',
    printed_by: 'Typis',
    signed: 'Manu subscr.',
    dust_jacket: '—',
    dedication: 'Dedic.',
    colophon: 'Coloph.',
    paper: 'Charta',
    edges: 'Marg.',
    endpapers: '—',
    text_block: '—',
    enclosure: 'Theca',
    binding: 'Lig.',
  },
}

// ─── Abbreviations for Physical Description ─────────────────────────

type AbbrKey = 'pages' | 'leaves' | 'volumes' | 'plates' | 'illustrations_abbr' | 'columns' | 'unnumbered'

export const ABBREVIATIONS: Record<CatalogLanguage, Record<AbbrKey, string>> = {
  en:      { pages: 'p.',   leaves: 'ff.',  volumes: 'vol.', plates: 'pl.',   illustrations_abbr: 'ill.',  columns: 'col.',  unnumbered: 'n.p.' },
  fr:      { pages: 'p.',   leaves: 'ff.',  volumes: 'vol.', plates: 'pl.',   illustrations_abbr: 'ill.',  columns: 'col.',  unnumbered: 'n.ch.' },
  de:      { pages: 'S.',   leaves: 'Bl.',  volumes: 'Bd.',  plates: 'Taf.',  illustrations_abbr: 'Ill.',  columns: 'Sp.',   unnumbered: 'ungez.' },
  nl:      { pages: 'p.',   leaves: 'bl.',  volumes: 'dl.',  plates: 'pl.',   illustrations_abbr: 'ill.',  columns: 'kol.',  unnumbered: 'ongep.' },
  es:      { pages: 'p.',   leaves: 'h.',   volumes: 'vol.', plates: 'láms.', illustrations_abbr: 'il.',   columns: 'col.',  unnumbered: 's.p.' },
  pt:      { pages: 'p.',   leaves: 'ff.',  volumes: 'vol.', plates: 'ests.', illustrations_abbr: 'il.',   columns: 'col.',  unnumbered: 's.p.' },
  it:      { pages: 'pp.',  leaves: 'cc.',  volumes: 'vol.', plates: 'tavv.', illustrations_abbr: 'ill.',  columns: 'coll.', unnumbered: 'n.n.' },
  sv:      { pages: 's.',   leaves: 'bl.',  volumes: 'bd.',  plates: 'pl.',   illustrations_abbr: 'ill.',  columns: 'kol.',  unnumbered: 'onr.' },
  da:      { pages: 's.',   leaves: 'bl.',  volumes: 'bd.',  plates: 'pl.',   illustrations_abbr: 'ill.',  columns: 'kol.',  unnumbered: 'upag.' },
  no:      { pages: 's.',   leaves: 'bl.',  volumes: 'bd.',  plates: 'pl.',   illustrations_abbr: 'ill.',  columns: 'kol.',  unnumbered: 'upag.' },
  'be-fr': { pages: 'p.',   leaves: 'ff.',  volumes: 'vol.', plates: 'pl.',   illustrations_abbr: 'ill.',  columns: 'col.',  unnumbered: 'n.ch.' },
  'be-nl': { pages: 'p.',   leaves: 'bl.',  volumes: 'dl.',  plates: 'pl.',   illustrations_abbr: 'ill.',  columns: 'kol.',  unnumbered: 'ongep.' },
  la:      { pages: 'pp.',  leaves: 'ff.',  volumes: 'vol.', plates: 'tab.',  illustrations_abbr: 'fig.',  columns: 'coll.', unnumbered: 's.n.' },
}

// ─── Contributor Role Phrases (Trade Mode) ──────────────────────────
// How each role is phrased in a trade catalog entry.
// Format: the phrase precedes or follows the contributor name.
// Roles with 'prefix: true' appear as "phrase Name" (e.g. "illustrated by X")
// Roles with 'prefix: false' appear as "Name, phrase" (e.g. "X, co-author")

type RoleKey =
  | 'author' | 'co_author' | 'editor' | 'translator' | 'illustrator'
  | 'photographer' | 'cover_designer' | 'engraver' | 'woodcutter' | 'etcher'
  | 'lithographer' | 'calligrapher' | 'cartographer'
  | 'foreword' | 'introduction' | 'preface' | 'afterword'

export const CONTRIBUTOR_ROLES: Record<CatalogLanguage, Record<RoleKey, string>> = {
  en: {
    author: 'by', co_author: ', co-author', editor: 'edited by', translator: 'translated by',
    illustrator: 'illustrated by', photographer: 'photographs by', cover_designer: 'cover by',
    engraver: 'engraved by', woodcutter: 'woodcuts by', etcher: 'etchings by',
    lithographer: 'lithographs by', calligrapher: 'calligraphy by', cartographer: 'maps by',
    foreword: 'foreword by', introduction: 'introduction by', preface: 'preface by', afterword: 'afterword by',
  },
  fr: {
    author: 'par', co_author: ', co-auteur', editor: 'sous la direction de', translator: 'traduit par',
    illustrator: 'illustré par', photographer: 'photographies de', cover_designer: 'couverture de',
    engraver: 'gravé par', woodcutter: 'bois gravés par', etcher: 'eaux-fortes de',
    lithographer: 'lithographies de', calligrapher: 'calligraphie de', cartographer: 'cartes de',
    foreword: 'préface de', introduction: 'introduction de', preface: 'avant-propos de', afterword: 'postface de',
  },
  de: {
    author: 'von', co_author: ', Mitautor', editor: 'herausgegeben von', translator: 'übersetzt von',
    illustrator: 'illustriert von', photographer: 'Fotografien von', cover_designer: 'Umschlag von',
    engraver: 'gestochen von', woodcutter: 'Holzschnitte von', etcher: 'Radierungen von',
    lithographer: 'Lithographien von', calligrapher: 'Kalligraphie von', cartographer: 'Karten von',
    foreword: 'Geleitwort von', introduction: 'Einleitung von', preface: 'Vorwort von', afterword: 'Nachwort von',
  },
  nl: {
    author: 'door', co_author: ', co-auteur', editor: 'onder redactie van', translator: 'vertaald door',
    illustrator: 'geïllustreerd door', photographer: "foto's door", cover_designer: 'omslagontwerp door',
    engraver: 'gegraveerd door', woodcutter: 'houtsneden door', etcher: 'etsen door',
    lithographer: "litho's door", calligrapher: 'kalligrafie door', cartographer: 'kaarten door',
    foreword: 'voorwoord door', introduction: 'inleiding door', preface: 'ten geleide door', afterword: 'nawoord door',
  },
  es: {
    author: 'por', co_author: ', coautor', editor: 'edición de', translator: 'traducido por',
    illustrator: 'ilustrado por', photographer: 'fotografías de', cover_designer: 'cubierta de',
    engraver: 'grabado por', woodcutter: 'xilografías de', etcher: 'aguafuertes de',
    lithographer: 'litografías de', calligrapher: 'caligrafía de', cartographer: 'mapas de',
    foreword: 'prólogo de', introduction: 'introducción de', preface: 'prefacio de', afterword: 'epílogo de',
  },
  pt: {
    author: 'por', co_author: ', co-autor', editor: 'edição de', translator: 'traduzido por',
    illustrator: 'ilustrado por', photographer: 'fotografias de', cover_designer: 'capa de',
    engraver: 'gravado por', woodcutter: 'xilogravuras de', etcher: 'águas-fortes de',
    lithographer: 'litografias de', calligrapher: 'caligrafia de', cartographer: 'mapas de',
    foreword: 'prefácio de', introduction: 'introdução de', preface: 'prefácio de', afterword: 'posfácio de',
  },
  it: {
    author: 'di', co_author: ', coautore', editor: 'a cura di', translator: 'tradotto da',
    illustrator: 'illustrato da', photographer: 'fotografie di', cover_designer: 'copertina di',
    engraver: 'inciso da', woodcutter: 'xilografie di', etcher: 'acqueforti di',
    lithographer: 'litografie di', calligrapher: 'calligrafia di', cartographer: 'carte di',
    foreword: 'premessa di', introduction: 'introduzione di', preface: 'prefazione di', afterword: 'postfazione di',
  },
  sv: {
    author: 'av', co_author: ', medförfattare', editor: 'redigerad av', translator: 'översatt av',
    illustrator: 'illustrerad av', photographer: 'fotografier av', cover_designer: 'omslag av',
    engraver: 'graverad av', woodcutter: 'träsnitt av', etcher: 'etsningar av',
    lithographer: 'litografier av', calligrapher: 'kalligrafi av', cartographer: 'kartor av',
    foreword: 'förord av', introduction: 'inledning av', preface: 'företal av', afterword: 'efterord av',
  },
  da: {
    author: 'af', co_author: ', medforfatter', editor: 'redigeret af', translator: 'oversat af',
    illustrator: 'illustreret af', photographer: 'fotografier af', cover_designer: 'omslag af',
    engraver: 'graveret af', woodcutter: 'træsnit af', etcher: 'raderinger af',
    lithographer: 'litografier af', calligrapher: 'kalligrafi af', cartographer: 'kort af',
    foreword: 'forord af', introduction: 'indledning af', preface: 'forord af', afterword: 'efterskrift af',
  },
  no: {
    author: 'av', co_author: ', medforfatter', editor: 'redigert av', translator: 'oversatt av',
    illustrator: 'illustrert av', photographer: 'fotografier av', cover_designer: 'omslag av',
    engraver: 'gravert av', woodcutter: 'tresnitt av', etcher: 'raderinger av',
    lithographer: 'litografier av', calligrapher: 'kalligrafi av', cartographer: 'kart av',
    foreword: 'forord av', introduction: 'innledning av', preface: 'forord av', afterword: 'etterord av',
  },
  'be-fr': {
    author: 'par', co_author: ', co-auteur', editor: 'sous la direction de', translator: 'traduit par',
    illustrator: 'illustré par', photographer: 'photographies de', cover_designer: 'couverture de',
    engraver: 'gravé par', woodcutter: 'bois gravés par', etcher: 'eaux-fortes de',
    lithographer: 'lithographies de', calligrapher: 'calligraphie de', cartographer: 'cartes de',
    foreword: 'préface de', introduction: 'introduction de', preface: 'avant-propos de', afterword: 'postface de',
  },
  'be-nl': {
    author: 'door', co_author: ', co-auteur', editor: 'onder redactie van', translator: 'vertaald door',
    illustrator: 'geïllustreerd door', photographer: "foto's door", cover_designer: 'omslagontwerp door',
    engraver: 'gegraveerd door', woodcutter: 'houtsneden door', etcher: 'etsen door',
    lithographer: "litho's door", calligrapher: 'kalligrafie door', cartographer: 'kaarten door',
    foreword: 'voorwoord door', introduction: 'inleiding door', preface: 'ten geleide door', afterword: 'nawoord door',
  },
  la: {
    author: 'auct.', co_author: '', editor: 'ed.', translator: 'interpr.',
    illustrator: 'pinx.', photographer: '', cover_designer: '',
    engraver: 'sculps.', woodcutter: 'sculps.', etcher: 'sculps.',
    lithographer: '', calligrapher: 'scrips.', cartographer: '',
    foreword: 'praef.', introduction: 'introd.', preface: 'praef.', afterword: '',
  },
}

// ─── Cover Type Translations ────────────────────────────────────────
// Maps database cover_type values to display strings per language.
// Part 1: Softcover, Hardcover, Full bindings (leather/calf/vellum/morocco/faux)

export const COVER_TYPES: Record<string, Record<CatalogLanguage, string>> = {
  // ── Softcover group ──
  softcover:         { en: 'Softcover', fr: 'Broché', de: 'Broschur', nl: 'Softcover', es: 'Rústica', pt: 'Brochura', it: 'Brossura', sv: 'Häftad', da: 'Hæftet', no: 'Heftet', 'be-fr': 'Broché', 'be-nl': 'Softcover', la: '—' },
  softcover_dj:      { en: 'Softcover, dust jacket', fr: 'Broché, jaquette', de: 'Broschur, Schutzumschlag', nl: 'Softcover, stofomslag', es: 'Rústica, sobrecubierta', pt: 'Brochura, sobrecapa', it: 'Brossura, sovraccoperta', sv: 'Häftad, skyddsomslag', da: 'Hæftet, smudsomslag', no: 'Heftet, smussomslag', 'be-fr': 'Broché, jaquette', 'be-nl': 'Softcover, stofomslag', la: '—' },
  original_wraps:    { en: 'Original wrappers', fr: "Couverture d'éditeur", de: 'Originalbroschur', nl: 'Originele omslag', es: 'Cubiertas originales', pt: 'Brochura original', it: 'Brossura editoriale', sv: 'Originalhäfte', da: 'Originalt omslag', no: 'Originalt omslag', 'be-fr': "Couverture d'éditeur", 'be-nl': 'Originele omslag', la: 'Lig. orig.' },
  printed_wrappers:  { en: 'Printed wrappers', fr: 'Couverture imprimée', de: 'Bedruckter Umschlag', nl: 'Bedrukte omslag', es: 'Cubiertas impresas', pt: 'Capas impressas', it: 'Copertina stampata', sv: 'Tryckta omslag', da: 'Trykt omslag', no: 'Trykt omslag', 'be-fr': 'Couverture imprimée', 'be-nl': 'Bedrukte omslag', la: '—' },
  stiff_wraps:       { en: 'Stiff wrappers', fr: 'Cartonnage souple', de: 'Steifbroschur', nl: 'Stijve omslag', es: 'Cubiertas rígidas', pt: 'Brochura rígida', it: 'Brossura rigida', sv: 'Styvt omslag', da: 'Stift omslag', no: 'Stivt omslag', 'be-fr': 'Cartonnage souple', 'be-nl': 'Stijve omslag', la: '—' },

  // ── Hardcover group ──
  hardcover:         { en: 'Hardcover', fr: 'Relié', de: 'Gebunden', nl: 'Hardcover', es: 'Cartoné', pt: 'Capa dura', it: 'Cartonato', sv: 'Inbunden', da: 'Indbundet', no: 'Innbundet', 'be-fr': 'Relié', 'be-nl': 'Hardcover', la: '—' },
  hardcover_dj:      { en: 'Hardcover, dust jacket', fr: 'Relié, jaquette', de: 'Gebunden, Schutzumschlag', nl: 'Hardcover, stofomslag', es: 'Cartoné, sobrecubierta', pt: 'Capa dura, sobrecapa', it: 'Cartonato, sovraccoperta', sv: 'Inbunden, skyddsomslag', da: 'Indbundet, smudsomslag', no: 'Innbundet, smussomslag', 'be-fr': 'Relié, jaquette', 'be-nl': 'Hardcover, stofomslag', la: '—' },
  cardboard_covers:  { en: 'Cardboard covers', fr: 'Cartonnage', de: 'Pappband', nl: 'Kartonnen band', es: 'Cartoné', pt: 'Cartonagem', it: 'Cartonato', sv: 'Pappband', da: 'Papbind', no: 'Pappband', 'be-fr': 'Cartonnage', 'be-nl': 'Kartonnen band', la: '—' },
  paper_boards:      { en: 'Paper boards', fr: 'Cartonnage papier', de: 'Pappband, Papierüberzug', nl: 'Papieren platten', es: 'Tapas de papel', pt: 'Capas de papel', it: 'Cartone ricoperto', sv: 'Pappband, papper', da: 'Papbind, papir', no: 'Pappband, papir', 'be-fr': 'Cartonnage papier', 'be-nl': 'Papieren platten', la: '—' },
  library_binding:   { en: 'Library binding', fr: 'Reliure de bibliothèque', de: 'Bibliothekseinband', nl: 'Bibliotheekband', es: 'Encuadernación de biblioteca', pt: 'Encadernação de biblioteca', it: 'Legatura da biblioteca', sv: 'Biblioteksband', da: 'Biblioteksbind', no: 'Biblioteksbind', 'be-fr': 'Reliure de bibliothèque', 'be-nl': 'Bibliotheekband', la: '—' },

  // ── Full leather ──
  full_leather_hardcover:  { en: 'Full leather', fr: 'Plein cuir', de: 'Ganzleder', nl: 'Volledig leer', es: 'Plena piel', pt: 'Pele inteira', it: 'Piena pelle', sv: 'Helskinnband', da: 'Hellæderbind', no: 'Helskinnbind', 'be-fr': 'Plein cuir', 'be-nl': 'Volledig leer', la: 'Lig. in corio' },
  full_leather_softcover:  { en: 'Limp leather', fr: 'Cuir souple', de: 'Leder, flexibel', nl: 'Slap leer', es: 'Piel flexible', pt: 'Pele flexível', it: 'Pelle molle', sv: 'Mjukt skinnband', da: 'Blødt læderbind', no: 'Mykt skinnbind', 'be-fr': 'Cuir souple', 'be-nl': 'Slap leer', la: 'Lig. in corio flex.' },

  // ── Full calf ──
  full_calf_hardcover:     { en: 'Full calf', fr: 'Plein veau', de: 'Ganzkalbleder', nl: 'Volledig kalfsleer', es: 'Plena becerra', pt: 'Bezerro inteiro', it: 'Piena vitella', sv: 'Helkalvskinn', da: 'Helkalvskind', no: 'Helkalvskinn', 'be-fr': 'Plein veau', 'be-nl': 'Volledig kalfsleer', la: 'Lig. in corio vitul.' },
  full_calf_softcover:     { en: 'Limp calf', fr: 'Veau souple', de: 'Kalbleder, flexibel', nl: 'Slap kalfsleer', es: 'Becerra flexible', pt: 'Bezerro flexível', it: 'Vitella molle', sv: 'Mjukt kalvskinn', da: 'Blødt kalvskind', no: 'Mykt kalvskinn', 'be-fr': 'Veau souple', 'be-nl': 'Slap kalfsleer', la: '—' },

  // ── Full vellum ──
  full_vellum_hardcover:   { en: 'Full vellum', fr: 'Plein vélin', de: 'Ganzpergament', nl: 'Volledig perkament', es: 'Pleno pergamino', pt: 'Pergaminho inteiro', it: 'Piena pergamena', sv: 'Helpergamentband', da: 'Helpergamentbind', no: 'Helpergamentbind', 'be-fr': 'Plein vélin', 'be-nl': 'Volledig perkament', la: 'Lig. in pergamena' },
  full_vellum_softcover:   { en: 'Limp vellum', fr: 'Vélin souple', de: 'Pergament, flexibel', nl: 'Slap perkament', es: 'Pergamino flexible', pt: 'Pergaminho flexível', it: 'Pergamena molle', sv: 'Mjukt pergamentband', da: 'Blødt pergamentbind', no: 'Mykt pergamentbind', 'be-fr': 'Vélin souple', 'be-nl': 'Slap perkament', la: 'Lig. in perg. flex.' },

  // ── Full morocco ──
  full_morocco_hardcover:  { en: 'Full morocco', fr: 'Plein maroquin', de: 'Ganzmaroquin', nl: 'Volledig marokijn', es: 'Pleno marroquín', pt: 'Marroquim inteiro', it: 'Pieno marocchino', sv: 'Helsaffianband', da: 'Helsaffianbind', no: 'Helsaffianbind', 'be-fr': 'Plein maroquin', 'be-nl': 'Volledig marokijn', la: 'Lig. in maroquin' },
  full_morocco_softcover:  { en: 'Limp morocco', fr: 'Maroquin souple', de: 'Maroquin, flexibel', nl: 'Slap marokijn', es: 'Marroquín flexible', pt: 'Marroquim flexível', it: 'Marocchino molle', sv: 'Mjukt saffianband', da: 'Blødt saffianbind', no: 'Mykt saffianbind', 'be-fr': 'Maroquin souple', 'be-nl': 'Slap marokijn', la: '—' },

  // ── Full faux leather ──
  full_faux_leather_hardcover: { en: 'Faux leather', fr: 'Simili-cuir', de: 'Kunstleder', nl: 'Kunstleer', es: 'Imitación piel', pt: 'Imitação pele', it: 'Finta pelle', sv: 'Konstläder', da: 'Kunstlæder', no: 'Kunstskinn', 'be-fr': 'Simili-cuir', 'be-nl': 'Kunstleer', la: '—' },
  full_faux_leather_softcover: { en: 'Limp faux leather', fr: 'Simili-cuir souple', de: 'Kunstleder, flexibel', nl: 'Slap kunstleer', es: 'Imitación piel flexible', pt: 'Imitação pele flexível', it: 'Finta pelle molle', sv: 'Mjukt konstläder', da: 'Blødt kunstlæder', no: 'Mykt kunstskinn', 'be-fr': 'Simili-cuir souple', 'be-nl': 'Slap kunstleer', la: '—' },
}

// ─── Cover Type Translations Part 2 ────────────────────────────────
// Cloth/fabric full bindings, partial bindings, limp bindings

// Add to COVER_TYPES (merged at runtime or extend object)
export const COVER_TYPES_2: Record<string, Record<CatalogLanguage, string>> = {
  // ── Full cloth/fabric ──
  full_cloth_hardcover:    { en: 'Cloth', fr: 'Toile', de: 'Leinen', nl: 'Linnen', es: 'Tela', pt: 'Tela', it: 'Tela', sv: 'Klotband', da: 'Shirting', no: 'Sjirtingbind', 'be-fr': 'Toile', 'be-nl': 'Linnen', la: '—' },
  full_cloth_softcover:    { en: 'Limp cloth', fr: 'Toile souple', de: 'Leinen, flexibel', nl: 'Slap linnen', es: 'Tela flexible', pt: 'Tela flexível', it: 'Tela molle', sv: 'Mjukt klotband', da: 'Blødt shirting', no: 'Mykt sjirtingbind', 'be-fr': 'Toile souple', 'be-nl': 'Slap linnen', la: '—' },
  full_buckram_hardcover:  { en: 'Buckram', fr: 'Bougran', de: 'Buckram', nl: 'Buckram', es: 'Buckram', pt: 'Buckram', it: 'Buckram', sv: 'Buckram', da: 'Buckram', no: 'Buckram', 'be-fr': 'Bougran', 'be-nl': 'Buckram', la: '—' },
  full_buckram_softcover:  { en: 'Limp buckram', fr: 'Bougran souple', de: 'Buckram, flexibel', nl: 'Slap buckram', es: 'Buckram flexible', pt: 'Buckram flexível', it: 'Buckram molle', sv: 'Mjukt buckram', da: 'Blødt buckram', no: 'Mykt buckram', 'be-fr': 'Bougran souple', 'be-nl': 'Slap buckram', la: '—' },
  full_linen_hardcover:    { en: 'Linen', fr: 'Lin', de: 'Leinen', nl: 'Linnen', es: 'Lino', pt: 'Linho', it: 'Lino', sv: 'Linneband', da: 'Linnedsbind', no: 'Linnbind', 'be-fr': 'Lin', 'be-nl': 'Linnen', la: '—' },
  full_linen_softcover:    { en: 'Limp linen', fr: 'Lin souple', de: 'Leinen, flexibel', nl: 'Slap linnen', es: 'Lino flexible', pt: 'Linho flexível', it: 'Lino molle', sv: 'Mjukt linneband', da: 'Blødt linnedsbind', no: 'Mykt linnbind', 'be-fr': 'Lin souple', 'be-nl': 'Slap linnen', la: '—' },
  full_silk_hardcover:     { en: 'Silk', fr: 'Soie', de: 'Seide', nl: 'Zijde', es: 'Seda', pt: 'Seda', it: 'Seta', sv: 'Sidenband', da: 'Silkebind', no: 'Silkebind', 'be-fr': 'Soie', 'be-nl': 'Zijde', la: '—' },
  full_silk_softcover:     { en: 'Limp silk', fr: 'Soie souple', de: 'Seide, flexibel', nl: 'Slap zijde', es: 'Seda flexible', pt: 'Seda flexível', it: 'Seta molle', sv: 'Mjukt sidenband', da: 'Blødt silkebind', no: 'Mykt silkebind', 'be-fr': 'Soie souple', 'be-nl': 'Slap zijde', la: '—' },
  full_canvas_hardcover:   { en: 'Canvas', fr: 'Toile', de: 'Segeltuch', nl: 'Canvas', es: 'Lona', pt: 'Lona', it: 'Tela grezza', sv: 'Canvasband', da: 'Lærredsbind', no: 'Lerretsbind', 'be-fr': 'Toile', 'be-nl': 'Canvas', la: '—' },
  full_canvas_softcover:   { en: 'Limp canvas', fr: 'Toile souple', de: 'Segeltuch, flexibel', nl: 'Slap canvas', es: 'Lona flexible', pt: 'Lona flexível', it: 'Tela grezza molle', sv: 'Mjukt canvasband', da: 'Blødt lærredsbind', no: 'Mykt lerretsbind', 'be-fr': 'Toile souple', 'be-nl': 'Slap canvas', la: '—' },
  full_moire_hardcover:    { en: 'Moiré', fr: 'Moiré', de: 'Moiré', nl: 'Moiré', es: 'Muaré', pt: 'Moiré', it: 'Moiré', sv: 'Moiréband', da: 'Moirébind', no: 'Moirébind', 'be-fr': 'Moiré', 'be-nl': 'Moiré', la: '—' },
  full_moire_softcover:    { en: 'Limp moiré', fr: 'Moiré souple', de: 'Moiré, flexibel', nl: 'Slap moiré', es: 'Muaré flexible', pt: 'Moiré flexível', it: 'Moiré molle', sv: 'Mjukt moiréband', da: 'Blødt moirébind', no: 'Mykt moirébind', 'be-fr': 'Moiré souple', 'be-nl': 'Slap moiré', la: '—' },

  // ── Quarter bindings ──
  quarter_leather_paper:   { en: 'Quarter leather, paper sides', fr: 'Quart de cuir, papier', de: 'Viertelleder, Papier', nl: 'Kwart leer, papier', es: 'Cuarto piel, papel', pt: 'Quarto pele, papel', it: 'Quarto pelle, carta', sv: 'Kvartskinnband, papper', da: 'Kvartlæderbind, papir', no: 'Kvartskinnbind, papir', 'be-fr': 'Quart de cuir, papier', 'be-nl': 'Kwart leer, papier', la: '—' },
  quarter_leather_cloth:   { en: 'Quarter leather, cloth sides', fr: 'Quart de cuir, toile', de: 'Viertelleder, Leinen', nl: 'Kwart leer, linnen', es: 'Cuarto piel, tela', pt: 'Quarto pele, tela', it: 'Quarto pelle, tela', sv: 'Kvartskinnband, klot', da: 'Kvartlæderbind, shirting', no: 'Kvartskinnbind, sjirting', 'be-fr': 'Quart de cuir, toile', 'be-nl': 'Kwart leer, linnen', la: '—' },
  quarter_leather_marbled: { en: 'Quarter leather, marbled boards', fr: 'Quart de cuir, plats marbrés', de: 'Viertelleder, Marmor', nl: 'Kwart leer, gemarmerd', es: 'Cuarto piel, planos jaspeados', pt: 'Quarto pele, marmoreado', it: 'Quarto pelle, piatti marmorizzati', sv: 'Kvartskinnband, marmorerat', da: 'Kvartlæderbind, marmoreret', no: 'Kvartskinnbind, marmorert', 'be-fr': 'Quart de cuir, plats marbrés', 'be-nl': 'Kwart leer, gemarmerd', la: '—' },
  quarter_morocco_paper:   { en: 'Quarter morocco, paper sides', fr: 'Quart de maroquin, papier', de: 'Viertelmaroquin, Papier', nl: 'Kwart marokijn, papier', es: 'Cuarto marroquín, papel', pt: 'Quarto marroquim, papel', it: 'Quarto marocchino, carta', sv: 'Kvartsaffianband, papper', da: 'Kvartsaffianbind, papir', no: 'Kvartsaffianbind, papir', 'be-fr': 'Quart de maroquin, papier', 'be-nl': 'Kwart marokijn, papier', la: '—' },
  quarter_morocco_cloth:   { en: 'Quarter morocco, cloth sides', fr: 'Quart de maroquin, toile', de: 'Viertelmaroquin, Leinen', nl: 'Kwart marokijn, linnen', es: 'Cuarto marroquín, tela', pt: 'Quarto marroquim, tela', it: 'Quarto marocchino, tela', sv: 'Kvartsaffianband, klot', da: 'Kvartsaffianbind, shirting', no: 'Kvartsaffianbind, sjirting', 'be-fr': 'Quart de maroquin, toile', 'be-nl': 'Kwart marokijn, linnen', la: '—' },

  // ── Half bindings ──
  half_leather_paper:      { en: 'Half leather, paper sides', fr: 'Demi-cuir, papier', de: 'Halbleder, Papier', nl: 'Half leer, papier', es: 'Media piel, papel', pt: 'Meia pele, papel', it: 'Mezza pelle, carta', sv: 'Halvskinnband, papper', da: 'Halvlæderbind, papir', no: 'Halvskinnbind, papir', 'be-fr': 'Demi-cuir, papier', 'be-nl': 'Half leer, papier', la: '—' },
  half_leather_cloth:      { en: 'Half leather, cloth sides', fr: 'Demi-cuir, toile', de: 'Halbleder, Leinen', nl: 'Half leer, linnen', es: 'Media piel, tela', pt: 'Meia pele, tela', it: 'Mezza pelle, tela', sv: 'Halvskinnband, klot', da: 'Halvlæderbind, shirting', no: 'Halvskinnbind, sjirting', 'be-fr': 'Demi-cuir, toile', 'be-nl': 'Half leer, linnen', la: '—' },
  half_leather_marbled:    { en: 'Half leather, marbled boards', fr: 'Demi-cuir, plats marbrés', de: 'Halbleder, Marmor', nl: 'Half leer, gemarmerd', es: 'Media piel, planos jaspeados', pt: 'Meia pele, marmoreado', it: 'Mezza pelle, piatti marmorizzati', sv: 'Halvskinnband, marmorerat', da: 'Halvlæderbind, marmoreret', no: 'Halvskinnbind, marmorert', 'be-fr': 'Demi-cuir, plats marbrés', 'be-nl': 'Half leer, gemarmerd', la: '—' },
  half_morocco_paper:      { en: 'Half morocco, paper sides', fr: 'Demi-maroquin, papier', de: 'Halbmaroquin, Papier', nl: 'Half marokijn, papier', es: 'Media marroquín, papel', pt: 'Meio marroquim, papel', it: 'Mezzo marocchino, carta', sv: 'Halvsaffianband, papper', da: 'Halvsaffianbind, papir', no: 'Halvsaffianbind, papir', 'be-fr': 'Demi-maroquin, papier', 'be-nl': 'Half marokijn, papier', la: '—' },
  half_morocco_cloth:      { en: 'Half morocco, cloth sides', fr: 'Demi-maroquin, toile', de: 'Halbmaroquin, Leinen', nl: 'Half marokijn, linnen', es: 'Media marroquín, tela', pt: 'Meio marroquim, tela', it: 'Mezzo marocchino, tela', sv: 'Halvsaffianband, klot', da: 'Halvsaffianbind, shirting', no: 'Halvsaffianbind, sjirting', 'be-fr': 'Demi-maroquin, toile', 'be-nl': 'Half marokijn, linnen', la: '—' },

  // ── Three-quarter bindings ──
  three_quarter_leather_paper:   { en: 'Three-quarter leather, paper', fr: 'Trois-quarts cuir, papier', de: 'Dreiviertelleder, Papier', nl: 'Driekwart leer, papier', es: 'Tres cuartos piel, papel', pt: 'Três quartos pele, papel', it: 'Tre quarti pelle, carta', sv: 'Trekvartsband, papper', da: 'Trekvartbind, papir', no: 'Trekvartbind, papir', 'be-fr': 'Trois-quarts cuir, papier', 'be-nl': 'Driekwart leer, papier', la: '—' },
  three_quarter_leather_cloth:   { en: 'Three-quarter leather, cloth', fr: 'Trois-quarts cuir, toile', de: 'Dreiviertelleder, Leinen', nl: 'Driekwart leer, linnen', es: 'Tres cuartos piel, tela', pt: 'Três quartos pele, tela', it: 'Tre quarti pelle, tela', sv: 'Trekvartsband, klot', da: 'Trekvartbind, shirting', no: 'Trekvartbind, sjirting', 'be-fr': 'Trois-quarts cuir, toile', 'be-nl': 'Driekwart leer, linnen', la: '—' },
  three_quarter_leather_marbled: { en: 'Three-quarter leather, marbled', fr: 'Trois-quarts cuir, marbré', de: 'Dreiviertelleder, Marmor', nl: 'Driekwart leer, gemarmerd', es: 'Tres cuartos piel, jaspeado', pt: 'Três quartos pele, marmoreado', it: 'Tre quarti pelle, marmorizzati', sv: 'Trekvartsband, marmorerat', da: 'Trekvartbind, marmoreret', no: 'Trekvartbind, marmorert', 'be-fr': 'Trois-quarts cuir, marbré', 'be-nl': 'Driekwart leer, gemarmerd', la: '—' },
  three_quarter_morocco_paper:   { en: 'Three-quarter morocco, paper', fr: 'Trois-quarts maroquin, papier', de: 'Dreiviertelmaroquin, Papier', nl: 'Driekwart marokijn, papier', es: 'Tres cuartos marroquín, papel', pt: 'Três quartos marroquim, papel', it: 'Tre quarti marocchino, carta', sv: 'Trekvartssaffianband, papper', da: 'Trekvartssaffianbind, papir', no: 'Trekvartssaffianbind, papir', 'be-fr': 'Trois-quarts maroquin, papier', 'be-nl': 'Driekwart marokijn, papier', la: '—' },
  three_quarter_morocco_cloth:   { en: 'Three-quarter morocco, cloth', fr: 'Trois-quarts maroquin, toile', de: 'Dreiviertelmaroquin, Leinen', nl: 'Driekwart marokijn, linnen', es: 'Tres cuartos marroquín, tela', pt: 'Três quartos marroquim, tela', it: 'Tre quarti marocchino, tela', sv: 'Trekvartssaffianband, klot', da: 'Trekvartssaffianbind, shirting', no: 'Trekvartssaffianbind, sjirting', 'be-fr': 'Trois-quarts maroquin, toile', 'be-nl': 'Driekwart marokijn, linnen', la: '—' },

  // ── Limp bindings ──
  limp_leather:  { en: 'Limp leather', fr: 'Cuir souple', de: 'Leder, flexibel', nl: 'Slap leer', es: 'Piel flexible', pt: 'Pele flexível', it: 'Pelle molle', sv: 'Mjukt skinnband', da: 'Blødt læderbind', no: 'Mykt skinnbind', 'be-fr': 'Cuir souple', 'be-nl': 'Slap leer', la: 'Lig. in corio flex.' },
  limp_vellum:   { en: 'Limp vellum', fr: 'Vélin souple', de: 'Pergament, flexibel', nl: 'Slap perkament', es: 'Pergamino flexible', pt: 'Pergaminho flexível', it: 'Pergamena molle', sv: 'Mjukt pergamentband', da: 'Blødt pergamentbind', no: 'Mykt pergamentbind', 'be-fr': 'Vélin souple', 'be-nl': 'Slap perkament', la: 'Lig. in perg. flex.' },
}

// Merge all cover types into one lookup
export const ALL_COVER_TYPES: Record<string, Record<CatalogLanguage, string>> = { ...COVER_TYPES, ...COVER_TYPES_2 }

// ─── Condition Grade Translations ───────────────────────────────────
// Maps condition names (from conditions table) to per-language display strings

export const CONDITION_GRADES: Record<string, Record<CatalogLanguage, string>> = {
  'As New':        { en: 'As new', fr: 'Comme neuf', de: 'Wie neu', nl: 'Als nieuw', es: 'Como nuevo', pt: 'Como novo', it: 'Come nuovo', sv: 'Som ny', da: 'Som ny', no: 'Som ny', 'be-fr': 'Comme neuf', 'be-nl': 'Als nieuw', la: 'Exemplar novum' },
  'Fine':          { en: 'Fine', fr: 'Parfait état', de: 'Sehr gut', nl: 'Uitstekend', es: 'Perfecto', pt: 'Óptimo', it: 'Ottimo', sv: 'Fint', da: 'Fint', no: 'Fint', 'be-fr': 'Parfait état', 'be-nl': 'Uitstekend', la: 'Exemplar pulchrum' },
  'Fine Plus':     { en: 'Fine plus', fr: 'Parfait état', de: 'Sehr gut', nl: 'Uitstekend', es: 'Perfecto', pt: 'Óptimo', it: 'Ottimo', sv: 'Fint', da: 'Fint', no: 'Fint', 'be-fr': 'Parfait état', 'be-nl': 'Uitstekend', la: 'Exemplar pulchrum' },
  'Near Fine':     { en: 'Near fine', fr: 'Très bon état', de: 'Fast sehr gut', nl: 'Vrijwel uitstekend', es: 'Casi perfecto', pt: 'Quase óptimo', it: 'Quasi ottimo', sv: 'Nästan fint', da: 'Næsten fint', no: 'Nesten fint', 'be-fr': 'Très bon état', 'be-nl': 'Vrijwel uitstekend', la: 'Exemplar fere pulchrum' },
  'Very Good Plus': { en: 'Very good plus', fr: 'Très bon état', de: 'Sehr gut', nl: 'Zeer goed', es: 'Muy bueno', pt: 'Muito bom', it: 'Molto buono', sv: 'Mycket gott', da: 'Meget godt', no: 'Meget godt', 'be-fr': 'Très bon état', 'be-nl': 'Zeer goed', la: 'Exemplar optimum' },
  'Very Good':     { en: 'Very good', fr: 'Bon état', de: 'Gut', nl: 'Zeer goed', es: 'Muy bueno', pt: 'Muito bom', it: 'Molto buono', sv: 'Mycket gott', da: 'Meget godt', no: 'Meget godt', 'be-fr': 'Bon état', 'be-nl': 'Zeer goed', la: 'Exemplar bonum' },
  'Good Plus':     { en: 'Good plus', fr: 'Assez bon état', de: 'Recht gut', nl: 'Goed', es: 'Bueno', pt: 'Bom', it: 'Buono', sv: 'Gott', da: 'Godt', no: 'Godt', 'be-fr': 'Assez bon état', 'be-nl': 'Goed', la: 'Exemplar satis bonum' },
  'Good':          { en: 'Good', fr: 'État correct', de: 'Befriedigend', nl: 'Goed', es: 'Bueno', pt: 'Bom', it: 'Buono', sv: 'Gott', da: 'Godt', no: 'Godt', 'be-fr': 'État correct', 'be-nl': 'Goed', la: 'Exemplar bonum' },
  'Good Minus':    { en: 'Good minus', fr: 'État passable', de: 'Noch befriedigend', nl: 'Redelijk', es: 'Aceptable', pt: 'Regular', it: 'Discreto', sv: 'Acceptabelt', da: 'Acceptabelt', no: 'Akseptabelt', 'be-fr': 'État passable', 'be-nl': 'Redelijk', la: 'Exemplar mediocre' },
  'Fair':          { en: 'Fair', fr: 'État moyen', de: 'Ausreichend', nl: 'Matig', es: 'Regular', pt: 'Regular', it: 'Mediocre', sv: 'Tillräckligt', da: 'Tilstrækkeligt', no: 'Tilstrekkelig', 'be-fr': 'État moyen', 'be-nl': 'Matig', la: 'Exemplar mediocre' },
  'Poor':          { en: 'Poor', fr: 'Mauvais état', de: 'Mangelhaft', nl: 'Slecht', es: 'Malo', pt: 'Mau', it: 'Scadente', sv: 'Dåligt', da: 'Dårligt', no: 'Dårlig', 'be-fr': 'Mauvais état', 'be-nl': 'Slecht', la: 'Exemplar mancum' },
  'Mint':          { en: 'Mint', fr: 'Neuf', de: 'Neuwertig', nl: 'Nieuwstaat', es: 'Impecable', pt: 'Impecável', it: 'Perfetto', sv: 'Nyskick', da: 'Nystand', no: 'Nystand', 'be-fr': 'Neuf', 'be-nl': 'Nieuwstaat', la: 'Exemplar perfectum' },
}

// ─── Text Block Condition ───────────────────────────────────────────

export const TEXT_BLOCK_CONDITIONS: Record<string, Record<CatalogLanguage, string>> = {
  tight:     { en: 'tight', fr: 'serré', de: 'fest', nl: 'strak', es: 'firme', pt: 'firme', it: 'saldo', sv: 'fast', da: 'fast', no: 'fast', 'be-fr': 'serré', 'be-nl': 'strak', la: 'firmum' },
  solid:     { en: 'solid', fr: 'solide', de: 'solide', nl: 'solide', es: 'sólido', pt: 'sólido', it: 'solido', sv: 'solid', da: 'solid', no: 'solid', 'be-fr': 'solide', 'be-nl': 'solide', la: 'solidum' },
  sound:     { en: 'sound', fr: 'bon', de: 'gut', nl: 'goed', es: 'bueno', pt: 'bom', it: 'buono', sv: 'bra', da: 'god', no: 'god', 'be-fr': 'bon', 'be-nl': 'goed', la: 'bonum' },
  tender:    { en: 'tender', fr: 'fragile', de: 'empfindlich', nl: 'kwetsbaar', es: 'frágil', pt: 'frágil', it: 'fragile', sv: 'ömtålig', da: 'skrøbelig', no: 'skjør', 'be-fr': 'fragile', 'be-nl': 'kwetsbaar', la: 'fragile' },
  shaken:    { en: 'shaken', fr: 'déboîté', de: 'gelockert', nl: 'los', es: 'flojo', pt: 'solto', it: 'allentato', sv: 'lös', da: 'løs', no: 'løs', 'be-fr': 'déboîté', 'be-nl': 'los', la: 'laxum' },
  loose:     { en: 'loose', fr: 'détaché', de: 'lose', nl: 'losgeraakt', es: 'suelto', pt: 'solto', it: 'staccato', sv: 'lös', da: 'løs', no: 'løs', 'be-fr': 'détaché', 'be-nl': 'losgeraakt', la: 'solutum' },
  detached:  { en: 'detached', fr: 'détaché', de: 'gelöst', nl: 'losgeraakt', es: 'desprendido', pt: 'destacado', it: 'staccato', sv: 'lossnad', da: 'løsnet', no: 'løsnet', 'be-fr': 'détaché', 'be-nl': 'losgeraakt', la: 'separatum' },
  broken:    { en: 'broken', fr: 'cassé', de: 'gebrochen', nl: 'gebroken', es: 'roto', pt: 'partido', it: 'rotto', sv: 'bruten', da: 'brudt', no: 'brutt', 'be-fr': 'cassé', 'be-nl': 'gebroken', la: 'fractum' },
  recased:   { en: 'recased', fr: 'remboîté', de: 'neu eingehängt', nl: 'opnieuw ingehangen', es: 'reencuadernado', pt: 'reencadernado', it: 'rincastonato', sv: 'omhängd', da: 'ombundet', no: 'ombundet', 'be-fr': 'remboîté', 'be-nl': 'opnieuw ingehangen', la: 'renovatum' },
  rebacked:  { en: 'rebacked', fr: 'dos refait', de: 'neu bezogen', nl: 'opnieuw gerugt', es: 'lomo restaurado', pt: 'lombada restaurada', it: 'dorso rifatto', sv: 'rygg omgjord', da: 'ryg omgjort', no: 'rygg omgjort', 'be-fr': 'dos refait', 'be-nl': 'opnieuw gerugt', la: 'dorso renovato' },
  rebound:   { en: 'rebound', fr: 'relié à nouveau', de: 'neu gebunden', nl: 'opnieuw gebonden', es: 'reencuadernado', pt: 'reencadernado', it: 'rilegato', sv: 'ombunden', da: 'ombundet', no: 'ombundet', 'be-fr': 'relié à nouveau', 'be-nl': 'opnieuw gebonden', la: 'de novo ligatum' },
}
