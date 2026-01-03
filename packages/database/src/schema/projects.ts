import { sqliteTable } from "drizzle-orm/sqlite-core";
import { baseShape, nameField } from "../schema-helpers";

export const projects = sqliteTable("projects", {
  ...baseShape,
  name: nameField("Awesome Project"),
});
