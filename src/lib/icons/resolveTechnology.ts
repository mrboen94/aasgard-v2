import { technologies, type Technology } from "../../data/technology-registry";

export type ResolvedTechnology = Technology & {
  unknown?: boolean;
};

export function resolveTechnology(id: string): ResolvedTechnology {
  const technology = technologies[id as keyof typeof technologies];

  if (technology) {
    return technology;
  }

  return {
    id,
    label: id,
    icon: "custom/placeholder",
    unknown: true
  };
}
