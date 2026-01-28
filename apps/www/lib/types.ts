import { 
  BookStatus, 
  ContributorRole, 
  BookCondition,
  DustJacketStatus,
  SignedStatus,
  SizeMeasurement,
  WeightMeasurement 
} from './constants';

// ============================================
// CORE ENTITIES
// ============================================

export interface Book {
  // Identity
  id: string;
  collectionId?: string;
  
  // Main Info
  title: string;
  subTitle?: string;
  originalTitle?: string;
  language?: string;
  originalLanguage?: string;
  series?: string;
  status: BookStatus;
  
  // Imprint (Publishing Info)
  publisher?: string;
  placePublished?: string;
  releaseYear?: string;
  printer?: string;
  placePrinted?: string;
  
  // Edition Info
  edition?: string;
  impression?: string;
  issueState?: string;
  editionComments?: string;
  
  // Physical Description
  volumes?: string;
  pages?: number;
  pagination?: string;
  bookFormat?: string;
  coverFormat?: string;
  binding?: string;
  condition?: BookCondition;
  conditionDescription?: string;
  height?: number;
  width?: number;
  sizeMeasurement?: SizeMeasurement;
  weight?: number;
  weightMeasurement?: WeightMeasurement;
  dustJacket?: DustJacketStatus;
  signed?: SignedStatus;
  
  // Identifiers
  isbn10?: string;
  isbn13?: string;
  ocn?: string;
  lccn?: string;
  
  // Classification
  ddc?: string;
  lcc?: string;
  udc?: string;
  bisac?: string;
  topic?: string;
  
  // Storage Location
  location?: string;
  shelf?: string;
  shelfSection?: string;
  
  // Value & Acquisition
  purchasedFrom?: string;
  pricePaid?: number;
  currencyPaid?: string;
  purchaseDate?: string;
  purchaseNotes?: string;
  lowestPrice?: number;
  highestPrice?: number;
  salesPrice?: number;
  estimatedValue?: number;
  currencyPrices?: string;
  
  // Extended Info
  bibliography?: string;
  provenance?: string;
  privateComments?: string;
  signatures?: string;
  illustrations?: string;
  summary?: string;
  catalogEntry?: string;
  
  // Record Info
  dateAdded: string;
  timeAdded?: string;
  lastChanged: string;
  addedBy?: string;
  changedBy?: string;
}

export interface Contributor {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  groupName?: string;
}

export interface BookContributor {
  id: string;
  bookId: string;
  contributorId: string;
  role: ContributorRole;
}

export interface BookImage {
  id: string;
  bookId: string;
  imageUrl: string;
  bookPart: string;
  comments?: string;
  sortOrder?: number;
}

// ============================================
// REFERENCE TABLES
// ============================================

export interface Binding {
  id: string;
  name: string;
  alias?: string;
  description?: string;
  group?: string;
  imageUrl?: string;
}

export interface BookFormat {
  id: string;
  name: string;
  abbreviation: string;
  leaves?: number;
  pages?: number;
  widthInches?: string;
  heightInches?: string;
  widthCm?: string;
  heightCm?: string;
  type?: string;
}

export interface Condition {
  id: string;
  abbreviation: string;
  name: string;
  description?: string;
}

export interface BookPart {
  id: string;
  matter: 'Front' | 'Body' | 'Back';
  purpose: string;
}

export interface DeweyClassification {
  ddcId: string;
  firstSummary: string;
  secondSummary: string;
  thirdSummary: string;
}

export interface BISACCode {
  code: string;
  subject: string;
}

// ============================================
// AGGREGATED / VIEW TYPES
// ============================================

export interface BookWithContributors extends Book {
  authors: string[];
  coAuthors: string[];
  illustrators: string[];
  translators: string[];
  editors: string[];
  artists: string[];
  photographers: string[];
  coverArtists: string[];
  colorists: string[];
}

export interface BookListItem {
  id: string;
  title: string;
  subTitle?: string;
  authors: string[];
  publisher?: string;
  releaseYear?: string;
  condition?: BookCondition;
  status: BookStatus;
  coverImageUrl?: string;
  location?: string;
}

// ============================================
// FILTERS & SEARCH
// ============================================

export interface BookFilters {
  search?: string;
  status?: BookStatus[];
  condition?: BookCondition[];
  language?: string[];
  publisher?: string[];
  location?: string[];
  yearFrom?: number;
  yearTo?: number;
  hasDustJacket?: boolean;
  isSigned?: boolean;
}

export interface SortOption {
  field: keyof Book;
  direction: 'asc' | 'desc';
}
