import type { CodegenConfig } from '@graphql-codegen/cli';

const scalars = {
  DateTime: 'string',
  Decimal: 'string',
  JSON: 'unknown',
  UUID: 'string',
  NaiveTime: 'string',
};

const config: CodegenConfig = {
  ignoreNoDocuments: true,
  generates: {
    './src/core/gql/': {
      schema: './src/generated/schema.graphql',
      documents: ['./src/gql/**/*.ts'],
      preset: 'client',
      presetConfig: { fragmentMasking: false },
      config: {
        strictScalars: true,
        scalars,
        documentMode: 'string',
      },
    },
  },
};

export default config;
