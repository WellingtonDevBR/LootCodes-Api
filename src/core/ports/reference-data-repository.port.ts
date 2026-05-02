import type { Platform, Region, Genre, FAQ, PlatformNavItem, PlatformFamily } from '../use-cases/products/product.types.js';

export interface PlatformNavItemGrouped {
  name: string;
  slug: string;
  code: string;
  icon_url: string | null;
  isFamily: boolean;
  showGenres: boolean;
  children?: { name: string; slug: string; code: string; icon_url: string | null }[];
}

export interface IReferenceDataRepository {
  getPlatforms(): Promise<Platform[]>;
  getRegions(): Promise<Region[]>;
  getGenres(): Promise<Genre[]>;
  getFAQs(): Promise<FAQ[]>;
  findPlatformBySlug(slug: string): Promise<Platform | null>;
  getPlatformNavItems(): Promise<PlatformNavItem[]>;
  getPlatformNavItemsWithVariants(): Promise<PlatformNavItemGrouped[]>;
  findPlatformFamilyBySlug(slug: string): Promise<PlatformFamily | null>;
}
