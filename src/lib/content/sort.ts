type EntryWithDate = {
  data: {
    date: Date;
    featured?: boolean;
  };
};

export function byDateDesc<T extends EntryWithDate>(a: T, b: T) {
  return b.data.date.getTime() - a.data.date.getTime();
}

export function byFeaturedThenDate<T extends EntryWithDate>(a: T, b: T) {
  if (a.data.featured !== b.data.featured) {
    return a.data.featured ? -1 : 1;
  }

  return byDateDesc(a, b);
}
