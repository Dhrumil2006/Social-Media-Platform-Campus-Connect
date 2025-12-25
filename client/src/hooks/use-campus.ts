import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { 
  type InsertPost, 
  type InsertComment, 
  type InsertResource, 
  type InsertEvent,
  type InsertProfile
} from "@shared/schema";

// --- Profiles ---
export function useProfile(userId: string) {
  return useQuery({
    queryKey: [api.profiles.get.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.profiles.get.path, { userId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profiles.get.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<InsertProfile> }) => {
      const url = buildUrl(api.profiles.update.path, { userId });
      const res = await fetch(url, {
        method: api.profiles.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.profiles.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.get.path, userId] });
    },
  });
}

// --- Posts ---
export function usePosts(params?: { type?: 'text' | 'image' | 'pdf' | 'link' }) {
  return useQuery({
    queryKey: [api.posts.list.path, params],
    queryFn: async () => {
      const url = params 
        ? `${api.posts.list.path}?type=${params.type}` 
        : api.posts.list.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return api.posts.list.responses[200].parse(await res.json());
    },
  });
}

export function usePost(id: number) {
  return useQuery({
    queryKey: [api.posts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.posts.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch post");
      return api.posts.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPost) => {
      const res = await fetch(api.posts.create.path, {
        method: api.posts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create post");
      return api.posts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.posts.delete.path, { id });
      const res = await fetch(url, { 
        method: api.posts.delete.method, 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
    },
  });
}

// --- Comments ---
export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const url = buildUrl(api.comments.create.path, { postId });
      const res = await fetch(url, {
        method: api.comments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to post comment");
      return api.comments.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: [api.posts.get.path, postId] });
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
    },
  });
}

// --- Likes ---
export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: number) => {
      const url = buildUrl(api.likes.toggle.path, { postId });
      const res = await fetch(url, {
        method: api.likes.toggle.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to toggle like");
      return api.likes.toggle.responses[200].parse(await res.json());
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.posts.get.path, postId] });
    },
  });
}

// --- Resources ---
export function useResources(category?: string) {
  return useQuery({
    queryKey: [api.resources.list.path, category],
    queryFn: async () => {
      const url = category 
        ? `${api.resources.list.path}?category=${category}` 
        : api.resources.list.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch resources");
      return api.resources.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertResource) => {
      const res = await fetch(api.resources.create.path, {
        method: api.resources.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create resource");
      return api.resources.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resources.list.path] });
    },
  });
}

// --- Events ---
export function useEvents() {
  return useQuery({
    queryKey: [api.events.list.path],
    queryFn: async () => {
      const res = await fetch(api.events.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch events");
      return api.events.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertEvent) => {
      // Ensure date is a string if it isn't already handled by Zod
      const payload = { ...data, date: new Date(data.date).toISOString() };
      const res = await fetch(api.events.create.path, {
        method: api.events.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create event");
      return api.events.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
    },
  });
}
