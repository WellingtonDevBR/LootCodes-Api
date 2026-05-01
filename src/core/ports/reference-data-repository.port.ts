import type { Platform, Region, Genre, FAQ } from '../services/products/product.types.js';

export interface IReferenceDataRepository {
  getPlatforms(): Promise<Platform[]>;
  getRegions(): Promise<Region[]>;
  getGenres(): Promise<Genre[]>;
  getFAQs(): Promise<FAQ[]>;
}
