import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";

// Date column defaulting to creation time
export const defaultDateField = (name: string) =>
  integer(name, { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`);

// Date column not null
export const notNullDefaultDateField = (name: string = "dateCol") =>
  defaultDateField(name).notNull();

export const nameField = (name: string) => text().notNull().default(name);

export const baseShape = {
  id: integer().primaryKey({ autoIncrement: true }),

  // Entity descriptors
  description: text().default("A cool description"),
  urgency: text({ enum: ["Non-Critical", "Important", "Critical"] })
    .notNull()
    .default("Non-Critical"),
  dueDate: notNullDefaultDateField("dueDate"),

  // The following dates will likely be readonly
  startDate: notNullDefaultDateField("startDate"),
  createdAt: notNullDefaultDateField("createdAt"),

  // UI fields... might change to use store instead
  icon: text(),
};
