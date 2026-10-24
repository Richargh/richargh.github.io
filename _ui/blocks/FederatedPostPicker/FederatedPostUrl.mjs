export function mastodonInstanceOrigin(value) {
  const input = value.trim();
  const url = new URL(input.includes("://") ? input : `https://${input}`);
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash
    || !url.hostname.includes(".") || !/^[a-z0-9.-]+$/.test(url.hostname)
    || url.hostname.split(".").some((label) => !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))) {
    throw new Error("Enter an instance domain, for example mastodon.social.");
  }
  return url.origin;
}
