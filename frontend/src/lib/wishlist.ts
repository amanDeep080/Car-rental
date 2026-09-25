const KEY = "velocira_wishlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  localStorage.setItem(KEY, JSON.stringify(slugs));
}

export function getWishlist(): string[] {
  return read();
}

export function isWishlisted(slug: string): boolean {
  return read().includes(slug);
}

export function toggleWishlist(slug: string): boolean {
  const current = read();
  const isIn = current.includes(slug);
  const next = isIn ? current.filter((s) => s !== slug) : [...current, slug];
  write(next);
  return !isIn;
}
