import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// This file is the ONLY place you import postgres/drizzle directly
const client = postgres(process.env.DATABASE_URL!);
export const DrizzleClient = drizzle(client);