import { 
  users, profiles, posts, comments, likes, resources, events,
  type User, type Profile, type Post, type Comment, type Like, type Resource, type Event,
  type InsertProfile, type InsertPost, type InsertComment, type InsertResource, type InsertEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile>;
  createProfile(profile: InsertProfile): Promise<Profile>;

  // Posts
  getPosts(limit?: number): Promise<(Post & { author: User; likesCount: number; commentsCount: number })[]>;
  getPost(id: number): Promise<(Post & { author: User; comments: (Comment & { author: User })[] }) | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: number): Promise<void>;

  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Likes
  getLike(postId: number, authorId: string): Promise<Like | undefined>;
  createLike(postId: number, authorId: string): Promise<void>;
  deleteLike(postId: number, authorId: string): Promise<void>;

  // Resources
  getResources(category?: string): Promise<(Resource & { author: User })[]>;
  createResource(resource: InsertResource): Promise<Resource>;

  // Events
  getEvents(): Promise<(Event & { author: User })[]>;
  createEvent(event: InsertEvent): Promise<Event>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile> {
    // Check if profile exists
    const existing = await this.getProfile(userId);
    if (!existing) {
      // Create if not exists (upsert logic handled by caller or here)
      // For simplicity, we assume profile exists or we create it.
      // If we are updating, we must have userId.
      // Note: userId is in updates? No, it's param.
      // Let's try to insert if not exists (upsert)
      const [profile] = await db.insert(profiles)
        .values({ userId, ...updates } as InsertProfile)
        .onConflictDoUpdate({ target: profiles.userId, set: updates })
        .returning();
      return profile;
    }
    const [profile] = await db.update(profiles)
      .set(updates)
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  async getPosts(limit: number = 20): Promise<(Post & { author: User; likesCount: number; commentsCount: number })[]> {
    const results = await db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      limit,
      with: {
        author: true,
      }
    });
    // Drizzle doesn't automatically count relations in findMany without raw SQL or count(), 
    // but for MVP we will return likesCount/commentsCount columns which are stored in posts table.
    // We update these counts when liking/commenting.
    return results as (Post & { author: User; likesCount: number; commentsCount: number })[];
  }

  async getPost(id: number): Promise<(Post & { author: User; comments: (Comment & { author: User })[] }) | undefined> {
    const result = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        author: true,
        comments: {
          with: { author: true },
          orderBy: [desc(comments.createdAt)],
        },
      }
    });
    return result as any;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    // Increment comments count
    await db.execute(sql`UPDATE posts SET comments_count = comments_count + 1 WHERE id = ${comment.postId}`);
    return newComment;
  }

  async getLike(postId: number, authorId: string): Promise<Like | undefined> {
    const [like] = await db.select().from(likes).where(and(eq(likes.postId, postId), eq(likes.authorId, authorId)));
    return like;
  }

  async createLike(postId: number, authorId: string): Promise<void> {
    await db.insert(likes).values({ postId, authorId });
    await db.execute(sql`UPDATE posts SET likes_count = likes_count + 1 WHERE id = ${postId}`);
  }

  async deleteLike(postId: number, authorId: string): Promise<void> {
    await db.delete(likes).where(and(eq(likes.postId, postId), eq(likes.authorId, authorId)));
    await db.execute(sql`UPDATE posts SET likes_count = likes_count - 1 WHERE id = ${postId}`);
  }

  async getResources(category?: string): Promise<(Resource & { author: User })[]> {
    const where = category ? eq(resources.category, category) : undefined;
    const results = await db.query.resources.findMany({
      where,
      orderBy: [desc(resources.createdAt)],
      with: { author: true }
    });
    return results as any;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  async getEvents(): Promise<(Event & { author: User })[]> {
    const results = await db.query.events.findMany({
      orderBy: [desc(events.date)],
      with: { author: true }
    });
    return results as any;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }
}

import { sql } from "drizzle-orm";
export const storage = new DatabaseStorage();
