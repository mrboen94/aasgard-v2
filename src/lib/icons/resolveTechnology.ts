import { technologies, type Technology } from "../../data/technology-registry";

export type ResolvedTechnology = Technology & {
  unknown?: boolean;
};

export type IconListItem = {
  icon: string;
  id: string;
  label: string;
  muted?: boolean;
  revealLabelInDev?: boolean;
  title?: string;
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

export function resolveTechnologyItems(ids: string[]): IconListItem[] {
  return ids.map((id) => {
    const technology = resolveTechnology(id);

    return {
      icon: technology.icon,
      id,
      label: technology.unknown ? `Unknown: ${id}` : technology.label,
      muted: technology.unknown,
      revealLabelInDev: technology.unknown,
      title: technology.label
    };
  });
}
