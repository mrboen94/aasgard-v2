export function getStrapiURL(path = "") {
  return `${
    process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"
  }${path}`;
}

export function isEmptyObject(obj: string[]) {
  return !Object.keys(obj).length;
}

// Helper to make GET requests to Strapi
export async function fetchAPI(path: string) {
  const requestUrl = getStrapiURL(path);
  const response = await fetch(requestUrl);
  const data = response.status === 200 ? await response.json() : null;
  return data;
}
