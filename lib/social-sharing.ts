export function socialShareUrls(url: string, text: string): { blueSky: string; linkedIn: string } {
  const postText = `${text}\n${url}`;
  const blueSky = new URL("https://bsky.app/intent/compose");
  blueSky.searchParams.set("text", postText);
  const linkedIn = new URL("https://www.linkedin.com/sharing/share-offsite/");
  linkedIn.searchParams.set("url", url);
  return { blueSky: blueSky.href, linkedIn: linkedIn.href };
}
