export const site = {
  title: "Richard's Blog",
  name: "Richard Groß",
  tagLine: "IT Archaeology: Mend Software · Create Options · Increase ROI",
  url: "https://richargh.de",
  profilePic: "/assets/img/profile.jpg",
  favicon: "/assets/img/favicon.ico",
  feedUrl: "https://richargh.de/feed.xml",
  noObligationCoffeeUrl: "https://bookings.cloud.microsoft/bookwithme/user/a517f5573623407f884f655d3eeebc8d@maibornwolff.de?anonymous&ismsaljsauthenabled&ep=plink",
} as const;

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
