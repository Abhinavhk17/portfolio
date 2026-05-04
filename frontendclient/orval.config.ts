import { defineConfig } from 'orval';

export default defineConfig({
  portfolioApi: {
    input: {
      target: 'http://localhost:8082/v3/api-docs',
    },
    output: {
      mode: 'tags-split',
      target: 'src/app/api/generated',
      schemas: 'src/app/api/models',
      client: 'angular',
      mock: false,
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: 'src/app/api/custom-http-client.ts',
          name: 'customHttpClient',
        },
      },
    },
  },
});
