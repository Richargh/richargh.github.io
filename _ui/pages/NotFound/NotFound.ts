import { renderLayout } from "../../layouts/SiteLayout/SiteLayout.ts";

export function renderNotFoundPageDocument(): string {
  return renderLayout({
    title: "404",
    urlPath: "/404.html",
    type: "website",
    showBackToHome: true,
    content: `<h1>404</h1>

<p><strong>Page not found :(</strong></p>
<p>The requested page could not be found.</p>

<button class="not-found-home" type="button" onclick="window.location='/'">Go Home</button>`,
  });
}
