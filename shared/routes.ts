import { z } from 'zod';
import { insertProfileSchema, insertPostSchema, insertCommentSchema, insertResourceSchema, insertEventSchema, profiles, posts, comments, resources, events, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  profiles: {
    get: {
      method: 'GET' as const,
      path: '/api/profiles/:userId',
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/profiles/:userId',
      input: insertProfileSchema.partial(),
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  posts: {
    list: {
      method: 'GET' as const,
      path: '/api/posts',
      input: z.object({
        cursor: z.string().optional(),
        limit: z.string().optional(),
        type: z.enum(['text', 'image', 'pdf', 'link']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof posts.$inferSelect & { author: typeof users.$inferSelect; likesCount: number; commentsCount: number }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/posts',
      input: insertPostSchema,
      responses: {
        201: z.custom<typeof posts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/posts/:id',
      responses: {
        200: z.custom<typeof posts.$inferSelect & { author: typeof users.$inferSelect; comments: (typeof comments.$inferSelect & { author: typeof users.$inferSelect })[] }>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/posts/:id',
      responses: {
        204: z.void(),
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  comments: {
    create: {
      method: 'POST' as const,
      path: '/api/posts/:postId/comments',
      input: insertCommentSchema.pick({ content: true }),
      responses: {
        201: z.custom<typeof comments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  likes: {
    toggle: {
      method: 'POST' as const,
      path: '/api/posts/:postId/like',
      responses: {
        200: z.object({ liked: z.boolean(), likesCount: z.number() }),
      },
    },
  },
  resources: {
    list: {
      method: 'GET' as const,
      path: '/api/resources',
      input: z.object({
        category: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof resources.$inferSelect & { author: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/resources',
      input: insertResourceSchema,
      responses: {
        201: z.custom<typeof resources.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events',
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect & { author: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/events',
      input: insertEventSchema,
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
