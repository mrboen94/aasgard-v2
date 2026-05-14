import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const date = z.coerce.date();

const articles = defineCollection({
  loader: glob({ pattern: "**/index.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    date,
    updated: date.optional(),
    published: z.boolean().default(true),
    template: z.enum(["standard", "technical", "interactive"]).default("standard"),
    tags: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
    cover: z.string().optional(),
    canonical: z.string().optional()
  })
});

const experiments = defineCollection({
  loader: glob({ pattern: "**/index.{md,mdx}", base: "./src/content/experiments" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    date,
    status: z.enum(["prototype", "stable", "archived"]).default("prototype"),
    technologies: z.array(z.string()).default([]),
    interactive: z.boolean().default(false),
    repository: z.url().optional(),
    externalUrl: z.url().optional()
  })
});

const work = defineCollection({
  loader: glob({ pattern: "**/index.{md,mdx}", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    date,
    featured: z.boolean().default(false),
    logo: z.string().optional(),
    link: z
      .object({
        label: z.string(),
        href: z.url()
      })
      .optional(),
    technologies: z.array(z.string()).default([]),
    accent: z.string().optional()
  })
});

const photoProjects = defineCollection({
  loader: glob({ pattern: "**/index.{md,mdx}", base: "./src/content/photo-projects" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    date,
    cover: z.string().optional(),
    camera: z.string().optional(),
    location: z.string().optional()
  })
});

const videoProjects = defineCollection({
  loader: glob({ pattern: "**/index.{md,mdx}", base: "./src/content/video-projects" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    date,
    provider: z.enum(["youtube", "vimeo", "mux", "local"]).default("youtube"),
    videoId: z.string(),
    poster: z.string().optional()
  })
});

export const collections = {
  articles,
  experiments,
  work,
  photoProjects,
  videoProjects
};
