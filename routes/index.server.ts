export const title = "Richargh's Blog";
export const paragraph = "This is the smallest possible Mastro bootstrap page for the blog migration.";

export function render(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <p>${paragraph}</p>
  </main>
</body>
</html>`;
}
