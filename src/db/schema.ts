import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
};

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  ...timestamps,
});

export const todoGroups = pgTable('todo_groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  ...timestamps,
});

export const todoItems = pgTable('todo_items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  groupId: integer('group_id')
    .notNull()
    .references(() => todoGroups.id, { onDelete: 'cascade' }),
  description: varchar('description', { length: 1024 }).notNull(),
  isDone: boolean('is_done').notNull().default(false),
  dueDate: timestamp('due_date').notNull().defaultNow(),
  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type TodoGroup = typeof todoGroups.$inferSelect;
export type TodoItem = typeof todoItems.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type NewItem = typeof todoItems.$inferInsert;
export type NewGroup = typeof todoGroups.$inferInsert;
