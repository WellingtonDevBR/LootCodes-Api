import type { Platform, Region, Genre, FAQ, PlatformNavItem, PlatformFamily } from '../use-cases/products/product.types.js';

export interface IReferenceDataRepository {
  getPlatforms(): Promise<Platform[]>;
  getRegions(): Promise<Region[]>;
  getGenres(): Promise<Genre[]>;
  getFAQs(): Promise<FAQ[]>;
  findPlatformBySlug(slug: string): Promise<Platform | null>;
  getPlatformNavItems(): Promise<PlatformNavItem[]>;
  findPlatformFamilyBySlug(slug: string): Promise<PlatformFamily | null>;
}
