import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema',  // Apunta al directorio, no a un archivo
  datasource: {
    url: process.env.DATABASE_URL || 'file:../../dev.db'
  },
  migrations: {
    path: './prisma/migrations'
  }
});
