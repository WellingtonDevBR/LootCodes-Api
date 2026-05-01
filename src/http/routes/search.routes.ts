import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { SearchUseCase } from '../../core/use-cases/search/search.use-case.js';
import type { SearchFilters } from '../../core/use-cases/search/search.types.js';
import { searchQuerySchema } from '../schemas/search.schema.js';

interface SearchQuery {
  q: string;
  category?: string;
  platform?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  page?: number;
  hitsPerPage?: number;
}

export async function searchRoutes(app: FastifyInstance) {
  app.get<{ Querystring: SearchQuery }>(
    '/',
    { schema: { querystring: searchQuerySchema } },
    async (request, reply) => {
      const uc = container.resolve<SearchUseCase>(UC_TOKENS.Search);
      const { q, page, hitsPerPage, ...rest } = request.query;

      const filters: SearchFilters = {};
      if (rest.category) filters.category = rest.category;
      if (rest.platform) filters.platform = rest.platform;
      if (rest.priceMin !== undefined) filters.priceMin = rest.priceMin;
      if (rest.priceMax !== undefined) filters.priceMax = rest.priceMax;
      if (rest.inStock !== undefined) filters.inStock = rest.inStock;

      const result = await uc.execute(q, filters, page, hitsPerPage);
      return reply.send(result);
    },
  );
}
