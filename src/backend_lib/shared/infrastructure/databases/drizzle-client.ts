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

type GlobalDb = {
  client?: ReturnType<typeof postgres>;
};

const globalForDb = globalThis as unknown as GlobalDb;

// Singleton postgres client with connection pooling
const client =  globalForDb.client ?? postgres(connectionString, {
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

// Save to global
if (!globalForDb.client) {
  globalForDb.client = client;
}

// Create Drizzle instance (singleton - reused across requests)
export const DrizzleClient = drizzle(client, {
  // Enable query logging only in development
  logger: process.env.NODE_ENV === 'development',
  
  /**
   * FUTURE: Custom Logger for Database Logging
   * --------------------------------------------
   * You can replace the boolean logger with a custom logger object
   * that writes to a database, file, or external service:
   * 
   * @example
   * logger: {
   *   logQuery: async (query: string, params: unknown[]) => {
   *     // Write to audit log table
   *     await db.insert(queryLogsTable).values({
   *       query,
   *       params: JSON.stringify(params),
   *       timestamp: new Date(),
   *       userId: getCurrentUserId(), // From context
   *     });
   *     
   *     // Or send to external monitoring (DataDog, Sentry, etc.)
   *     monitoring.logQuery({ query, params, timestamp: Date.now() });
   *   },
   * }
   * 
   * PRODUCTION BEST PRACTICES:
   * --------------------------
   * 1. Use async queue/background job to avoid blocking queries
   * 2. Implement try-catch to prevent logging failures from breaking queries
   * 3. Add rate limiting to prevent log spam
   * 4. Consider sampling (log 1% of queries, or slow queries only)
   * 5. Use separate DB connection pool for logs
   * 
   * @example Production-safe implementation:
   * logger: {
   *   logQuery: (query: string, params: unknown[]) => {
   *     // Fire and forget - don't await
   *     queueLogToDB(query, params).catch(err => {
   *       // Silent fail - logging should never break the app
   *       console.error('Failed to log query:', err);
   *     });
   *   },
   * }
   * 
   * Use cases:
   * - Audit trails (who ran what query and when)
   * - Performance monitoring (slow query detection)
   * - Security analysis (suspicious query patterns)
   * - Compliance requirements (GDPR, HIPAA query logs)
   */
});

// Graceful shutdown handler
if (typeof process !== 'undefined' && !process.listenerCount('SIGTERM')) {
  process.on('SIGTERM', async () => {
    await client.end({ timeout: 5 });
  });
}