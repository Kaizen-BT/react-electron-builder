/**
 * --------------------
 * Main Database Module
 * --------------------
 */

import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle } from "drizzle-orm/better-sqlite3";

interface SetupDatabaseProps {
  sqliteFilePath: string;
  migrationsPath: string;
  schema: Record<string, unknown>;
}

export type AppDatabase<T extends Record<string, unknown>> =
  BetterSQLite3Database<T>;

/**
 * Sets up the driver for the SQLite database and applies any migrations
 * needed
 *
 * @param {SetupDatabaseProps} props
 * @returns {Promise<AppDatabase<typeof schema>>}
 */
export async function connectDatabase({
  sqliteFilePath,
  migrationsPath,
  schema,
}: SetupDatabaseProps): Promise<AppDatabase<typeof schema>> {
  // Driver & Setups
  try {
    const driver = new Database(sqliteFilePath);

    // FK & Journal mode changes
    driver.pragma("foreign_keys = ON");
    driver.pragma("journal_mode = WAL");

    // Setup ORM and apply migrations
    const db = drizzle(driver, { schema });
    migrate(db, { migrationsFolder: migrationsPath });

    return db;
  } catch (error) {
    console.error(error, "Failed to initialize database");
  }
}
