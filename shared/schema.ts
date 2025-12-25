import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// Profiles table - extends User with app-specific data
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  bio: text("bio"),
  college: text("college"),
  course: text("course"),
  year: text("year"),
  role: text("role", { enum: ["student", "admin"] }).default("student"),
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));

// Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  type: text("type", { enum: ["text", "image", "pdf", "link"] }).default("text"),
  mediaUrls: text("media_urls").array(),
  tags: text("tags").array(),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
}));

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

// Likes table
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [likes.authorId],
    references: [users.id],
  }),
}));

// Resources table
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // e.g., "Notes", "PDFs", "Links"
  fileUrl: text("file_url").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resourcesRelations = relations(resources, ({ one }) => ({
  author: one(users, {
    fields: [resources.authorId],
    references: [users.id],
  }),
}));

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventsRelations = relations(events, ({ one }) => ({
  author: one(users, {
    fields: [events.authorId],
    references: [users.id],
  }),
}));

// Zod Schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, userId: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, authorId: true, likesCount: true, commentsCount: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, authorId: true, createdAt: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, authorId: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, authorId: true, createdAt: true });

// Types
export type Profile = typeof profiles.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type Event = typeof events.$inferSelect;
