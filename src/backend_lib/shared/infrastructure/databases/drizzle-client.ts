import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * Database Client Configuration
 * 
 * PERFORMANCE OPTIMIZATION:
 * - Connection pooling enabled with proper limits
 * - Connection reuse across requests (singleton pattern)
 * - Prepared statements cached for faster queries
 * - Idle timeout to prevent hanging connections
 * 
 * For production, consider using a connection pooler like:
 * - Supabase Connection Pooler (PgBouncer)
 * - AWS RDS Proxy
 * - Neon serverless driver
 */

// Configure postgres client with connection pooling
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Singleton postgres client with connection pooling
const client = postgres(connectionString, {
  // Maximum number of connections in the pool
  max: 10,
  
  // Connection timeout (30 seconds)
  connect_timeout: 30,
  
  // Idle connection timeout (30 seconds) - close idle connections
  idle_timeout: 30,
  
  // Maximum lifetime of a connection (30 minutes)
  max_lifetime: 60 * 30,
  
  // Prepare statements for better performance
  prepare: true,
  
  // Transform column names to camelCase
  transform: postgres.camel,
  
  // Log queries in development
  onnotice: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

// Create Drizzle instance (singleton - reused across requests)
export const DrizzleClient = drizzle(client);

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    await client.end({ timeout: 5 });
  });
}