import { getCollection, type CollectionEntry } from "astro:content";
import { byDateDesc, byFeaturedThenDate } from "./sort";

type EntryWithSlug = {
  data: {
    slug: string;
  };
};

export type ArticleEntry = CollectionEntry<"articles">;
export type ExperimentEntry = CollectionEntry<"experiments">;
export type WorkEntry = CollectionEntry<"work">;
export type PhotoProjectEntry = CollectionEntry<"photoProjects">;
export type VideoProjectEntry = CollectionEntry<"videoProjects">;

function findBySlug<T extends EntryWithSlug>(entries: T[], slug: string) {
  return entries.find((entry) => entry.data.slug === slug);
}

export async function getArticles() {
  const entries = await getCollection("articles", ({ data }) => data.published !== false);
  return entries.sort(byDateDesc);
}

export async function getArticleBySlug(slug: string) {
  return findBySlug(await getArticles(), slug);
}

export async function getExperiments() {
  const entries = await getCollection("experiments");
  return entries.sort(byDateDesc);
}

export async function getExperimentBySlug(slug: string) {
  return findBySlug(await getExperiments(), slug);
}

export async function getWorkEntries() {
  const entries = await getCollection("work");
  return entries.sort(byFeaturedThenDate);
}

export async function getWorkBySlug(slug: string) {
  return findBySlug(await getWorkEntries(), slug);
}

export async function getPhotoProjects() {
  const entries = await getCollection("photoProjects");
  return entries.sort(byDateDesc);
}

export async function getPhotoProjectBySlug(slug: string) {
  return findBySlug(await getPhotoProjects(), slug);
}

export async function getVideoProjects() {
  const entries = await getCollection("videoProjects");
  return entries.sort(byDateDesc);
}

export async function getVideoProjectBySlug(slug: string) {
  return findBySlug(await getVideoProjects(), slug);
}
