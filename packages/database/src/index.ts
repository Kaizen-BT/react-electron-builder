/**
 * --------------------
 * Main Database Module
 * --------------------
 */

import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema-barrel";

interface SetupDatabaseProps {
  sqliteFilePath: string;
  migrationsPath: string;
}

export type AppDatabase = BetterSQLite3Database<typeof schema>;

/**
 * Sets up better-sqlite3 driver, connects database and
 * apply migrations
 *
 * @param {SetupDatabaseProps} props
 * @returns {Promise<AppDatabase>}
 * @link https://orm.drizzle.team/docs/kit-overview for more info on
 * migrations
 */
export async function connectDatabase({
  sqliteFilePath,
  migrationsPath,
}: SetupDatabaseProps): Promise<AppDatabase> {
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
    throw new Response("Database error occurred");
  }
}
