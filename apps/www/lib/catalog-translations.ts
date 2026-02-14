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
