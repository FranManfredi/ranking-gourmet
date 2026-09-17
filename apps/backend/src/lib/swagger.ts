import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import fs from 'node:fs';
import path from 'node:path';

const apiDocGlobs = (() => {
  const srcEntry = path.resolve(process.cwd(), 'src/domains/restaurant/routes/restaurant.routes.ts');
  const distSrcEntry = path.resolve(process.cwd(), 'dist/src/domains/restaurant/routes/restaurant.routes.js');
  const distEntry = path.resolve(process.cwd(), 'dist/domains/restaurant/routes/restaurant.routes.js');

  if (fs.existsSync(srcEntry)) {
    return [path.resolve(process.cwd(), 'src/**/*.routes.ts')];
  }

  if (fs.existsSync(distSrcEntry)) {
    return [path.resolve(process.cwd(), 'dist/src/**/*.routes.js')];
  }

  return [path.resolve(process.cwd(), 'dist/**/*.routes.js')];
})();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ranking Gourmet API',
      version: '1.0.0',
      description: 'API for managing restaurant rankings, reviews, and visits',
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Restaurant: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string', default: 'MAR DEL PLATA' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Visit: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            visitedAt: { type: 'string', format: 'date-time' },
            restaurantId: { type: 'integer' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            reviewerId: { type: 'integer' },
            visitId: { type: 'integer' },
            foodRating: { type: 'number' },
            beverageRating: { type: 'number' },
            serviceRating: { type: 'number' },
            valueRating: { type: 'number' },
            ambianceRating: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Reviewer: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            surname: { type: 'string' },
          },
        },
      },
    },
  },
  apis: apiDocGlobs,
};

type SwaggerSpec = ReturnType<typeof swaggerJsdoc> & {
  servers?: Array<{ url: string; description: string }>;
};

const specs = swaggerJsdoc(options) as SwaggerSpec;
const publicApiUrl = process.env.PUBLIC_API_URL || process.env.BETTER_AUTH_BASE_URL;

if (publicApiUrl) {
  specs.servers = [
    {
      url: publicApiUrl,
      description: 'Public server',
    },
  ];
}

export const setupSwagger = (app: Express) => {
  app.get('/api-docs.json', (_req, res) => {
    res.json(specs);
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  console.log('Swagger docs available at http://localhost:8080/api-docs');
};
