import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./replit_integrations/auth";
import { db } from "./db";
import { users, profiles } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper for Zod errors
  const handleZodError = (res: any, err: any) => {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        message: err.errors[0].message,
        field: err.errors[0].path.join('.'),
      });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  // Profiles
  app.get(api.profiles.get.path, async (req, res) => {
    const profile = await storage.getProfile(req.params.userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  app.put(api.profiles.update.path, isAuthenticated, async (req: any, res) => {
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const input = api.profiles.update.input.parse(req.body);
      const profile = await storage.updateProfile(req.user.id, input);
      res.json(profile);
    } catch (err) {
      handleZodError(res, err);
    }
  });

  // Posts
  app.get(api.posts.list.path, async (req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  app.post(api.posts.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.posts.create.input.parse(req.body);
      const post = await storage.createPost({ ...input, authorId: req.user.id });
      res.status(201).json(post);
    } catch (err) {
      handleZodError(res, err);
    }
  });

  app.get(api.posts.get.path, async (req, res) => {
    const post = await storage.getPost(Number(req.params.id));
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  });

  app.delete(api.posts.delete.path, isAuthenticated, async (req: any, res) => {
    const post = await storage.getPost(Number(req.params.id));
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.authorId !== req.user.id) {
       const profile = await storage.getProfile(req.user.id);
       if (profile?.role !== 'admin') {
         return res.status(403).json({ message: "Forbidden" });
       }
    }
    await storage.deletePost(Number(req.params.id));
    res.status(204).send();
  });

  // Comments
  app.post(api.comments.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.comments.create.input.parse(req.body);
      const comment = await storage.createComment({ 
        ...input, 
        postId: Number(req.params.postId), 
        authorId: req.user.id 
      });
      res.status(201).json(comment);
    } catch (err) {
      handleZodError(res, err);
    }
  });

  // Likes
  app.post(api.likes.toggle.path, isAuthenticated, async (req: any, res) => {
    const postId = Number(req.params.postId);
    const existing = await storage.getLike(postId, req.user.id);
    if (existing) {
      await storage.deleteLike(postId, req.user.id);
      res.json({ liked: false });
    } else {
      await storage.createLike(postId, req.user.id);
      res.json({ liked: true });
    }
  });

  // Resources
  app.get(api.resources.list.path, async (req, res) => {
    const category = req.query.category as string;
    const resources = await storage.getResources(category);
    res.json(resources);
  });

  app.post(api.resources.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.resources.create.input.parse(req.body);
      const resource = await storage.createResource({ ...input, authorId: req.user.id });
      res.status(201).json(resource);
    } catch (err) {
      handleZodError(res, err);
    }
  });

  // Events
  app.get(api.events.list.path, async (req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.post(api.events.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.events.create.input.parse({
        ...req.body,
        date: new Date(req.body.date)
      });
      const event = await storage.createEvent({ ...input, authorId: req.user.id });
      res.status(201).json(event);
    } catch (err) {
      handleZodError(res, err);
    }
  });

  // Seed Data
  try {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      console.log("Seeding database...");
      const [user] = await db.insert(users).values({
        email: "demo@campusconnect.com",
        firstName: "Demo",
        lastName: "Student",
        profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      }).returning();

      await storage.createProfile({
        userId: user.id,
        bio: "Computer Science Student | Loves Coding",
        college: "Replit University",
        course: "B.Tech CS",
        year: "3rd Year",
        role: "student",
      });

      await storage.createPost({
        authorId: user.id,
        content: "Excited for the upcoming Hackathon! 🚀 #Events",
        type: "text",
        tags: ["Events", "Hackathon"],
      });

      await storage.createPost({
        authorId: user.id,
        content: "Check out these cool notes on React Hooks.",
        type: "link",
        tags: ["React", "Notes"],
        mediaUrls: ["https://react.dev"],
      });

      await storage.createResource({
        authorId: user.id,
        title: "Data Structures Notes",
        description: "Comprehensive notes for DSA.",
        category: "Notes",
        fileUrl: "https://example.com/dsa-notes.pdf",
      });
      
      await storage.createEvent({
        authorId: user.id,
        title: "Tech Fest 2025",
        description: "Annual tech festival of Replit University.",
        date: new Date("2025-04-15"),
        location: "Main Auditorium",
      });
      console.log("Database seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }

  return httpServer;
}
