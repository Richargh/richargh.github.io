export const site = {
  title: "Richard's Blog",
  name: "Richard Groß",
  userDescription: "IT Archaeologist",
  url: "https://richargh.de",
  profilePic: "/assets/img/profile.jpg",
  favicon: "/assets/img/favicon.ico",
  feedUrl: "https://richargh.de/feed.xml",
} as const;

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
