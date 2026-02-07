// Book Status
export type BookStatus = 
  | 'in_collection'
  | 'sold'
  | 'lent'
  | 'ordered'
  | 'lost';

export const BOOK_STATUSES: Record<BookStatus, { label: string; color: string }> = {
  in_collection: { label: 'In Collection', color: 'bg-green-600' },
  sold: { label: 'Sold', color: 'bg-gray-600' },
  lent: { label: 'Lent', color: 'bg-yellow-600' },
  ordered: { label: 'Ordered', color: 'bg-purple-600' },
  lost: { label: 'Lost', color: 'bg-red-600' },
};

// Contributor Roles
export type ContributorRole =
  | 'author'
  | 'co_author'
  | 'artist'
  | 'colorist'
  | 'cover_artist'
  | 'editor'
  | 'illustrator'
  | 'photographer'
  | 'translator'
  | 'pseudonym';

export const CONTRIBUTOR_ROLES: Record<ContributorRole, string> = {
  author: 'Author',
  co_author: 'Co-Author',
  artist: 'Artist',
  colorist: 'Colorist',
  cover_artist: 'Cover Artist',
  editor: 'Editor',
  illustrator: 'Illustrator',
  photographer: 'Photographer',
  translator: 'Translator',
  pseudonym: 'Pseudonym',
};

// Conditions (Standard antiquarian grading)
export type BookCondition = 'as_new' | 'fine' | 'very_good' | 'good' | 'fair' | 'poor';

export const BOOK_CONDITIONS: Record<BookCondition, { label: string; abbrev: string; description: string }> = {
  as_new: { 
    label: 'As New', 
    abbrev: 'AN',
    description: 'The book is in the same immaculate condition as when it was published.'
  },
  fine: { 
    label: 'Fine', 
    abbrev: 'F',
    description: 'A nearly perfect copy with no defects.'
  },
  very_good: { 
    label: 'Very Good', 
    abbrev: 'VG',
    description: 'Shows some small signs of wear but no tears or major defects.'
  },
  good: { 
    label: 'Good', 
    abbrev: 'G',
    description: 'Average used copy with all pages intact.'
  },
  fair: { 
    label: 'Fair', 
    abbrev: 'Fr',
    description: 'Worn but intact. May have loose pages or damage.'
  },
  poor: { 
    label: 'Poor', 
    abbrev: 'P',
    description: 'Reading copy only. May be missing pages or have significant damage.'
  },
};

// Dust Jacket Status
export const DUST_JACKET_OPTIONS = ['Yes', 'No', 'None issued'] as const;
export type DustJacketStatus = typeof DUST_JACKET_OPTIONS[number];

// Signed Status
export const SIGNED_OPTIONS = ['Yes', 'No', 'Inscribed'] as const;
export type SignedStatus = typeof SIGNED_OPTIONS[number];

// Size Measurements
export const SIZE_MEASUREMENTS = ['cm', 'inches'] as const;
export type SizeMeasurement = typeof SIZE_MEASUREMENTS[number];

// Weight Measurements
export const WEIGHT_MEASUREMENTS = ['g', 'kg', 'oz', 'lbs'] as const;
export type WeightMeasurement = typeof WEIGHT_MEASUREMENTS[number];

// Common Currencies
export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
] as const;

// Languages
export const LANGUAGES = [
  'Dutch',
  'English', 
  'French',
  'German',
  'Italian',
  'Latin',
  'Spanish',
  'Portuguese',
  'Russian',
  'Japanese',
  'Chinese',
  'Arabic',
  'Greek',
  'Hebrew',
  'Other',
] as const;

// Cover Formats
export const COVER_FORMATS = [
  'Hardcover',
  'Softcover / Paperback',
  'Leather',
  'Half Leather',
  'Cloth',
  'Boards',
  'Wrappers',
  'Stapled',
  'Spiral Bound',
  'Other',
] as const;
